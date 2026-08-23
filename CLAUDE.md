# lib-managerr

A media library management tool for the integrations actually used day-to-day: **Plex, Seerr, Radarr, Sonarr**.
Fresh design from scratch — not a port of anything.

## Stack

- **Backend**: Go, standard library `net/http` (Go 1.22+ `ServeMux` routing) — no framework.
- **Frontend**: SolidJS + TypeScript, built with Vite, styled with Tailwind CSS v4, routed with `@solidjs/router`.
- **Package manager**: pnpm workspace (frontend only; Go uses modules) — root `pnpm-workspace.yaml` covers
  `web` and `packages/*`.
- **Lint/format**: `gofmt`/`go vet` for Go; [Biome](https://biomejs.dev) for TS/JS/CSS across the whole
  workspace (single root `biome.json`, single shared `@biomejs/biome` devDependency at the workspace root).

## Version policy

**Always use the latest stable version of every tool and dependency, unless there's a concrete blocker.**
When adding or upgrading a dependency, fetch the actual latest version from its official source (go.dev,
the npm registry, etc.) rather than relying on memory — tooling moves fast and training data goes stale.
If a latest version is skipped, say why (e.g. "TypeScript 7.0 broke X, pinned to 5.x until Y is fixed").

Versions confirmed against official sources at project init (2026-08-23): Go 1.27.0, Node.js 24.19.0 LTS
("Krypton" — deliberately the LTS line, not the newer 26.x Current release, since Current releases have a
much shorter support window), pnpm 11.23.0, Vite 8.2.2, solid-js 1.9.15, TypeScript 7.0.2, @biomejs/biome
2.5.10. TypeScript 7 (the new Go-ported compiler) was verified working with `vite-plugin-solid` and `tsc -b`
before adopting it. Added later in the same style: `@solidjs/router` 1.0.0, Tailwind CSS 4.3.3
(`@tailwindcss/vite`), Storybook 10.5.10 with `storybook-solidjs-vite` 10.7.1 (the official `storybook-solidjs`
package is deprecated in favor of this Vite-based one — checked peer deps against our Storybook/Vite/solid-js
versions before adopting), `@solid-primitives/i18n` 2.2.1. Don't treat any of these as ceilings — check for
newer releases before starting new work.

## Repository layout

```
backend/       Go module (github.com/oom-killed/lib-managerr) — cmd/, internal/
web/           SolidJS + TypeScript app (Vite) — routes, pages, business-logic-bound components
packages/ui/   @lib-managerr/ui — low-level, presentational-only component library + Storybook
```

## Component architecture

`packages/ui` (`@lib-managerr/ui`) holds **low-level components only** — no business logic, no data
fetching, no routing/API awareness. A component there must be understandable and usable with zero knowledge
of this app (e.g. `NavLink` takes `href`/`label`/`isActive` as plain props and an `as` prop to let a caller
inject a router-aware element type — it never imports `@solidjs/router` itself). It ships as raw
TS/TSX source (no build step); `web`'s Vite/Tailwind pipeline compiles it directly, and Tailwind's
`@source` directive in `web/src/index.css` scans `packages/ui/src` so its utility classes make it into the
final CSS.

`web` binds business logic to those primitives via bound wrapper components (e.g. `web/src/AppShell.tsx`
composes `@lib-managerr/ui`'s `Navbar`/`Sidebar`/`NavLink` with real routes and `useLocation`-driven active
state). New reusable-but-presentational pieces go in `packages/ui`; anything that knows about routes, API
calls, or app-specific state stays in `web` as a binding layer on top.

Every component in `packages/ui` gets a co-located `*.stories.tsx` file. Run `make storybook` to browse the
catalog and check components in isolation.

## Internationalization

User-facing strings live in `web/src/i18n/<locale>.ts` (nested dictionaries), accessed via `useI18n()`'s `t`
function (`web/src/i18n/index.tsx`, built on `@solid-primitives/i18n`). Only `en` exists today — add new
locale files and register them in `dictionaries` in `web/src/i18n/index.tsx` when a second language is
needed. `packages/ui` stays i18n-agnostic: its components take already-resolved strings as props (`label`,
`children`), consistent with the no-business-logic rule above — translation only happens in `web`.

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

**Lint**: `make lint` (Biome across the whole JS/TS workspace, `gofmt`/`go vet` for `backend/`).

**Storybook**: `make storybook` — component catalog for `packages/ui`, at localhost:6006.

## Conventions

- Follow existing patterns in `backend/internal/*` before introducing new ones.
- No premature abstraction — YAGNI, no speculative feature flags, no unnecessary error handling for cases
  that can't happen.
