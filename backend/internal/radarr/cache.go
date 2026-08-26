package radarr

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type cacheEntry struct {
	movies    []Movie
	profiles  []QualityProfile
	fetchedAt time.Time
}

// Cache holds a short-lived, in-memory copy of a Radarr instance's movie
// and quality-profile lists. Browsing a paginated media library re-checks
// this data on every page, but the underlying Radarr catalog doesn't
// change from click to click — without this, paginating re-downloads the
// entire Radarr movie list on every single page request.
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

// GetMoviesAndProfiles returns cfg's movie and quality-profile lists,
// fetching fresh from Radarr only if there's no entry or it's older than
// the cache's TTL.
func (c *Cache) GetMoviesAndProfiles(ctx context.Context, cfg Config) ([]Movie, []QualityProfile, error) {
	key := cacheKey(cfg)

	c.mu.Lock()
	entry, ok := c.data[key]
	c.mu.Unlock()
	if ok && time.Since(entry.fetchedAt) < c.ttl {
		return entry.movies, entry.profiles, nil
	}

	movies, err := ListMovies(ctx, cfg)
	if err != nil {
		return nil, nil, err
	}
	profiles, err := ListQualityProfiles(ctx, cfg)
	if err != nil {
		return nil, nil, err
	}

	c.mu.Lock()
	c.data[key] = cacheEntry{movies: movies, profiles: profiles, fetchedAt: time.Now()}
	c.mu.Unlock()

	return movies, profiles, nil
}
