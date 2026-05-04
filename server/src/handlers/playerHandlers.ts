import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@bgn/shared';
import {
  deleteSession,
  getConnection,
  getSession,
  getSessionSummary,
  registerConnection,
  removeConnection,
  setConnectionSession,
  setSession,
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
  socket.on('player:register', ({ nickname }) => {
    if (!nickname || nickname.trim().length === 0) return;
    registerConnection(socket.id, nickname.trim().slice(0, 20));
    socket.join('lobby');
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

    const player = { id: socket.id, nickname: conn.nickname, joinedAt: Date.now() };

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
  });

  socket.on('session:leave', ({ sessionId }) => {
    const conn = getConnection(socket.id);
    if (!conn) return;
    leaveSession(socket, io, sessionId, conn.nickname);
    setConnectionSession(socket.id, null);
    socket.join('lobby');
  });

  socket.on('disconnect', () => {
    const conn = removeConnection(socket.id);
    if (!conn) return;
    if (conn.sessionId) {
      leaveSession(socket, io, conn.sessionId, conn.nickname);
    }
  });
}

function leaveSession(
  socket: TypedSocket,
  io: TypedServer,
  sessionId: string,
  nickname: string
): void {
  const session = getSession(sessionId);
  if (!session) return;

  socket.leave(`session:${sessionId}`);

  const wasHost = session.hostSocketId === socket.id;

  session.players = session.players.filter((p) => p.id !== socket.id);
  session.waitlist = session.waitlist.filter((p) => p.id !== socket.id);
  setSession(session);

  io.to(`session:${sessionId}`).emit('session:player_left', { playerId: socket.id });

  if (wasHost) {
    // Cancel session when host disconnects
    io.to(`session:${sessionId}`).emit('session:ended', { sessionId });
    io.to('lobby').emit('lobby:session_removed', { sessionId });
    deleteSession(sessionId);
  } else {
    io.to('lobby').emit('lobby:session_updated', getSessionSummary(session));
  }
}
