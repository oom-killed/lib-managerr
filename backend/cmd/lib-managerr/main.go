package main

import (
	"context"
	"io/fs"
	"log"
	"net/http"
	"strings"

	"github.com/oom-killed/lib-managerr/internal/db"
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
	sqlDB, err := db.Open()
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer sqlDB.Close()

	if err := sqlDB.PingContext(context.Background()); err != nil {
		log.Fatalf("connect to database: %v", err)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	mux.Handle("/", spaHandler(webui.FS()))

	const addr = ":8080"
	log.Printf("lib-managerr listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
