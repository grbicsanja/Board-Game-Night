# CLAUDE.md

## Project

Real-time board game night session manager. ~50 concurrent users. No database — all state lives in server memory. Single Node.js process serves both the API and the built React client in production.

## Commands

```bash
npm install          # install all workspaces
npm run dev          # client (5173) + server (3001) concurrently
npm run build        # build shared → client → server
npm start            # run production build
```

## Architecture

Three npm workspaces: `shared`, `server`, `client`.

- `shared/types.ts` — single source of truth for all TypeScript interfaces and Socket.io event payloads. Both server and client import from here. Change data shapes here first.
- `server/src/store.ts` — in-memory singleton. All socket handlers import it directly. No dependency injection.
- `client/src/store/useAppStore.ts` — Zustand store. Actions map 1:1 to socket event listeners in `useSocket.ts`.
- `client/src/hooks/useSocket.ts` — registers all server→client socket listeners once, at app root. This is the bridge between real-time events and React state.

## Socket Event Conventions

- Format: `noun:verb` (e.g. `session:create`, `player:register`)
- Client→server events use acknowledgement callbacks for operations that return data (e.g. `session:create` acks with `{ sessionId }`)
- Server→client lobby-scoped events are prefixed `lobby:` and go to the `lobby` Socket.io room
- Server→client session-scoped events are prefixed `session:` and go to the `session:{id}` room
- Add new events to `shared/types.ts` first (in the `ServerToClientEvents` / `ClientToServerEvents` interfaces), then implement handlers

## Room Strategy

Every socket joins the `lobby` room after `player:register`. When a player joins a session, their socket leaves `lobby` and joins `session:{sessionId}`. When they leave or the session ends, they rejoin `lobby`. This ensures lobby updates are not sent to players who are inside a session.

## State Mutations

All server state mutations must:
1. Update `store.ts`
2. Emit to the session room (`session:{id}`) if session-scoped
3. Emit `lobby:session_updated` or `lobby:session_removed` to the `lobby` room so the lobby stays in sync

## Adding a New Socket Event

1. Add types to `shared/types.ts`
2. Add the handler in the appropriate file under `server/src/handlers/`
3. Register it in `server/src/index.ts` (where handlers are wired to the socket)
4. Add the Zustand action in `client/src/store/useAppStore.ts`
5. Register the listener in `client/src/hooks/useSocket.ts`

## Frontend Conventions

- All interactive elements use native HTML (`<button>`, `<input>`, `<select>`) — no `div` click handlers
- `SessionCard` is a `<button>` with a descriptive `aria-label`
- `Modal.tsx` is the single reusable modal wrapper — use it for all dialogs (focus trap, Escape key, backdrop click, `aria-modal`)
- Destructive actions in `HostControls` use inline confirm state, not `window.confirm()`
- Status is always communicated with both color and text (never color alone)
- Touch targets are minimum 44×44px

## In-Memory Store Limits

- Chat messages per session: capped at 200 (oldest dropped)
- Session history: sessions are deleted immediately after `session:ended` broadcast — no retention
- Game library: unbounded but expected to stay small (<100 games per night)

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `PORT` | In production | Set automatically by Railway/Render |
| `NODE_ENV` | In production | Set to `production` in deploy config |
| `SERVER_PORT` | No | Dev only — overrides the Vite proxy target in `client/vite.config.ts`. Use when running the server on a non-default port alongside another instance. |
| `ADMIN_TOKEN` | No | Enables the server-operator admin panel at `/admin`. When unset, `admin:auth` always rejects and the panel is unreachable. See [Admin](#admin). |

No secrets, no API keys, no database URLs needed.

## Admin

A server-operator role distinct from per-session host. Auth is gated by the `ADMIN_TOKEN` env var: when set, an operator visiting `/admin` enters the token, which is sent via `admin:auth` and persisted in `sessionStorage` for the tab. Successful auth flips `socket.data.isAdmin` on the connection; every admin handler checks the flag before acting.

Capabilities (all in `server/src/handlers/adminHandlers.ts`):

- `admin:end_session` — force-end any session. Reuses the same `endSession` lifecycle as the host's own `session:end` (`session:ended` to the room → `lobby:session_removed` → delete from store).
- `admin:remove_game` — delete a game from the library. Refuses if any active session references it; broadcasts `lobby:game_removed` so all lobbies stay in sync.
- `admin:end_all_sessions` — iterate all sessions and end each.

The admin handler also emits a `lobby:snapshot` to the authenticating socket and joins it to the `lobby` room, so the panel sees live updates without registering as a player. To enable on a deploy, set `ADMIN_TOKEN=<some-secret>` in the platform's env config.

## Health Check

`GET /api/health` → `{ status: 'ok', uptime: <seconds> }`. Used by Railway/Render to verify the process is alive.
