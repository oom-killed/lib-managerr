package main

import (
	"log"
	"net/http"

	"github.com/oom-killed/lib-managerr/internal/webui"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	mux.Handle("/", http.FileServerFS(webui.FS()))

	const addr = ":8080"
	log.Printf("lib-managerr listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
