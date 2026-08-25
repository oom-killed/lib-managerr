// Package plex provides a minimal client for talking to a Plex Media
// Server — currently just enough to verify a connection's credentials.
package plex

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type Config struct {
	Host  string
	Port  int
	SSL   bool
	Token string
}

// Ping verifies that a Plex server is reachable and the token is valid, by
// calling /identity rather than "/" — Maintainerr's client does the same,
// specifically to avoid reverse-proxy redirects on the root path.
func Ping(ctx context.Context, cfg Config) error {
	scheme := "http"
	if cfg.SSL {
		scheme = "https"
	}
	url := fmt.Sprintf("%s://%s:%d/identity", scheme, cfg.Host, cfg.Port)

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Plex-Token", cfg.Token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("plex server responded with status %d", resp.StatusCode)
	}
	return nil
}
