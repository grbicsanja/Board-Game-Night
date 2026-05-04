import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  Session,
  SocketData,
} from '@bgn/shared';
import { v4 as uuid } from 'uuid';
import {
  deleteSession,
  getConnection,
  getGame,
  getAllSessions,
  getAllGames,
  getSession,
  getSessionSummary,
  setConnectionSession,
  setSession,
  toggleReaction,
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

export function registerSessionHandlers(socket: TypedSocket, io: TypedServer): void {
  // Send full lobby snapshot when a socket registers
  socket.on('player:register', () => {
    const sessions = getAllSessions().map(getSessionSummary);
    const games = getAllGames();
    socket.emit('lobby:snapshot', { sessions, games });
  });

  socket.on('session:create', ({ gameId }, ack) => {
    const conn = getConnection(socket.id);
    if (!conn) {
      ack({ error: 'Not registered.' });
      return;
    }

    const game = getGame(gameId);
    if (!game) {
      ack({ error: 'Game not found.' });
      return;
    }

    const session: Session = {
      id: uuid(),
      gameId: game.id,
      gameName: game.name,
      hostNickname: conn.nickname,
      hostSocketId: socket.id,
      status: 'open',
      players: [{ id: socket.id, nickname: conn.nickname, joinedAt: Date.now() }],
      waitlist: [],
      chat: [],
      reactions: {},
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
    };

    setSession(session);
    socket.leave('lobby');
    socket.join(`session:${session.id}`);
    setConnectionSession(socket.id, session.id);

    io.to('lobby').emit('lobby:session_added', getSessionSummary(session));
    ack({ sessionId: session.id });
  });

  socket.on('session:start', ({ sessionId }) => {
    const session = getSession(sessionId);
    if (!session || session.hostSocketId !== socket.id) return;
    if (session.status !== 'open') return;

    session.status = 'in_progress';
    session.startedAt = Date.now();
    setSession(session);

    io.to(`session:${sessionId}`).emit('session:status_changed', {
      sessionId,
      status: 'in_progress',
    });
    io.to('lobby').emit('lobby:session_updated', getSessionSummary(session));
  });

  socket.on('session:pause', ({ sessionId }) => {
    const session = getSession(sessionId);
    if (!session || session.hostSocketId !== socket.id) return;
    if (session.status !== 'in_progress') return;

    session.status = 'open';
    setSession(session);

    io.to(`session:${sessionId}`).emit('session:status_changed', { sessionId, status: 'open' });
    io.to('lobby').emit('lobby:session_updated', getSessionSummary(session));
  });

  socket.on('session:end', ({ sessionId }) => {
    const session = getSession(sessionId);
    if (!session || session.hostSocketId !== socket.id) return;

    endSession(io, session);
  });

  socket.on('session:cancel', ({ sessionId }) => {
    const session = getSession(sessionId);
    if (!session || session.hostSocketId !== socket.id) return;
    if (session.status !== 'open') return;

    endSession(io, session);
  });

  socket.on('session:react', ({ sessionId, emoji }) => {
    const session = getSession(sessionId);
    if (!session) return;

    const added = toggleReaction(sessionId, emoji, socket.id);
    const current = session.reactions[emoji] ?? 0;
    session.reactions[emoji] = Math.max(0, current + (added ? 1 : -1));
    if (session.reactions[emoji] === 0) delete session.reactions[emoji];
    setSession(session);

    io.to('lobby').emit('reaction:updated', { sessionId, reactions: session.reactions });
  });
}

function endSession(io: TypedServer, session: Session): void {
  const sessionId = session.id;
  io.to(`session:${sessionId}`).emit('session:ended', { sessionId });
  io.to('lobby').emit('lobby:session_removed', { sessionId });
  deleteSession(sessionId);
}
