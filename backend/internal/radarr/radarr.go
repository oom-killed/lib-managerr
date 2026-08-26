// Package radarr provides a minimal client for talking to a Radarr
// instance — verifying credentials, and fetching movie/quality-profile
// data to enrich items pulled from a media server.
package radarr

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
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

// get performs an authenticated GET against path (e.g. "/api/v3/movie"),
// returning the raw response body. Callers own decoding it.
func get(ctx context.Context, cfg Config, path string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, cfg.baseURL()+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Api-Key", cfg.APIKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("radarr responded with status %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

// Ping verifies that a Radarr instance is reachable and the API key is
// valid, via /api/v3/system/status — Radarr's equivalent of a health/
// identity check.
func Ping(ctx context.Context, cfg Config) error {
	_, err := get(ctx, cfg, "/api/v3/system/status")
	return err
}

// Movie is one entry in Radarr's tracked movie list.
type Movie struct {
	TmdbID           int  `json:"tmdbId"`
	Monitored        bool `json:"monitored"`
	QualityProfileID int  `json:"qualityProfileId"`
}

// ListMovies fetches every movie Radarr is tracking, via /api/v3/movie.
func ListMovies(ctx context.Context, cfg Config) ([]Movie, error) {
	body, err := get(ctx, cfg, "/api/v3/movie")
	if err != nil {
		return nil, err
	}

	var movies []Movie
	if err := json.Unmarshal(body, &movies); err != nil {
		return nil, fmt.Errorf("parse movie list response: %w", err)
	}
	return movies, nil
}

// QualityProfile is one of Radarr's configured quality profiles (e.g.
// "HD-1080p"). A Movie references one by QualityProfileID.
type QualityProfile struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// ListQualityProfiles fetches Radarr's configured quality profiles, via
// /api/v3/qualityprofile.
func ListQualityProfiles(ctx context.Context, cfg Config) ([]QualityProfile, error) {
	body, err := get(ctx, cfg, "/api/v3/qualityprofile")
	if err != nil {
		return nil, err
	}

	var profiles []QualityProfile
	if err := json.Unmarshal(body, &profiles); err != nil {
		return nil, fmt.Errorf("parse quality profile response: %w", err)
	}
	return profiles, nil
}
