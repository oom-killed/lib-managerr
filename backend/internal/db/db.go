// Package db opens the application database connection. The DATABASE_URL
// scheme selects the driver, so the same code path supports either SQLite
// (the zero-config default, for simple self-hosted setups) or PostgreSQL.
package db

import (
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"path/filepath"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)

const defaultDSN = "sqlite://data/lib-managerr.db"

// Open opens a database connection based on the DATABASE_URL environment
// variable, defaulting to a SQLite file under ./data if unset. It does not
// verify connectivity — call Ping on the result for that.
func Open() (*sql.DB, error) {
	raw := os.Getenv("DATABASE_URL")
	if raw == "" {
		raw = defaultDSN
	}

	u, err := url.Parse(raw)
	if err != nil {
		return nil, fmt.Errorf("parse DATABASE_URL: %w", err)
	}

	switch u.Scheme {
	case "sqlite":
		return openSQLite(u)
	case "postgres", "postgresql":
		return sql.Open("pgx", raw)
	default:
		return nil, fmt.Errorf("unsupported DATABASE_URL scheme %q (want sqlite or postgres)", u.Scheme)
	}
}

func openSQLite(u *url.URL) (*sql.DB, error) {
	path := u.Opaque
	if path == "" {
		path = u.Host + u.Path
	}

	if dir := filepath.Dir(path); dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, fmt.Errorf("create sqlite data dir %q: %w", dir, err)
		}
	}

	return sql.Open("sqlite", path)
}
