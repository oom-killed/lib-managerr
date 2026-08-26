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

**Connection health status** (shown on the Dashboard) is checked in the background, not live per-request —
`backend/internal/api/health.go`'s `StartHealthChecker` runs a ticker (interval set by
`CONNECTION_HEALTH_INTERVAL`, a Go duration string like `"60s"`, default `60s`, same "common setting via env
var" pattern as `LOG_LEVEL`/`LOG_FORMAT`) that re-tests every `Connection` via the same `testConnectionType`
dispatcher the manual Test Connection button uses, storing each result (`ok`/`error`/`checkedAt`) in an
in-memory `StatusStore` keyed by connection id. `GET /api/connections/status` is a pure read from that
store — hitting it never triggers a live test, so the endpoint stays cheap regardless of how often the
frontend polls it. The Dashboard's `ConnectionsStatus` component (`web/src/routes/Dashboard.tsx`) polls it
every 45s, a fixed interval shorter than the backend's 60s default (not dynamically derived from it — that
would need its own round-trip just to learn a config value). A connection with no status yet (right after
startup, before the first check cycle completes) renders as "Checking..." rather than defaulting to
online/offline, since neither would be true yet. The status badge itself (`StatusBadge`, `packages/ui`) is
presentational only — online/offline/checking plus a label — consistent with the low-level-component rule.

**Rules** (`/rules`, root-level nav, first added as an empty-state shell) is a library cleanup automation
feature, built incrementally: the `Rule` entity (`backend/ent/schema/rule.go`) deliberately only had
`name`/`enabled` at first — condition/library-scope fields are still a later increment, since those depend
on an execution engine that doesn't exist yet and guessing that shape before it does would likely need
reworking. Full CRUD (`backend/internal/api/rules.go`, `GET/POST /api/rules`, `PUT/DELETE /api/rules/{id}`)
exists even though nothing executes a rule yet, matching how `Connection` CRUD existed before
Plex/Radarr/Sonarr/Seerr did anything useful with it. Unlike `Connection`, `Rule` has a `DELETE` endpoint —
connections never gained one since it was never asked for, not because of some rule against it.

