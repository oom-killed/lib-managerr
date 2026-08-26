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
versions before adopting), `@solid-primitives/i18n` 2.2.1, `modernc.org/sqlite` 1.57.0, `github.com/jackc/pgx/v5`
5.10.0, `entgo.io/ent` 0.14.6 (all three DB-layer versions verified against a real containerized PostgreSQL
as well as SQLite before adopting, not just compiled). Don't treat any of these as ceilings — check for newer
releases before starting new work.

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

`web/src/api/` holds data-fetching functions shared across more than one route (e.g. `connections.ts` — both
`routes/settings/Connections.tsx` (CRUD) and `routes/Libraries.tsx` (the connection/library selector) use
it). Route-specific API calls stay co-located with the route instead (e.g. nothing in
`routes/settings/connections/` besides the Connection form's own concerns).

**Dark mode has no guaranteed dark backdrop unless something paints one.** `color-scheme: light dark` alone
doesn't reliably give a dark page background across browsers — `AppShell`'s root div explicitly sets
`bg-white dark:bg-neutral-950` (plus matching `text-neutral-900 dark:text-neutral-50`) for exactly this
reason. A component using `dark:text-neutral-50`-style light text without a guaranteed dark background behind
it will render unreadable light-on-white outside of states (like `:hover`) that happen to set their own dark
background — this has bitten a couple of components already (`NavLink`, a plain `<button>` in
`settings/Connections.tsx`). Also: plain `<button>` elements need `appearance-none`, since Tailwind v4's
preflight explicitly restores native `appearance: button`, letting OS button chrome interfere with custom
background/hover styling.

## Internationalization

User-facing strings live in `web/src/i18n/<locale>.ts` (`en.ts` exports the `Dict` shape and the English
values; other locales like `fr.ts` implement `Dict` without `as const`, since the literal-narrowed const
type would force every locale to use `en`'s exact string values), accessed via `useI18n()`'s `t` function
(`web/src/i18n/index.tsx`, built on `@solid-primitives/i18n`). Register new locale files in `dictionaries`
in `web/src/i18n/index.tsx`. Selected locale persists to `sessionStorage` (`lib-managerr:locale`).
`packages/ui` stays i18n-agnostic: its components take already-resolved strings as props (`label`,
`children`), consistent with the no-business-logic rule above — translation only happens in `web`.

## Shared state

Cross-component state (not scoped to one route) lives in `web/src/state/` as a signal + context provider,
mounted once in `App.tsx` — the same pattern `I18nProvider` already established, extended in
`state/librarySelection.tsx` for the current connection/library selection. **Not** Zustand or another
React-oriented state library: Solid's own signals/context are the idiomatic equivalent (fine-grained
reactivity is Solid's actual model, not a bolt-on), and a React state library's hooks API doesn't work in
Solid at all — only its framework-agnostic vanilla store would, which would mean hand-wiring subscriptions
into Solid's reactivity rather than using it. Route-local state (e.g. a form's own field values) stays a
plain `createSignal` inside the component — promote to `state/` only when more than one route needs it.

## Database

Supports both SQLite and PostgreSQL, selected by the `DATABASE_URL` env var's scheme (`sqlite://` or
`postgres://`/`postgresql://`). Unset defaults to `sqlite://data/lib-managerr.db` (data dir auto-created,
relative to the process's working directory) — zero-config for the common self-hosted case.
`backend/internal/db` (`db.Open()`) picks the driver — `modernc.org/sqlite` (pure Go, no CGO — keeps
single-binary cross-compilation simple) or `github.com/jackc/pgx/v5`'s `stdlib` shim — and returns an
`Engine` value alongside the `*sql.DB` so callers know which dialect they got. The SQLite DSN always
includes `?_pragma=foreign_keys(1)`; without it ent's foreign-key edges aren't enforced.

Schema/queries go through [ent](https://entgo.io) (`backend/internal/entdb` builds the `*ent.Client` from
`db.Open()`'s result, mapping `Engine` to ent's dialect name). Schema is defined once in Go
(`backend/ent/schema/*.go`) and generates a type-safe client (`backend/ent/`, committed — run
`go generate ./ent/...` after editing schema files) that works against either engine with no hand-written
per-dialect SQL. Migrations are ent's built-in schema sync (`client.Schema.Create(ctx)`, run at startup in
`main.go`); a versioned migration tool (e.g. Atlas) is a later addition if schema changes in production ever
need more control than "sync to current shape."

