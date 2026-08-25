// Package plex provides a minimal client for talking to a Plex Media
// Server — currently just enough to verify a connection's credentials and
// list its library sections.
package plex

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Config struct {
	Host  string
	Port  int
	SSL   bool
	Token string
}

func (cfg Config) baseURL() string {
	scheme := "http"
	if cfg.SSL {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s:%d", scheme, cfg.Host, cfg.Port)
}

// get performs an authenticated GET against path (e.g. "/identity"),
// returning the raw response body. Callers own decoding it.
func get(ctx context.Context, cfg Config, path string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, cfg.baseURL()+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Plex-Token", cfg.Token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("plex server responded with status %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

// Ping verifies that a Plex server is reachable and the token is valid, by
// calling /identity rather than "/" — Maintainerr's client does the same,
// specifically to avoid reverse-proxy redirects on the root path.
func Ping(ctx context.Context, cfg Config) error {
	_, err := get(ctx, cfg, "/identity")
	return err
}

// Library is one section (e.g. "Movies", "TV Shows") on a Plex server.
type Library struct {
	Key   string `json:"key"`
	Title string `json:"title"`
	Type  string `json:"type"`
}

type librarySectionsResponse struct {
	MediaContainer struct {
		Directory []struct {
			Key   string `json:"key"`
			Title string `json:"title"`
			Type  string `json:"type"`
		} `json:"Directory"`
	} `json:"MediaContainer"`
}

// ListLibraries fetches the server's library sections via /library/sections.
func ListLibraries(ctx context.Context, cfg Config) ([]Library, error) {
	body, err := get(ctx, cfg, "/library/sections")
	if err != nil {
		return nil, err
	}

	var parsed librarySectionsResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("parse library sections response: %w", err)
	}

	libraries := make([]Library, 0, len(parsed.MediaContainer.Directory))
	for _, d := range parsed.MediaContainer.Directory {
		libraries = append(libraries, Library{Key: d.Key, Title: d.Title, Type: d.Type})
	}
	return libraries, nil
}
