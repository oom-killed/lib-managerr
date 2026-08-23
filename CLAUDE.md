# lib-managerr

A media library management tool for the integrations actually used day-to-day: **Plex, Seerr, Radarr, Sonarr**.
Fresh design from scratch — not a port of anything.

## Stack

- **Backend**: Go, standard library `net/http` (Go 1.22+ `ServeMux` routing) — no framework.
- **Frontend**: SolidJS + TypeScript, built with Vite.
- **Package manager**: pnpm (frontend only; Go uses modules).
- **Lint/format**: `gofmt`/`go vet` for Go; [Biome](https://biomejs.dev) for TS/JS (lint + format in one tool).

## Version policy

**Always use the latest stable version of every tool and dependency, unless there's a concrete blocker.**
When adding or upgrading a dependency, fetch the actual latest version from its official source (go.dev,
the npm registry, etc.) rather than relying on memory — tooling moves fast and training data goes stale.
If a latest version is skipped, say why (e.g. "TypeScript 7.0 broke X, pinned to 5.x until Y is fixed").

Versions confirmed against official sources at project init (2026-08-23): Go 1.27.0, Node.js 24.19.0 LTS
("Krypton" — deliberately the LTS line, not the newer 26.x Current release, since Current releases have a
much shorter support window), pnpm 11.23.0, Vite 8.2.2, solid-js 1.9.15, TypeScript 7.0.2, @biomejs/biome
2.5.10. TypeScript 7 (the new Go-ported compiler) was verified working with `vite-plugin-solid` and `tsc -b`
before adopting it. Don't treat these as ceilings — check for newer releases before starting new work.

## Repository layout

```
backend/    Go module (github.com/oom-killed/lib-managerr) — cmd/, internal/
web/        SolidJS + TypeScript app (Vite)
```

## Build & run

**Development** (two processes, hot reload on both sides):
```
make dev-backend   # go run ./cmd/lib-managerr, API on :8080
make dev-web       # Vite dev server, proxies /api/* to :8080
```

**Production build** (single self-contained binary):
```
make build         # pnpm build -> sync web/dist into backend/internal/webui/dist -> go build
```
`backend/internal/webui/dist` is generated (gitignored except a `.gitkeep` placeholder so `go:embed`
has something to embed on a fresh checkout) — never edit it directly, it's overwritten by `make build`.

**Lint**: `make lint` (Biome for `web/`, `gofmt`/`go vet` for `backend/`).

## Conventions

- Follow existing patterns in `backend/internal/*` before introducing new ones.
- No premature abstraction — YAGNI, no speculative feature flags, no unnecessary error handling for cases
  that can't happen.