First entities: `Connection` (credentials to reach one server — `type` enum, `"plex"`/`"radarr"`; `name`,
`host`, `port`, `ssl`, `token`) and `Library` (one trackable section on a `Connection` — `external_id` is the
remote section id, e.g. Plex's library key; `title`; `media_type` enum `movie`/`show`/`artist`; `enabled`).
They're separate entities, not one, because a single server connection can have many library sections you'd
want to independently enable/disable. `(external_id, connection)` is a unique index on `Library`.

## HTTP API

Domain-data endpoints (as opposed to `main.go`'s health/static-file concerns) live in `backend/internal/api`,
registered onto the stdlib `ServeMux` from `main.go` (e.g. `api.RegisterConnectionRoutes(mux, client)`).
Handlers use the generated ent types directly as request/response bodies rather than separate DTOs — e.g.
`Connection`'s `Token` field is already tagged `json:"-"` from the schema's `.Sensitive()` field option, so
it's excluded from API responses for free.

`GET`/`POST`/`PUT /api/connections/{id}` exist so far. Since the API never returns `token`, `PUT` treats an
empty `token` in the request body as "leave the existing token unchanged" rather than clearing it — there's
no other way for a client to express "no change" versus "clear it" without the current value to diff against.

`POST /api/connections/test` (add mode — full fields including token) and `POST /api/connections/{id}/test`
(edit mode — same fields, but an empty `token` falls back to the connection's stored one, same contract as
`PUT`) verify a connection actually works, dispatching by `type` to a client package
(`backend/internal/plex` today — `Ping` hits Plex's `/identity`, not `/`, to avoid reverse-proxy redirects).
A failed test is a normal outcome, not an HTTP error: both endpoints always return `200 {"ok": bool,
"error"?: string}` unless the request itself is malformed (400) or the id doesn't exist (404). A new
connection type's test support is a new `case` in `testConnectionType` (`backend/internal/api/connections.go`)
plus a new client package — the same extensibility shape as the frontend's field registry below.

`GET /api/connections/{id}/libraries` fetches a connection's actual library sections live from the server
(no persistence — the `Library` ent entity exists in the schema but nothing populates it yet; that's a
separate future increment), dispatching by `type` via `listLibrariesForConnection`, same shape as
`testConnectionType`. `backend/internal/plex.ListLibraries` calls `/library/sections`. A failure to reach the
upstream server returns `502`, distinct from `404` (connection id not found) — the root `web/src/routes/
Libraries.tsx` page's connection/library selector relies on that distinction to show the right empty state.

`GET /api/connections/{id}/libraries/{key}/items?offset=&limit=` (default `limit` 20) pages through one
library section's media items, via `backend/internal/plex.ListLibraryItems` →
`/library/sections/{key}/all?X-Plex-Container-Start=...&X-Plex-Container-Size=...` — Plex's own pagination
query-param convention. Response is `{items, total, offset, limit}`; the frontend derives Prev/Next
enabled-state and the "X–Y of N" range purely from `total`/`offset`/`limit`, no separate page-count field.
For `show`-type items, Plex's `childCount`/`leafCount` fields (season count / episode count) come back on the
same `/library/sections/{key}/all` response already used for the item list — no extra request — mapped to
`Item.SeasonCount`/`EpisodeCount`, shown in the UI only when `type === "show"`.

**Cross-service enrichment** (e.g. showing Radarr data on a Plex movie item) is matched by TMDB id, not
title/year — Plex's item request includes `includeGuids=1`, and `plex.Item.TmdbID` (parsed from the
`tmdb://<id>` entry in Plex's `Guid` list, `json:"-"` since it's a correlation key, not display data) is
matched against Radarr's own `tmdbId` field. `backend/internal/api/connections.go`'s `enrichWithRadarr` does
this: it looks up the first `Connection` of type `radarr` (no per-library association — Radarr enrichment is
independent of which Plex connection/library is being browsed). Plex is the source of truth for what's
actually in the library, so only enrich with tracking metadata Plex doesn't already convey (`monitored`,
quality profile) — not file-presence info Plex already implies by the item existing at all.

`radarrInfo.Tracked` distinguishes "Radarr doesn't have this movie" from "Radarr has it but it's
unmonitored" — both are meaningfully different, so the `radarr` field is always set on every movie item once
Radarr was successfully reached, even with no match (`{tracked: false}`), not just when there's a hit. It's
left `nil` (omitted entirely) only when tracked status genuinely can't be determined at all — no Radarr
connection configured, or Radarr unreachable — since asserting "not tracked" there would be a guess. Note:
Plex's real item JSON has *two* guid-shaped keys per item — lowercase singular `"guid"` (Plex's own internal
`plex://...` identifier, always present, a plain string) and capital plural `"Guid"` (the external-id array,
only with `includeGuids=1`). Both must be declared as separate struct fields with exact-match tags; declaring
only `"Guid"` lets Go's json decoder's case-insensitive fallback misroute the lowercase `"guid"` string into
that field, breaking on every real Plex response (mock test fixtures that omit the lowercase field won't
catch this — this bit us once already).

