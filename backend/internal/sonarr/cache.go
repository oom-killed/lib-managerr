package sonarr

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type cacheEntry struct {
	series    []Series
	profiles  []QualityProfile
	fetchedAt time.Time
}

// Cache holds a short-lived, in-memory copy of a Sonarr instance's series
// and quality-profile lists. Same shape and rationale as radarr.Cache:
// without it, paginating a library re-downloads Sonarr's entire show
// catalog on every single page request.
type Cache struct {
	mu   sync.Mutex
	ttl  time.Duration
	data map[string]cacheEntry
}

func NewCache(ttl time.Duration) *Cache {
	return &Cache{ttl: ttl, data: make(map[string]cacheEntry)}
}

func cacheKey(cfg Config) string {
	return fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
}

// GetSeriesAndProfiles returns cfg's series and quality-profile lists,
// fetching fresh from Sonarr only if there's no entry or it's older than
// the cache's TTL.
func (c *Cache) GetSeriesAndProfiles(ctx context.Context, cfg Config) ([]Series, []QualityProfile, error) {
	key := cacheKey(cfg)

	c.mu.Lock()
	entry, ok := c.data[key]
	c.mu.Unlock()
	if ok && time.Since(entry.fetchedAt) < c.ttl {
		return entry.series, entry.profiles, nil
	}

	series, err := ListSeries(ctx, cfg)
	if err != nil {
		return nil, nil, err
	}
	profiles, err := ListQualityProfiles(ctx, cfg)
	if err != nil {
		return nil, nil, err
	}

	c.mu.Lock()
	c.data[key] = cacheEntry{series: series, profiles: profiles, fetchedAt: time.Now()}
	c.mu.Unlock()

	return series, profiles, nil
}
