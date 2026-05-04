import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@bgn/shared';
import {
  deleteSession,
  getAllGames,
  getAllSessions,
  getConnection,
  getLobbyPlayers,
  getSession,
  getSessionSummary,
  registerConnection,
  removeConnection,
  setConnectionSession,
  setSession,
  updateConnectionProfile,
} from '../store';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function registerPlayerHandlers(socket: TypedSocket, io: TypedServer): void {
  socket.on('player:register', ({ nickname, avatarUrl }) => {
    if (!nickname || nickname.trim().length === 0) return;
    registerConnection(socket.id, nickname.trim().slice(0, 20), sanitizeAvatarUrl(avatarUrl));
    socket.join('lobby');
    io.to('lobby').emit('lobby:players_updated', { players: getLobbyPlayers() });
  });

  socket.on('player:update', ({ nickname, avatarUrl }) => {
    const conn = getConnection(socket.id);
    if (!conn) return;

    const nextNickname =
      nickname !== undefined && nickname.trim().length > 0
        ? nickname.trim().slice(0, 20)
        : undefined;
    const nextAvatarUrl = avatarUrl !== undefined ? sanitizeAvatarUrl(avatarUrl) ?? '' : undefined;

    updateConnectionProfile(socket.id, {
      nickname: nextNickname,
      avatarUrl: nextAvatarUrl,
    });

    if (!conn.sessionId) return;
    const session = getSession(conn.sessionId);
    if (!session) return;

    const apply = <T extends { id: string; nickname: string; avatarUrl?: string }>(p: T): T => {
      if (p.id !== socket.id) return p;
      return {
        ...p,
        nickname: nextNickname ?? p.nickname,
        avatarUrl: nextAvatarUrl !== undefined ? nextAvatarUrl || undefined : p.avatarUrl,
      };
    };
    session.players = session.players.map(apply);
    session.waitlist = session.waitlist.map(apply);
    if (session.hostSocketId === socket.id) {
      if (nextNickname) session.hostNickname = nextNickname;
      if (nextAvatarUrl !== undefined) session.hostAvatarUrl = nextAvatarUrl || undefined;
    }
    setSession(session);

    const updated =
      session.players.find((p) => p.id === socket.id) ??
      session.waitlist.find((p) => p.id === socket.id);
    if (updated) {
      io.to(`session:${session.id}`).emit('session:player_updated', { player: updated });
    }
    io.to('lobby').emit('lobby:session_updated', getSessionSummary(session));
    io.to('lobby').emit('lobby:players_updated', { players: getLobbyPlayers() });
  });

  socket.on('session:join', ({ sessionId }) => {
    const conn = getConnection(socket.id);
    if (!conn) return;

    const session = getSession(sessionId);
    if (!session) {
      socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });
      return;
    }

    // Leave previous session if any
    if (conn.sessionId && conn.sessionId !== sessionId) {
      leaveSession(socket, io, conn.sessionId, conn.nickname);
    }

    socket.leave('lobby');
    socket.join(`session:${sessionId}`);
    setConnectionSession(socket.id, sessionId);

    // Idempotent rejoin: skip re-adding a socket that's already a member
    // (host's session:create → session:join, or a host returning from a
    // "minimize"). Send the snapshot so the client populates state.
    const alreadyMember =
      session.players.some((p) => p.id === socket.id) ||
      session.waitlist.some((p) => p.id === socket.id);

    if (alreadyMember) {
      socket.emit('session:snapshot', session);
      return;
    }

    const player: { id: string; nickname: string; avatarUrl?: string; joinedAt: number } = {
      id: socket.id,
      nickname: conn.nickname,
      avatarUrl: conn.avatarUrl,
      joinedAt: Date.now(),
    };

    if (session.status === 'open') {
      session.players.push(player);
      setSession(session);
      socket.emit('session:snapshot', session);
      socket.to(`session:${sessionId}`).emit('session:player_joined', { player });
    } else {
      session.waitlist.push(player);
      setSession(session);
      socket.emit('session:snapshot', session);
      socket.to(`session:${sessionId}`).emit('session:player_waitlisted', { player });
    }

    io.to('lobby').emit('lobby:session_updated', getSessionSummary(session));
    io.to('lobby').emit('lobby:players_updated', { players: getLobbyPlayers() });
  });

  socket.on('session:leave', ({ sessionId }) => {
    const conn = getConnection(socket.id);
    if (!conn) return;

    const session = getSession(sessionId);
    const isHost = !!session && session.hostSocketId === socket.id;

    leaveSession(socket, io, sessionId, conn.nickname);

    // For the host, "leave" means "minimize back to the lobby" — keep the
    // connection bound to the session so a real disconnect still ends it,
    // and so the host can resume from the lobby.
    if (!isHost) {
      setConnectionSession(socket.id, null);
    }
    socket.join('lobby');
    // Refresh the lobby view: while in the session this socket missed any
    // lobby:* broadcasts (including session_added for its own session).
    socket.emit('lobby:snapshot', {
      sessions: getAllSessions().map(getSessionSummary),
      games: getAllGames(),
      lobbyPlayers: getLobbyPlayers(),
    });
    io.to('lobby').emit('lobby:players_updated', { players: getLobbyPlayers() });
  });

  socket.on('disconnect', () => {
    const conn = removeConnection(socket.id);
    if (!conn) return;
    if (conn.sessionId) {
      leaveSession(socket, io, conn.sessionId, conn.nickname, true);
    } else {
      io.to('lobby').emit('lobby:players_updated', { players: getLobbyPlayers() });
    }
  });
}

function sanitizeAvatarUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 500) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}

function leaveSession(
  socket: TypedSocket,
  io: TypedServer,
  sessionId: string,
  nickname: string,
  isDisconnect = false
): void {
  const session = getSession(sessionId);
  if (!session) return;

  socket.leave(`session:${sessionId}`);

  const wasHost = session.hostSocketId === socket.id;

  // Host navigating back to the lobby keeps the session alive so they can
  // resume. Only an actual disconnect tears it down.
  if (wasHost && !isDisconnect) {
    return;
  }

  session.players = session.players.filter((p) => p.id !== socket.id);
  session.waitlist = session.waitlist.filter((p) => p.id !== socket.id);
  setSession(session);

  io.to(`session:${sessionId}`).emit('session:player_left', { playerId: socket.id });

  if (wasHost) {
    io.to(`session:${sessionId}`).emit('session:ended', { sessionId });
    io.to('lobby').emit('lobby:session_removed', { sessionId });
    deleteSession(sessionId);
  } else {
    io.to('lobby').emit('lobby:session_updated', getSessionSummary(session));
  }
}
