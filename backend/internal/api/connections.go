// Package api holds the HTTP handlers for the application's domain data
// (as opposed to cmd/lib-managerr/main.go's health/static-file concerns).
package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/oom-killed/lib-managerr/ent"
	"github.com/oom-killed/lib-managerr/ent/connection"
	"github.com/oom-killed/lib-managerr/internal/logging"
	"github.com/oom-killed/lib-managerr/internal/plex"
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

// RegisterConnectionRoutes wires the Connection endpoints onto mux.
func RegisterConnectionRoutes(mux *http.ServeMux, client *ent.Client) {
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
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
