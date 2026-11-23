# wietyy's amazing AGENTS.md template
> Revision: Nov 23, 2026

## Quoth Cave Johnson, "what the hell am i supposed to do with this"?
- This is the AGENTS.md file.
- Every time you do something in the project, look through here under "Agent Notes" and check the bullets.
- Update the bullets to help a future agent out.
- That's literally it.

## Development Workflow
- I will tell you when to check a file called `agent-spec.md`.
- Read through it and understand the assignment.
- Good luck and have fun. If you have any additional questions or specifications that need to be written please ask me within the chat and I will answer them.
- Be sure to think about things such as edge cases and ask me how to handle that as well.

## Project-Specific Constraints

## Agent Notes (place bullets here)

### What this is
- "JOHN" — a personal finance tracker (transactions, funds, notes, cloud backup). Portfolio project, MIT licensed.
- Two halves, both TypeScript: `frontend/` (React 19 + Vite + Tailwind v4, routed with `react-router`) and `backend/` (Express 5 on Bun, `pg` pool).
- No test files exist anywhere. Do not claim test coverage; verification is `tsc -b` / `vite build` / `oxlint` plus manual checking.

### Running it
- Frontend dev: `cd frontend && bun install && bun run dev`. Build: `bun run build` (runs `tsc -b && vite build` into `frontend/dist`). Lint: `bun run lint` (oxlint).
- Backend has no scripts. Run it directly: `bun run backend/src/index.ts` (Bun-native; uses `Bun.env`, not `process.env`, for the DB URL).
- The backend serves `frontend/dist` statically, so the built frontend must exist before `/app` works locally. Dockerfile does the build for you.
- Required env var: `POSTGRES` (Postgres connection string). `backend/src/db.ts` throws at startup if it is missing. README shows the Docker run command.
- Schema is `schema.psql`: one table `main (id, password_hash, userdata)`.

### Architecture facts that bite
- **Multi-JOHN**: several independent trackers share one database/browser. Per-JOHN data lives in localStorage under `getScopedStorageKey(key, johnId)` → `"<key>-<johnId>"` (`transactions`, `funds`, `keyNum`, `textNotes`). Unscoped keys (`johns`, `currentJohnId`, `documentTitle`, `theme`, `loginKey`) are global.
- `textNotes` has a one-time migration: JOHN 1 reads the legacy unscoped `textNotes` key.
- **Cloud sync**: the client encrypts a JSON blob of all localStorage (minus `loginKey`) with `@wietyy/easycrypt`, using the login key as the password, and POSTs it. The server never sees plaintext data, but it *does* see the password on every call.
- `backend/src/db.ts` identifies a user by bcrypt-comparing the password against **every row** of `main` (cost 12); `getData` is O(rows) by design. Adding an index/column changes that flow.
- API surface is only two endpoints: `POST /api/getCloudData` `{password} → {data}`, `POST /api/setCloudData` `{password, data} → {result: "success"|"error"}`. Rate limit: 100 req / 15 min, global.
- Auto-sync every 15s while logged in, plus a `beforeunload` prompt when localStorage differs from the last saved payload. Touching save/load logic means re-checking `lastSavedPayloadRef`.
- `App.tsx` resets notes/stats/funds/creating-state when `currentJohnId` changes via a render-time `lastJohnId` comparison — keep that pattern if you add per-JOHN state.

### Conventions to match
- Styling: only semantic theme tokens (`bg-app-panel`, `text-app-muted`, `border-app-border-strong`, …) from `frontend/src/tailwind.css`. Never raw Tailwind palette colors. A new theme needs both a `[data-theme="…"]` block there and an entry in `THEMES` in `App.tsx`.
- Three tokens exist only so themes can differ per surface: `bg-app-surface` (content sections, previously `bg-app-panel/40`), `bg-app-hover` (table row hover), and `bg-app-dialog` (modal panels — **always** use this for dialogs, never `bg-app-panel`, or the glass theme turns forms see-through).
- The `custom` theme is neutral black glass (no blue tint, like a car window): `App.tsx` sets `data-theme="custom"` plus inline CSS vars on `<html>`, and a blurred `body::before` layer shows the user's image. Header/footer/wash stay at fixed ~90% opacity, content sections follow the picker's opacity slider, and dialogs deliberately stay solid.
- Code style in this repo is deliberately verbose: named intermediate `const`s instead of chained one-liners, `function` declarations over arrow consts for handlers, early returns over nested conditionals, `isX`/`hasX` boolean names. Write in that voice.
- Indentation differs by package: backend 4 spaces, frontend 2 spaces. Backend tsconfig is strict with `noUncheckedIndexedAccess`; frontend allows `noImplicitAny: false` but errors on unused locals/params (`erasableSyntaxOnly` is on — no enums/parameter properties).
- Confirmations use `window.prompt`/`window.confirm`/`window.alert` and `<dialog>` with `showModal()`. Match that rather than adding a modal library.

### Gotchas
- Custom theme settings are three global keys (not per-JOHN, so cloud sync picks them up for free): `customBackgroundImage` (URL), `customBlockOpacity` (0–100, default 90) and `customBackgroundBlur` (0–10 px, default 10). `App.tsx` pushes them to `<html>` as `--custom-image-url`, `--custom-block-alpha` / `--custom-block-hover-alpha`, and `--custom-image-blur`; the `[data-theme="custom"]` block references those vars.
- The image is painted on `body::before` (fixed, `filter: blur()`, negative `inset` scaled to the blur radius). Never put it on `<body>` itself — the filter would blur the app content too, and a static inset would leave a see-through halo at high blur.
- URL validation happens in an effect in `App.tsx`: a failed `<img>` alert clears the URL, removes `--custom-image-url` and forces the `dark` theme; commit is on Enter/blur in the picker, not per keystroke. Slider changes save immediately so the 15s cloud sync sees the current value.
- Deleting a JOHN removes its scoped keys but the cloud copy only shrinks after the next successful sync.
- The `mike.svg` avatar in `ActionBar` and `Home` is loaded from a raw.githubusercontent URL, not from `public/`.
- Bump the `Revision:` date at the top of this file whenever you edit it.