`backend/internal/radarr.Cache` (60s TTL, mutex-guarded, keyed by `host:port`) wraps `ListMovies`+
`ListQualityProfiles` as a pair — constructed once in `main.go`, passed through
`RegisterConnectionRoutes`/`enrichWithRadarr` — since without it, paginating through a library re-downloads
Radarr's *entire* movie catalog on every single page request, when only that page's items need matching.
Deliberately just an in-memory struct, not a general caching layer or anything persistent — the tradeoff is
staleness (a Radarr change can take up to 60s to show here), acceptable for what's a display feature, not
a source of truth.

**Sonarr enrichment on show items** mirrors Radarr's movie enrichment exactly, but matched by TVDB id instead
of TMDB id — Sonarr's `Series` resource carries a `tvdbId`, not a `tmdbId`. `plex.Item.TvdbID` (parsed from
the `tvdb://<id>` entry in the same `Guid` list already fetched for TMDB matching) is matched against
`backend/internal/sonarr.ListSeries`'s `tvdbId` field in `enrichWithSonarr`
(`backend/internal/api/connections.go`), which looks up the first `Connection` of type `sonarr` the same way
`enrichWithRadarr` looks up `radarr`. Same `Tracked`/`Monitored`/`QualityProfile` shape and the same
always-set-once-reachable semantics as `radarrInfo`, and the same `backend/internal/sonarr.Cache` (60s TTL,
same shape as `radarr.Cache`) to avoid re-downloading Sonarr's entire series catalog per page. Both
enrichments run independently over the same `itemOut` slice — `enrichWithRadarr` only touches `type=="movie"`
items, `enrichWithSonarr` only `type=="show"` items — so a library can be enriched by both, either, or
neither depending on which connections exist.

**Adding a new connection type without heavy refactoring**: the `Connection` entity's fields (`type`, `name`,
`host`, `port`, `ssl`, `token`) are deliberately generic across host-based server integrations, not
Plex-specific — a new type is a new `ent/schema/connection.go` enum value plus, on the frontend, a new
`ConnectionType` union member and a `CONNECTION_TYPE_FIELDS`/`CONNECTION_TYPE_OPTIONS` registry entry
(`web/src/routes/settings/connections/connectionTypes.ts`). `ConnectionForm.tsx` renders fields by iterating
that registry rather than hardcoding JSX per field, so the modal/list/page code doesn't change when a type
is added — only the registry does. The type-selector dropdown only renders once there's more than one
option, to avoid a pointless single-item `<select>` today.

