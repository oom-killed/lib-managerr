package api

import (
	"context"
	"log/slog"
	"sync"
	"time"

	"github.com/oom-killed/lib-managerr/ent"
)

// ConnectionStatus is the last-known reachability result for one
// Connection, refreshed periodically by StartHealthChecker rather than
// tested live on every request.
type ConnectionStatus struct {
	ID        int       `json:"id"`
	OK        bool      `json:"ok"`
	Error     string    `json:"error,omitempty"`
	CheckedAt time.Time `json:"checkedAt"`
}

// StatusStore holds the most recent ConnectionStatus for every Connection,
// keyed by id.
type StatusStore struct {
	mu   sync.Mutex
	data map[int]ConnectionStatus
}

func NewStatusStore() *StatusStore {
	return &StatusStore{data: make(map[int]ConnectionStatus)}
}

func (s *StatusStore) set(status ConnectionStatus) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[status.ID] = status
}

// All returns a snapshot of every known connection status. A connection
// with no entry yet (not checked since startup, or since it was created)
// simply won't appear.
func (s *StatusStore) All() []ConnectionStatus {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]ConnectionStatus, 0, len(s.data))
	for _, status := range s.data {
		out = append(out, status)
	}
	return out
}

// StartHealthChecker runs a background ticker that re-tests every
// Connection at the given interval, storing results in store. Runs until
// ctx is canceled. Uses testConnectionType — the same dispatcher the
// manual Test Connection button uses — so every connection type is
// covered automatically.
func StartHealthChecker(ctx context.Context, client *ent.Client, store *StatusStore, interval time.Duration, logger *slog.Logger) {
	checkAll := func() {
		conns, err := client.Connection.Query().All(ctx)
		if err != nil {
			logger.Warn("health check: list connections failed", "error", err)
			return
		}
		for _, conn := range conns {
			result := testConnectionType(ctx, testConnectionInput{
				Type: conn.Type, Host: conn.Host, Port: conn.Port, SSL: conn.Ssl, Token: conn.Token,
			})
			store.set(ConnectionStatus{ID: conn.ID, OK: result.OK, Error: result.Error, CheckedAt: time.Now()})
		}
	}

	go func() {
		checkAll()
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				checkAll()
			}
		}
	}()
}
