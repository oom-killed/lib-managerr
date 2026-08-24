// Package entdb builds the ent client on top of a database/sql connection
// opened by internal/db, mapping our Engine type to ent's dialect name.
package entdb

import (
	"database/sql"
	"fmt"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"

	"github.com/oom-killed/lib-managerr/ent"
	"github.com/oom-killed/lib-managerr/internal/db"
)

// New builds an *ent.Client backed by sqlDB, using the dialect that matches
// engine.
func New(sqlDB *sql.DB, engine db.Engine) (*ent.Client, error) {
	var dialectName string
	switch engine {
	case db.EngineSQLite:
		dialectName = dialect.SQLite
	case db.EnginePostgres:
		dialectName = dialect.Postgres
	default:
		return nil, fmt.Errorf("unknown database engine %q", engine)
	}

	drv := entsql.OpenDB(dialectName, sqlDB)
	return ent.NewClient(ent.Driver(drv)), nil
}
