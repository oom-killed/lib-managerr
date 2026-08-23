lib-managerr

A media library management tool for Plex, Seerr, Radarr, and Sonarr, written in Go with a SolidJS web UI.

## Development

See [`CLAUDE.md`](./CLAUDE.md) for the stack, repo layout, version policy, and how to run/build the project.

Quick start:

```
make dev-backend   # Go API on :8080, in one terminal
make dev-web       # Vite dev server with hot reload, in another
```

```
make build         # single self-contained binary at bin/lib-managerr
```