`radarr` (added after Plex) proved this out: adding it touched only the ent enum, a new `internal/radarr`
client package (`Ping` → `/api/v3/system/status` with an `X-Api-Key` header, Radarr's equivalent of Plex's
`/identity` check), one `case` in `testConnectionType`, and the frontend registry — no changes to
`ConnectionForm.tsx`, the modal, or the connections list. A field can have a different label per type even
though it shares the same underlying key: Radarr's `token` field uses the `apiKey` label
(`settings.connections.fields.apiKey`) instead of `token`'s, since `CONNECTION_TYPE_FIELDS` is keyed by
type, each with its own `labelKey` per field. Radarr connections don't support `/libraries` or `/items`
(Radarr manages movies directly, it has no "library sections" the way Plex does) — those endpoints' `default`
dispatch case returns "unsupported connection type", surfaced as a normal `502` on the frontend, not a crash.

`sonarr` (added after Radarr) confirmed the pattern holds for a second follow-on type: same shape as Radarr
exactly (`internal/sonarr.Ping` → `/api/v3/system/status` with `X-Api-Key`, one `case` in
`testConnectionType`, reuses the existing `apiKey` label), no new client-shape decisions needed. Both Radarr
and Sonarr connections are automatically excluded from the root Libraries page's picker with zero extra
code, since `LIBRARY_CAPABLE_CONNECTION_TYPES` (`web/src/api/connections.ts`) is still just `["plex"]`.

`seerr` (added after Sonarr) confirmed the pattern holds for a third follow-on type: same shape again
(`internal/seerr.Ping` → `/api/v1/status` with `X-Api-Key`, Seerr's — Overseerr/Jellyseerr's — own health
check path, one `case` in `testConnectionType`, reuses the existing `apiKey` label). No enrichment yet
(unlike Radarr/Sonarr) — Seerr connections are for a later increment (e.g. surfacing pending requests); for
now `test`/CRUD support is the whole scope, same as Radarr/Sonarr had before their enrichment was added.

**"Connection" ≠ "Library"**: a Connection is credentials for reaching *any* external service — media
servers (Plex, eventually Jellyfin/Emby) that have browsable library sections, *and* data-only services
(Radarr, Sonarr, Seerr) that don't, used only to fetch additional data. Adding Radarr revealed that Settings'
page for configuring connections was still named/labeled "Libraries" from when Plex was the only type,
which is wrong for a Radarr connection — it's not a library. That page is `routes/settings/Connections.tsx`
now (`/settings/connections`, `settingsNav.connections`, `settings.connections.*` i18n keys), matching what
the backend already called it (`Connection` entity, `/api/connections`). The root `routes/Libraries.tsx`
(actual Plex library/item browsing) keeps its name — it genuinely is about libraries — but its connection
picker filters to `LIBRARY_CAPABLE_CONNECTION_TYPES` (`web/src/api/connections.ts`, currently just `["plex"]`)
so a Radarr connection never shows up somewhere it can't be browsed. Extend that list, not the picker's
logic, when Jellyfin/Emby support lands.

## Logging

Built on the stdlib `log/slog` — no logging dependency. `backend/internal/logging.New()` builds the logger
from two env vars: `LOG_LEVEL` (`debug`/`info`/`warn`/`error`, default `info`, case-insensitive, unrecognized
values fall back to `info`) and `LOG_FORMAT` (`text` default for local dev, `json` for structured/aggregated
output). `main.go` sets it as `slog.Default()`.

`logging.Middleware` wraps the whole `mux` in `main.go`: every request gets a generated `request_id` plus
`method`/`path` attached to a logger, which is stashed in the request's `context.Context` and also used to
log `status`/`duration_ms` when the request completes. Handlers pull that request-scoped logger via
`logging.FromContext(r.Context())` and can chain `.With(...)` to add their own queryable fields on top (e.g.
`connection_id`) — see `backend/internal/api/connections.go` for the pattern. Falls back to `slog.Default()`
if called outside a request (e.g. from `main.go` directly), so it's always safe to call.

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
