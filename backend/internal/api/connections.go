// Package api holds the HTTP handlers for the application's domain data
// (as opposed to cmd/lib-managerr/main.go's health/static-file concerns).
package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/oom-killed/lib-managerr/ent"
	"github.com/oom-killed/lib-managerr/ent/connection"
	"github.com/oom-killed/lib-managerr/internal/logging"
	"github.com/oom-killed/lib-managerr/internal/plex"
	"github.com/oom-killed/lib-managerr/internal/radarr"
	"github.com/oom-killed/lib-managerr/internal/sonarr"
)

type connectionInput struct {
	Type  connection.Type `json:"type"`
	Name  string          `json:"name"`
	Host  string          `json:"host"`
	Port  int             `json:"port"`
	SSL   bool            `json:"ssl"`
	Token string          `json:"token"`
}

type testConnectionInput struct {
	Type  connection.Type `json:"type"`
	Host  string          `json:"host"`
	Port  int             `json:"port"`
	SSL   bool            `json:"ssl"`
	Token string          `json:"token"`
}

type testConnectionResult struct {
	OK    bool   `json:"ok"`
	Error string `json:"error,omitempty"`
}

// testConnectionType dispatches to the client for in.Type. This is the
// extensibility seam for future connection types: a new type is a new case
// here plus a new client package, not a restructuring of the handlers.
func testConnectionType(ctx context.Context, in testConnectionInput) testConnectionResult {
	switch in.Type {
	case connection.TypePlex:
		if err := plex.Ping(ctx, plex.Config{Host: in.Host, Port: in.Port, SSL: in.SSL, Token: in.Token}); err != nil {
			return testConnectionResult{OK: false, Error: err.Error()}
		}
		return testConnectionResult{OK: true}
	case connection.TypeRadarr:
		if err := radarr.Ping(ctx, radarr.Config{Host: in.Host, Port: in.Port, SSL: in.SSL, APIKey: in.Token}); err != nil {
			return testConnectionResult{OK: false, Error: err.Error()}
		}
		return testConnectionResult{OK: true}
	case connection.TypeSonarr:
		if err := sonarr.Ping(ctx, sonarr.Config{Host: in.Host, Port: in.Port, SSL: in.SSL, APIKey: in.Token}); err != nil {
			return testConnectionResult{OK: false, Error: err.Error()}
		}
		return testConnectionResult{OK: true}
	default:
		return testConnectionResult{OK: false, Error: fmt.Sprintf("unsupported connection type %q", in.Type)}
	}
}

// listLibrariesForConnection dispatches to the client for conn.Type. Same
// extensibility seam as testConnectionType.
func listLibrariesForConnection(ctx context.Context, conn *ent.Connection) ([]plex.Library, error) {
	switch conn.Type {
	case connection.TypePlex:
		return plex.ListLibraries(ctx, plex.Config{Host: conn.Host, Port: conn.Port, SSL: conn.Ssl, Token: conn.Token})
	default:
		return nil, fmt.Errorf("unsupported connection type %q", conn.Type)
	}
}

// listItemsForConnection dispatches to the client for conn.Type. Same
// extensibility seam as testConnectionType.
func listItemsForConnection(ctx context.Context, conn *ent.Connection, libraryKey string, offset, limit int) ([]plex.Item, int, error) {
	switch conn.Type {
	case connection.TypePlex:
		return plex.ListLibraryItems(ctx, plex.Config{Host: conn.Host, Port: conn.Port, SSL: conn.Ssl, Token: conn.Token}, libraryKey, offset, limit)
	default:
		return nil, 0, fmt.Errorf("unsupported connection type %q", conn.Type)
	}
}

// radarrInfo is the subset of Radarr's movie data worth showing alongside
// a Plex movie item. Plex remains the source of truth for what's actually
// in the library — this only adds Radarr's tracking metadata, not
// file-presence info Plex already conveys by the item existing at all.
// Tracked distinguishes "Radarr doesn't have this movie at all" from
// "Radarr has it but it's unmonitored" — both are meaningfully different
// from each other, so this is always set (not omitted) once Radarr was
// successfully reachable, even when there's no match.
type radarrInfo struct {
	Tracked        bool   `json:"tracked"`
	Monitored      bool   `json:"monitored,omitempty"`
	QualityProfile string `json:"qualityProfile,omitempty"`
}

type itemOut struct {
	plex.Item
	Radarr *radarrInfo `json:"radarr,omitempty"`
}

