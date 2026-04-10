# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sapana is a 3D globe and streaming platform. The frontend is a Next.js 15 app (App Router, React 19) that consumes the MediaCMS REST API for video hosting/streaming. The backend is an unmodified MediaCMS Docker deployment.

## Commands

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Start everything (backend + frontend) | `pnpm dev:all` |
| Start frontend only | `pnpm dev` |
| Start MediaCMS backend | `pnpm backend:up` |
| Stop MediaCMS backend | `pnpm backend:down` |
| View backend logs | `pnpm backend:logs` |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| Clean build artifacts | `pnpm clean` |

Root scripts use Turborepo. To run a command in a specific workspace: `pnpm --filter @sapana/web <script>`.

`pnpm dev:all` runs `scripts/dev.sh`, which brings the backend up via docker compose and then starts `turbo run dev`. On exit it tears the backend down.

### OpenAPI Codegen

The typed API client is generated from MediaCMS's live OpenAPI spec. The backend must be running:

```bash
pnpm --filter @sapana/web api:fetch-spec   # curls /swagger/?format=openapi → openapi-v3.json
pnpm --filter @sapana/web api:generate     # openapi-typescript → src/api/schema.d.ts
```

Re-run both whenever the backend API surface changes. `openapi-v3.json` and `src/api/schema.d.ts` are committed artifacts.

## Architecture

**Monorepo** managed by pnpm workspaces + Turborepo.

- `apps/web/` — Next.js 15 (App Router) frontend. Uses `@/*` path alias mapping to `./src/*`.
- `backend/` — Docker Compose stack running MediaCMS (PostgreSQL, Redis, Celery beat + worker, web). No custom backend code; this is a configured deployment of the [MediaCMS](https://github.com/mediacms-io/mediacms) Docker image. Exposes MediaCMS on `http://localhost:80`. Seeded admin user: `admin` / `changeme` (see `backend/docker-compose.yml`).
- `packages/` — Shared packages (currently empty, placeholder for future use).
- `scripts/dev.sh` — convenience launcher used by `pnpm dev:all`.

### Frontend data layer

There are **two parallel ways** to talk to MediaCMS, and both currently coexist in the codebase:

1. **Typed OpenAPI client (`src/api/`)** — the preferred path. Built on `openapi-fetch` + generated `schema.d.ts`:
   - `client.ts` exports `api`, a **browser-side** client with `baseUrl: "/api/cms"` that goes through the Next.js rewrite proxy.
   - `server.ts` exports `apiServer`, a **server-side** client that hits `${MEDIACMS_URL}/api/v1` directly. Use in Server Components and Route Handlers.
   - `queries/` contains TanStack Query hooks and `queryOptions` factories (one file per resource: `media`, `playlists`, `users`, `search`). Each file exports both `xxxOptions(...)` (for `queryOptions`/prefetching) and `useXxx(...)` hooks.
   - `queries/keys.ts` is a structured **query key factory** — always derive keys from it rather than hand-writing arrays, so cache invalidation stays consistent (e.g. `queryKeys.media.detail(token)`).
   - `provider.tsx` wraps the app in `QueryClientProvider`; defaults live in `query-client.ts` (`staleTime: 60s`, `refetchOnWindowFocus: false`). It is mounted in `app/layout.tsx`.

2. **Legacy SSR helpers (`src/lib/mediacms.ts`)** — a thin wrapper around `apiServer` exposing `getMedia()`, `getMediaByToken()`, and `resolveMediaUrl()`. Still used by `app/page.tsx` and `app/watch/[token]/page.tsx`. Prefer calling `apiServer` directly (or using the `queries/` layer for client components) in new code; migrate these helpers away opportunistically.

All page components currently use `export const dynamic = "force-dynamic"` — SSR is uncached.

### Next.js rewrite proxy

`next.config.ts` rewrites `/api/cms/:path*` → `${MEDIACMS_URL}/api/v1/:path*`. This is what lets the browser-side `api` client call MediaCMS without CORS. `MEDIACMS_URL` defaults to `http://localhost` and is also whitelisted under `images.remotePatterns` for `next/image`.

### Video player

`src/components/player.tsx` is a client component using `@videojs/react`. It prefers HLS (`media.hls_info.master_file`) and falls back to `original_media_url`. Both URLs are relative and must be passed through `resolveMediaUrl()` before being handed to the player.

### UI / styling

- **shadcn/ui** is configured via `apps/web/components.json` (style: `base-nova`, base color `neutral`, icon library `lucide`). Generated primitives live in `src/components/ui/`; app-level components live directly under `src/components/`.
- **Tailwind CSS v4** via `@tailwindcss/postcss`. Global styles and theme tokens live in `src/styles/globals.css` (imported in `app/layout.tsx`).
- `src/lib/utils.ts` exports the standard shadcn `cn()` helper (`clsx` + `tailwind-merge`).

## Environment Variables

- `MEDIACMS_URL` — Base URL of the MediaCMS instance (default: `http://localhost`). Used by `src/api/server.ts`, `src/lib/mediacms.ts`, and the `next.config.ts` rewrite. Set in `apps/web/.env.local`.
