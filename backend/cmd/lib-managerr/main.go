package main

import (
	"context"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/oom-killed/lib-managerr/internal/api"
	"github.com/oom-killed/lib-managerr/internal/db"
	"github.com/oom-killed/lib-managerr/internal/entdb"
	"github.com/oom-killed/lib-managerr/internal/logging"
	"github.com/oom-killed/lib-managerr/internal/radarr"
	"github.com/oom-killed/lib-managerr/internal/sonarr"
	"github.com/oom-killed/lib-managerr/internal/webui"
)

// spaHandler serves static files from fsys, falling back to index.html for
// any path that isn't a real file so client-side routes (e.g. /settings)
// work on a direct request, not just client-side navigation.
func spaHandler(fsys fs.FS) http.Handler {
	fileServer := http.FileServerFS(fsys)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "."
		}

		if _, err := fs.Stat(fsys, path); err != nil {
			r = r.Clone(r.Context())
			r.URL.Path = "/"
		}

		fileServer.ServeHTTP(w, r)
	})
}

func main() {
	logger := logging.New()
	slog.SetDefault(logger)

	sqlDB, engine, err := db.Open()
	if err != nil {
		logger.Error("open database", "error", err)
		os.Exit(1)
	}

	client, err := entdb.New(sqlDB, engine)
	if err != nil {
		logger.Error("build database client", "error", err)
		os.Exit(1)
	}
	defer client.Close()

	if err := client.Schema.Create(context.Background()); err != nil {
		logger.Error("run schema migration", "error", err)
		os.Exit(1)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	radarrCache := radarr.NewCache(60 * time.Second)
	sonarrCache := sonarr.NewCache(60 * time.Second)
	api.RegisterConnectionRoutes(mux, client, radarrCache, sonarrCache)

	mux.Handle("/", spaHandler(webui.FS()))

	const addr = ":8080"
	logger.Info("lib-managerr listening", "addr", addr)
	if err := http.ListenAndServe(addr, logging.Middleware(mux)); err != nil {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
