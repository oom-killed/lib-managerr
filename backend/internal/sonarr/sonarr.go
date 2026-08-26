// Package sonarr provides a minimal client for talking to a Sonarr
// instance — currently just enough to verify a connection's credentials.
package sonarr

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

// get performs an authenticated GET against path (e.g. "/api/v3/series"),
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
		return nil, fmt.Errorf("sonarr responded with status %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

// Ping verifies that a Sonarr instance is reachable and the API key is
// valid, via /api/v3/system/status — Sonarr's equivalent of a health/
// identity check (same API shape as Radarr, both being *arr apps).
func Ping(ctx context.Context, cfg Config) error {
	_, err := get(ctx, cfg, "/api/v3/system/status")
	return err
}

// Series is one entry in Sonarr's tracked show list. Matched against Plex
// show items by TvdbID, not TmdbID — Sonarr's Series resource carries a
// tvdbId, not a tmdbId.
type Series struct {
	TvdbID           int  `json:"tvdbId"`
	Monitored        bool `json:"monitored"`
	QualityProfileID int  `json:"qualityProfileId"`
}

// ListSeries fetches every show Sonarr is tracking, via /api/v3/series.
func ListSeries(ctx context.Context, cfg Config) ([]Series, error) {
	body, err := get(ctx, cfg, "/api/v3/series")
	if err != nil {
		return nil, err
	}

	var series []Series
	if err := json.Unmarshal(body, &series); err != nil {
		return nil, fmt.Errorf("parse series list response: %w", err)
	}
	return series, nil
}

// QualityProfile is one of Sonarr's configured quality profiles (e.g.
// "HD-1080p"). A Series references one by QualityProfileID.
type QualityProfile struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// ListQualityProfiles fetches Sonarr's configured quality profiles, via
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
