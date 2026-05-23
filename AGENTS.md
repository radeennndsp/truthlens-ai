# TruthLens AI — Agent Guide

## Commands
| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts Express API + Vite dev server (middleware mode) on `:3000` |
| `npm run build` | Builds frontend **only** → `dist/` |
| `npm run start` | `tsx server.ts` (production: `NODE_ENV=production` serves `dist/`) |
| `npm run lint` | `eslint . --ext .ts,.tsx` (no ESLint config found — may fail) |

No test or typecheck scripts exist. Use `npx tsc --noEmit` if needed.

## Architecture
- **Backend**: `server.ts` — Express API + Vite middleware in dev, static `dist/` in prod
- **Frontend**: `src/main.tsx` → `App.tsx` (SPA with 4 tabs: home/dashboard/about/api)
- **Entrypoints**: `server.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
- **API routes**: `POST /api/analyze` (image base64), `POST /api/analyze-doc` (multipart), `POST /api/chat`, `GET /api/health`
- **Rate limit**: 5 req / 10 min on analyze endpoints
- **Gemini model**: `gemini-3.5-flash`, response forced to JSON via `responseMimeType`
- **Path alias**: `@/*` → project root (both tsconfig & vite.config)

## Important conventions
- **Tailwind v4**: CSS-based config via `@theme` in `src/index.css`. No `tailwind.config.*`. Plugin `@tailwindcss/vite`.
- **Bi-lingual**: Language toggle (id/en) in `LanguageContext`. UI strings in `translations` dict inside `LanguageContext.tsx`.
- **Theme**: Dark/light via CSS variables in `:root` / `.dark` (in `index.css`). `ThemeContext` manages the class.
- **`cn()` utility**: from `src/lib/utils.ts` — wraps `clsx` + `tailwind-merge`.
- **Fonts**: Playfair Display (serif — headings), Inter (sans — UI), Geist Mono (code).
- **PDF/DOCX parsing**: Uses `createRequire` (ESM workaround) for dynamic `require('pdf-parse')` and `require('mammoth')`.

## Auth & Storage
- **Firebase**: config in `firebase-applet-config.json`, init in `src/firebase.ts`
- **Providers**: Google, GitHub (popup), email/password
- **Scans stored**: Firestore collection `/scans/{scanId}` for logged-in users
- **Anonymous scans**: tracked in localStorage key `truthlens_anon_scans`, limit 3
- **Scan limit**: 3 total per user (logged-in or anonymous)

## Environment (`cp .env.example .env`)
Required: `GEMINI_API_KEY`, `PORT=3000`, `NODE_ENV`, Firebase `VITE_FIREBASE_*` vars

## Mobile
- Capacitor config in `capacitor.config.ts` — `webDir: 'dist'`, appId `com.truthlens.app`
- Android: `android/`, iOS: `ios/`

## Docker / Cloud Run
- Dockerfile builds `dist/` then runs `cross-env NODE_ENV=production tsx server.ts`
- Port 8080 (Cloud Run convention)
- `docker-compose.yml` maps `:8080`, passes `GEMINI_API_KEY`

## Quirks
- **HMR**: Disable with `DISABLE_HMR=true` env var (for AI Studio)
- **Server bug**: `server.ts:239` checks `NODE_VALUE` instead of `NODE_ENV` — production detection may be broken
- **Body limit**: 50MB for JSON/URL-encoded and file uploads
- **No ESLint config**: `eslint` script exists but no `.eslintrc*` found
- **`GEMINI.md`** just contains `@AGENTS.md` — ignore it
