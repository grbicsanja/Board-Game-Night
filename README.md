# Board Game Night

A real-time session management web app for board game nights. Guests join via a shared URL, pick a nickname, and coordinate games from a shared lobby — no accounts required.

## Features

- **Shared lobby** — see all active game sessions in real time
- **Host or join** — create a session for any game in the library, or join one with a tap
- **Waitlist** — join in-progress games and get notified when a spot opens
- **Per-session chat** — chat with your table while you play
- **Emoji reactions** — react to sessions from the lobby
- **Game library** — anyone can add games; seeded with 10 common titles
- **Clean slate** — everything lives in server memory; restarting the server resets the night

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + Socket.io |
| State | In-memory (no database) |
| Client state | Zustand |
| Deploy | Railway / Render |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001
- API health check: http://localhost:3001/api/health

### Build for production

```bash
npm run build
npm start
```

The server serves the built client as static files — a single process handles everything. Static assets are gzip-compressed and served with a 1-year `immutable` cache (Vite hash-renames them on every build, so cached copies are always safe).

## Sharing your laptop

For an in-office game night where everyone is on the same Wi-Fi, point guests at your laptop directly:

```bash
npm run build && npm start
ipconfig getifaddr en0   # macOS — find your Wi-Fi IP
```

Share `http://<your-ip>:3001/` (or whichever `PORT` you set). On macOS, `http://<your-mac-name>.local:3001/` also works and follows you across DHCP changes (`scutil --get LocalHostName` to find it).

If you need a public URL — guests off the Wi-Fi, or a remote demo — use the bundled tunnel script:

```bash
npm run tunnel                          # random *.loca.lt subdomain, port 3030
npm run tunnel -- a8c-boardgamenight    # custom subdomain
PORT=4000 npm run tunnel -- alice-bgn   # custom port + subdomain
```

`npm run tunnel` runs the production build, starts the server, and opens a [localtunnel](https://github.com/localtunnel/localtunnel) at `https://<subdomain>.loca.lt`. Anyone on the internet with the URL can join — fine for a game night, not for sensitive use. First-time visitors see a localtunnel warning page asking for the host's public IP (look it up at https://loca.lt/mytunnelpassword from a device on the same network as the host).

Subdomains are global on `loca.lt`. If yours is already in use the request is silently ignored and you get a random one — read the `your url is:` line.

## Deployment

### Railway

1. Push to GitHub
2. Create a new Railway project from the repo
3. Set `NODE_ENV=production` (Railway sets `PORT` automatically)
4. Deploy — the included `railway.toml` handles build and start commands

### Render

Use `render.yaml` (included). Set `NODE_ENV=production`.

## Project Structure

```
shared/          # TypeScript interfaces shared by client and server
server/          # Express + Socket.io backend
  src/
    index.ts     # app bootstrap
    store.ts     # in-memory state
    handlers/    # socket event handlers
    routes/      # REST endpoints
client/          # React + Vite frontend
  src/
    pages/       # LobbyPage, SessionPage, AddGamePage
    components/  # lobby/, session/, shared/
    hooks/       # useSocket, useNickname, useSessionSync
    store/       # Zustand store
```

## Session States

```
open → in_progress → (ended/cancelled)
```

Host controls the lifecycle. If the host disconnects, the session is cancelled and all players return to the lobby.