// enrichWithRadarr adds Radarr tracking info to every movie item, matched
// by TMDB id, whenever a Radarr connection is configured and reachable.
// The Radarr field is left nil (omitted) only when we genuinely can't
// determine tracked status at all — no Radarr connection configured, or
// Radarr unreachable — since asserting "not tracked" there would be a
// guess, not a fact. This never fails the underlying library-items
// request; it just leaves items unenriched on any of those failures.
func enrichWithRadarr(ctx context.Context, client *ent.Client, radarrCache *radarr.Cache, logger *slog.Logger, items []plex.Item) []itemOut {
	out := make([]itemOut, len(items))
	for i, it := range items {
		out[i] = itemOut{Item: it}
	}

	radarrConn, err := client.Connection.Query().Where(connection.TypeEQ(connection.TypeRadarr)).First(ctx)
	if err != nil {
		if !ent.IsNotFound(err) {
			logger.Warn("radarr enrichment: lookup connection failed", "error", err)
		}
		return out
	}

	cfg := radarr.Config{Host: radarrConn.Host, Port: radarrConn.Port, SSL: radarrConn.Ssl, APIKey: radarrConn.Token}

	movies, profiles, err := radarrCache.GetMoviesAndProfiles(ctx, cfg)
	if err != nil {
		logger.Warn("radarr enrichment: fetch movies/profiles failed", "error", err)
		return out
	}

	profileNames := make(map[int]string, len(profiles))
	for _, p := range profiles {
		profileNames[p.ID] = p.Name
	}
	byTmdbID := make(map[int]radarr.Movie, len(movies))
	for _, m := range movies {
		byTmdbID[m.TmdbID] = m
	}

	for i := range out {
		if out[i].Type != "movie" {
			continue
		}
		m, ok := byTmdbID[out[i].TmdbID] // TmdbID zero-value (no guid) just won't match, same as any other miss
		if !ok {
			out[i].Radarr = &radarrInfo{Tracked: false}
			continue
		}
		out[i].Radarr = &radarrInfo{Tracked: true, Monitored: m.Monitored, QualityProfile: profileNames[m.QualityProfileID]}
	}
	return out
}

type libraryItemsResult struct {
	Items  []itemOut `json:"items"`
	Total  int       `json:"total"`
	Offset int       `json:"offset"`
	Limit  int       `json:"limit"`
}

const defaultLibraryItemsLimit = 20

