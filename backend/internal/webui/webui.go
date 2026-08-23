// Package webui embeds the built SolidJS app so the Go binary can serve it
// alongside the API without any external static files at runtime.
package webui

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var distFS embed.FS

// FS returns the embedded web UI, rooted at dist/ so paths match what a web
// server expects (e.g. "index.html", not "dist/index.html").
func FS() fs.FS {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(err)
	}
	return sub
}
