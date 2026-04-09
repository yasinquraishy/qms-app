# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Vue 3** with Composition API + `<script setup>`
- **Quasar** (UI framework) + **TailwindCSS** for styling
- **Vite** as the build tool
- **syncEngine** — offline-first sync engine with IndexedDB persistence; uses decorators (`@ClientModel`, `@Property`, `@Action`) to define model schemas in `models/`
- **PostGraphile** backend (models in `models/` reflect the DB schema)
- **Socket.io** for real-time sync

## Commands

```bash
# Install dependencies
yarn install  # or pnpm install

# Development (runs both syncEngine SW build and Vite dev server)
yarn dev

# Production build (runs both syncEngine SW build and Vite build)
yarn build

# Lint (ESLint)
yarn lint

# Format (Prettier)
yarn format

# Run a single test (if any exist)
yarn test
```

## Architecture

### API Layer (`src/api/`)
Axios-based client with interceptors. Key behaviors:
- **Cookie-based auth** — `withCredentials: true`, session stored in httpOnly cookie
- **Multi-tenant** — `X-Company-Id` header injected when company is selected
- **401 retry** — transparent session hydration via `/api/v1/auth/hydrateSession`
- **Backend envelope** — strips `meta` from responses; errors come as `{ error: { message, code, fields } }`

### syncEngine (`syncEngine/`)
Offline-first data sync with IndexedDB. Components:
- `core/` — `BaseModel`, `UpdateTransaction`, `ObjectPool`, `ModelRegistry`
- `decorators/` — `@ClientModel`, `@Property`, `@Action`, `@Computed` for schema definition
- `persistence/` — `IndexedDB`, `SyncTransaction`, `TransactionQueue`, `Hydration`
- `query/` — `QueryBuilder` for reactive queries
- `sw/` — Service worker for background sync
- `syncEngine.js` — main entry point

Models live in `models/` (PostGraphile schema). Composables in `src/composables/` wrap syncEngine queries with Vue reactivity via `useLiveQuery`.

### Composables (`src/composables/`)
Data access layer. Each `use*` composable (e.g., `useDocuments`, `useApprovalWorkflows`) wraps syncEngine and exposes reactive state. The `useLiveQuery` composable enables reactive queries that update the UI when local data changes.

### Components (`src/components/`)
Feature-organized. Components are auto-imported from `src/components/` and `resource/js/shared/components/` via `unplugin-vue-components`.

### Routing
File-based routing via `unplugin-vue-router`. Routes are defined by file structure under `src/pages/`. The `[companyCode]/` directory is a dynamic route segment.

### DateTime
Luxon `DateTime` is extended in `src/extensions/datetime`. Date strings from the API are automatically converted to Luxon `DateTime` objects via the Axios `transformResponse` interceptor.

### Real-time Sync
Socket.io connection in `src/api/socket.js`. Connects after app mounts using the httpOnly session cookie. The sync engine uses this for real-time updates.

## Key Patterns

- **Validation errors** — thrown as `ApiError` with `errors` object mapping field names to error arrays; shown via Quasar Notify
- **Session expiry** — handled by `eventBus.on('auth:session-expired')` which redirects to `/signin`
- **Decorators** — syncEngine uses TC39 decorators (`@babel/plugin-proposal-decorators`), not Stage 2 experimental syntax
- **Component auto-import** — components in `src/components/` are auto-imported, no manual imports needed