`Rule.action` (added next) models what a rule would do, ahead of the condition/scope fields and execution
engine that decide *when* it runs — the five values (`change_quality_and_search`, `delete`, `do_nothing`,
`unmonitor_and_delete_files`, `unmonitor_and_keep_files`) match Maintainerr's own action set for Radarr
cleanup, since that's a reasonable action vocabulary to start from even though this project isn't a port of
it. Implicitly Radarr-scoped for now (no `target`/`service` field) since Radarr is the only thing being
acted on — revisit if a non-Radarr action is ever needed. Defaults to `do_nothing` (both the ent schema
default and `RuleForm.tsx`'s initial state) so an unconfigured rule is inert rather than silently deleting
things. `PUT /api/rules/{id}` leaves `action` unchanged when the field is omitted from the request body,
same "omit means no change" convention as `Connection`'s token field. The option list/label mapping lives in
`web/src/routes/rules/ruleActions.ts` (`RULE_ACTION_OPTIONS`), the same registry shape as
`CONNECTION_TYPE_OPTIONS`.

**`Rule.connection_id`/`library_key`** (added next) identify the library a rule scans the same way the rest
of the app identifies one — connection id + the remote library key — rather than through the `Library`
entity, since nothing persists Plex library sections into it yet (see the Database section above). The edge
is a real ent `edge.From(...).Field("connection_id")` (required, so the FK is enforced — an unknown
`connectionId` is rejected as a `400`), with `StructTag` overrides on both fields so the JSON API exposes
`connectionId`/`libraryKey` (camelCase, matching the rest of the frontend's custom fields) instead of ent's
default snake_case. `RuleForm.tsx` reuses the exact connection/library selector pattern from
`Libraries.tsx` (filter to `LIBRARY_CAPABLE_CONNECTION_TYPES`, default to the first once each resource
loads) rather than introducing a second implementation of the same picker.

**Action options are filtered by the selected library's media type** (`web/src/routes/rules/ruleActions.ts`)
— purely a frontend concern, no backend validation of the pairing (the `Rule.action` enum doesn't know about
media types at all). Each `RuleActionOption` carries an optional `mediaTypes` list; every action except
`do_nothing` is `["movie"]`-only since they're all Radarr actions and Radarr only tracks movies —
`do_nothing` has no restriction (applies to any library) since it isn't tied to a service.
`ruleActionOptionsFor(mediaType)` returns every option when `mediaType` is `undefined` (no library resolved
yet, e.g. still loading) so the select isn't empty during that window. `RuleForm.tsx` resolves the selected
library's `type` from the already-fetched libraries list (no extra request) and resets `action` to the first
still-valid option whenever that type changes what's applicable — e.g. switching a rule from a movie library
with action `delete` to a show library resets it to `do_nothing`, since `delete` wouldn't mean anything
there.

**`Rule.granularity`** (show vs. season vs. episode, added next — "show" added in a follow-up once it was
noticed a rule might apply at the whole-show level too) only applies to show libraries — `Optional().
Nillable()` in the ent schema so it's genuinely absent (`null`/omitted) for movie libraries rather than an
"unset" value that happens not to matter, mirroring how `action`'s media-type applicability is handled at
the UI level but enforced more strictly here since a stale season/episode value would be actively wrong
data, not just an inert one. Unlike `action` on `PUT` (unchanged when omitted), `granularity` is *cleared*
when omitted from a `PUT /api/rules/{id}` body — the two fields need opposite omit-semantics because a
missing `action` means "the client didn't touch this field" while a missing `granularity` means "this
library isn't a show library," which must actively unset any previous value (e.g. a rule retargeted from a
show library to a movie library). `RuleForm.tsx` shows the show/season/episode `Select` only when
`isShowLibrary()`, defaults new selections to "season," and clears the local `granularity` signal outright
when the selected library isn't a show library, so switching a rule's target library away from TV shows
can't leave a stale value sitting unsent in the form state.

**`Rule.action` became a list** (`RuleActionStep`, a new entity — e.g. "unmonitor after 1 day, then delete
files after 1 month") once a rule needed to do more than one thing over time; the single-enum `action` field
described two paragraphs up no longer exists on `Rule`. Each step has `delay_amount`/`delay_unit`
(hours/days/weeks/months) plus its own `action` (same five-value vocabulary, now living on `RuleActionStep`
instead), and a `position` field that preserves entry order — deliberately not derived from `delay_amount`,
since two steps can share a delay and the form's list order is the more meaningful source of truth than a
computed sort. The edge back to `Rule` is `entsql.OnDelete(entsql.Cascade)`, so deleting a rule cleans up its
steps automatically rather than requiring the handler to delete them first or leaving orphaned rows.
`PUT`/`POST /api/rules` always replace the *entire* step list atomically (`setActionSteps` in
`internal/api/rules.go`: delete all existing steps for the rule, then recreate from the submitted array) —
simpler and safer than diffing against what's stored, since the form always submits the complete list
anyway. The API composes a `ruleOut` struct (`*ent.Rule` embedded plus an `Actions []ruleActionStepOut`
field) rather than relying on ent's default edge-eager-loading JSON shape, so the frontend gets a flat
`actions` array instead of nesting under `edges.action_steps`. Each step's action is still filtered by the
rule's library media type exactly as before, just applied per-row in `RuleForm.tsx`'s repeatable list instead
of to a single select.

**Sonarr's action vocabulary** (added next, matching Maintainerr's Sonarr option set) extends
`RuleActionStep.action` well beyond the original five Radarr values, and — unlike Radarr's, which apply
uniformly to any movie — is further scoped by granularity: distinct action sets for "show" (6 options,
e.g. `delete_entire_show`), "season" (6, e.g. `season_unmonitor_delete_season_delete_show_if_empty`), and
"episode" (3, e.g. `episode_unmonitor_delete_episode`) level rules, prefixed accordingly so a flat enum stays
unambiguous. `do_nothing` and `change_quality_and_search` are shared across services — the latter reused
rather than duplicated as a Sonarr-specific value, since it means the same thing for both, restricted to
`granularities: ["show"]` because that's the only level Maintainerr's own Sonarr option set offers it at.
`web/src/routes/rules/ruleActions.ts`'s `RuleActionOption` gained a `granularities` field alongside the
existing `mediaTypes`, and `ruleActionOptionsFor` takes a second `granularity` parameter — checked only when
`mediaType === "show"`, since movies have no granularity concept at all. `RuleForm.tsx` passes the current
`granularity()` signal into every call site, so switching granularity (not just library/media type) also
re-filters and resets any step whose action no longer applies, the same reactive pattern already used for
media-type changes.

**`Rule.criteria`** (added next) is a nested AND/OR condition tree — e.g. `(A AND B) OR (C AND D)` — for
deciding *which* items a rule applies to, complementing the action_steps that decide what happens and when.
Stored as a single opaque JSON blob (`field.JSON("criteria", json.RawMessage{})`, generated as ent's
`jsontext.Value`) rather than normalized recursive entities — a deliberate simplicity tradeoff: the
field/operator vocabulary a condition can reference lives only in the frontend registry
(`web/src/routes/rules/ruleCriteria.ts`), not enforced by the backend at all, so extending it never touches
the schema. The backend validates only the tree's *shape* (`validateCriteria`/`validateCriteriaNode` in
`internal/api/rules.go`): every node is either a `"group"` (requires `operator` = `"AND"`/`"OR"` and at
least one child) or a `"condition"` (requires non-empty `field`/`operator`); an empty or absent blob means
"no criteria" and is valid. Same omit-clears-it semantics as `granularity` on `PUT` — the form always
submits its complete current tree (or nothing), so an absent value must actively clear any previous one
rather than leave it unchanged, unlike `action`'s "omit means untouched" convention.

The criteria field registry currently covers Plex (added date, last-watched date, view count, release year —
available on any library), Radarr (monitored, quality profile — movie libraries only), and Sonarr (monitored,
quality profile, season/episode counts — show libraries only), mirroring Maintainerr's own criteria
categories as a starting vocabulary rather than a verified port of its exact field list. `CriteriaField`
entries declare a `valueKind` (`date`/`number`/`boolean`) and their own operator list, plus an optional
`mediaTypes` restriction using the same filtering shape as `ruleActions.ts`'s `mediaTypes`/`granularities`.

The nested-group UI (`web/src/routes/rules/CriteriaGroupEditor.tsx`) is genuinely recursive — a group renders
its own AND/OR toggle plus a list of children that are each either a condition row or another
`CriteriaGroupEditor`, so `(A AND B) OR (C AND D)` is just a depth-2 tree of the same component. Removing a
group/condition's last remaining child calls that group's own `onRemove` rather than leaving an
empty-children group behind (which the backend would reject); at the root, `RuleForm.tsx` wires `onRemove` to
clear the whole criteria signal back to `undefined`, unifying "remove the last child" and "remove all
criteria" into the same code path instead of special-casing the root group.

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