// RegisterConnectionRoutes wires the Connection endpoints onto mux.
func RegisterConnectionRoutes(mux *http.ServeMux, client *ent.Client, radarrCache *radarr.Cache) {
	mux.HandleFunc("GET /api/connections", func(w http.ResponseWriter, r *http.Request) {
		conns, err := client.Connection.Query().All(r.Context())
		if err != nil {
			logging.FromContext(r.Context()).Error("list connections", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, conns)
	})

	mux.HandleFunc("POST /api/connections", func(w http.ResponseWriter, r *http.Request) {
		var in connectionInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		conn, err := client.Connection.Create().
			SetType(in.Type).
			SetName(in.Name).
			SetHost(in.Host).
			SetPort(in.Port).
			SetSsl(in.SSL).
			SetToken(in.Token).
			Save(r.Context())
		if err != nil {
			logging.FromContext(r.Context()).Warn("create connection failed", "error", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		logging.FromContext(r.Context()).Info("connection created",
			"connection_id", conn.ID, "connection_type", conn.Type)
		writeJSON(w, http.StatusCreated, conn)
	})

	mux.HandleFunc("PUT /api/connections/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			http.Error(w, "invalid connection id", http.StatusBadRequest)
			return
		}

		var in connectionInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		update := client.Connection.UpdateOneID(id).
			SetName(in.Name).
			SetHost(in.Host).
			SetPort(in.Port).
			SetSsl(in.SSL)
		// An empty token means "leave the existing token unchanged" — the
		// API never returns the current token, so there's no other way for
		// a client to submit "no change" versus "clear it".
		if in.Token != "" {
			update = update.SetToken(in.Token)
		}

		conn, err := update.Save(r.Context())
		if err != nil {
			logger := logging.FromContext(r.Context()).With("connection_id", id)
			if ent.IsNotFound(err) {
				logger.Warn("update connection: not found")
				http.Error(w, "connection not found", http.StatusNotFound)
				return
			}
			var validationErr *ent.ValidationError
			if errors.As(err, &validationErr) {
				logger.Warn("update connection failed", "error", err)
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			logger.Error("update connection failed", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		logging.FromContext(r.Context()).Info("connection updated", "connection_id", conn.ID)
		writeJSON(w, http.StatusOK, conn)
	})

	// For a not-yet-saved connection: the token can only come from the
	// request, since there's nothing persisted to fall back to.
	mux.HandleFunc("POST /api/connections/test", func(w http.ResponseWriter, r *http.Request) {
		var in testConnectionInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}
		result := testConnectionType(r.Context(), in)
		logging.FromContext(r.Context()).Debug("connection test",
			"connection_type", in.Type, "ok", result.OK, "error", result.Error)
		writeJSON(w, http.StatusOK, result)
	})

	// For an existing connection: an empty token in the request falls back
	// to the stored token, matching PUT's "blank means unchanged" contract.
	mux.HandleFunc("POST /api/connections/{id}/test", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			http.Error(w, "invalid connection id", http.StatusBadRequest)
			return
		}

		var in testConnectionInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		logger := logging.FromContext(r.Context()).With("connection_id", id)

		if in.Token == "" {
			existing, err := client.Connection.Get(r.Context(), id)
			if err != nil {
				if ent.IsNotFound(err) {
					logger.Warn("test connection: not found")
					http.Error(w, "connection not found", http.StatusNotFound)
					return
				}
				logger.Error("test connection failed", "error", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			// Only fall back to the stored token when testing the connection
			// as actually saved. Otherwise a blank token plus a different
			// host/port/ssl would make the server send the real credential
			// to an arbitrary caller-supplied destination.
			if in.Host != existing.Host || in.Port != existing.Port || in.SSL != existing.Ssl {
				logger.Warn("test connection: blank token with mismatched host/port/ssl rejected")
				writeJSON(w, http.StatusOK, testConnectionResult{
					OK:    false,
					Error: "token is required when testing a different host, port, or SSL setting than what's saved",
				})
				return
			}
			in.Token = existing.Token
		}

		result := testConnectionType(r.Context(), in)
		logger.Debug("connection test", "connection_type", in.Type, "ok", result.OK, "error", result.Error)
		writeJSON(w, http.StatusOK, result)
	})

	mux.HandleFunc("GET /api/connections/{id}/libraries", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			http.Error(w, "invalid connection id", http.StatusBadRequest)
			return
		}

		logger := logging.FromContext(r.Context()).With("connection_id", id)

		conn, err := client.Connection.Get(r.Context(), id)
		if err != nil {
			if ent.IsNotFound(err) {
				logger.Warn("list libraries: connection not found")
				http.Error(w, "connection not found", http.StatusNotFound)
				return
			}
			logger.Error("list libraries failed", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		libraries, err := listLibrariesForConnection(r.Context(), conn)
		if err != nil {
			logger.Warn("list libraries: upstream error", "error", err)
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		writeJSON(w, http.StatusOK, libraries)
	})

	mux.HandleFunc("GET /api/connections/{id}/libraries/{key}/items", func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			http.Error(w, "invalid connection id", http.StatusBadRequest)
			return
		}
		libraryKey := r.PathValue("key")

		offset := 0
		if v := r.URL.Query().Get("offset"); v != "" {
			if n, err := strconv.Atoi(v); err == nil && n >= 0 {
				offset = n
			}
		}
		limit := defaultLibraryItemsLimit
		if v := r.URL.Query().Get("limit"); v != "" {
			if n, err := strconv.Atoi(v); err == nil && n > 0 {
				limit = n
			}
		}

		logger := logging.FromContext(r.Context()).With("connection_id", id, "library_key", libraryKey)

		conn, err := client.Connection.Get(r.Context(), id)
		if err != nil {
			if ent.IsNotFound(err) {
				logger.Warn("list library items: connection not found")
				http.Error(w, "connection not found", http.StatusNotFound)
				return
			}
			logger.Error("list library items failed", "error", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		items, total, err := listItemsForConnection(r.Context(), conn, libraryKey, offset, limit)
		if err != nil {
			logger.Warn("list library items: upstream error", "error", err)
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		enriched := enrichWithRadarr(r.Context(), client, radarrCache, logger, items)
		writeJSON(w, http.StatusOK, libraryItemsResult{Items: enriched, Total: total, Offset: offset, Limit: limit})
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
