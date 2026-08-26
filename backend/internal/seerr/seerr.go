// Package seerr provides a minimal client for talking to a Seerr instance
// (Overseerr/Jellyseerr) — currently just enough to verify a connection's
// credentials.
package seerr

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type Config struct {
	Host   string
	Port   int
	SSL    bool
	APIKey string
}

func (cfg Config) baseURL() string {
	scheme := "http"
	if cfg.SSL {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s:%d", scheme, cfg.Host, cfg.Port)
}

// Ping verifies that a Seerr instance is reachable and the API key is
// valid, via /api/v1/status — Seerr's equivalent of a health/identity
// check.
func Ping(ctx context.Context, cfg Config) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, cfg.baseURL()+"/api/v1/status", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Api-Key", cfg.APIKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("seerr responded with status %d", resp.StatusCode)
	}
	return nil
}
