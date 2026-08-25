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
	"net/url"
	"strconv"
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

// Item is one piece of media (a movie, a show, ...) within a library section.
type Item struct {
	Key   string `json:"key"`
	Title string `json:"title"`
	Year  int    `json:"year,omitempty"`
	Type  string `json:"type"`
}

type libraryItemsResponse struct {
	MediaContainer struct {
		TotalSize int `json:"totalSize"`
		Metadata  []struct {
			RatingKey string `json:"ratingKey"`
			Title     string `json:"title"`
			Year      int    `json:"year"`
			Type      string `json:"type"`
		} `json:"Metadata"`
	} `json:"MediaContainer"`
}

// ListLibraryItems fetches a page of media items from one library section,
// via /library/sections/{key}/all, using Plex's X-Plex-Container-Start/
// X-Plex-Container-Size query-param pagination convention. Returns the
// page of items plus the section's total item count.
func ListLibraryItems(ctx context.Context, cfg Config, sectionKey string, offset, limit int) ([]Item, int, error) {
	q := url.Values{}
	q.Set("X-Plex-Container-Start", strconv.Itoa(offset))
	q.Set("X-Plex-Container-Size", strconv.Itoa(limit))
	path := "/library/sections/" + url.PathEscape(sectionKey) + "/all?" + q.Encode()

	body, err := get(ctx, cfg, path)
	if err != nil {
		return nil, 0, err
	}

	var parsed libraryItemsResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, 0, fmt.Errorf("parse library items response: %w", err)
	}

	items := make([]Item, 0, len(parsed.MediaContainer.Metadata))
	for _, m := range parsed.MediaContainer.Metadata {
		items = append(items, Item{Key: m.RatingKey, Title: m.Title, Year: m.Year, Type: m.Type})
	}
	return items, parsed.MediaContainer.TotalSize, nil
}
