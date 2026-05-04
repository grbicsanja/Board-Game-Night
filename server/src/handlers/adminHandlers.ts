import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@bgn/shared';
import {
  deleteGame,
  getAllGames,
  getAllSessions,
  getConnection,
  getGame,
  getLobbyPlayers,
  getSession,
  getSessionSummary,
  isGameInUse,
  removeConnection,
} from '../store';
import { endSession } from './sessionHandlers';

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

export function registerAdminHandlers(socket: TypedSocket, io: TypedServer): void {
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  socket.on('admin:auth', ({ token }, ack) => {
    if (!ADMIN_TOKEN) {
      ack({ ok: false, error: 'Admin disabled on this server.' });
      return;
    }
    if (token !== ADMIN_TOKEN) {
      ack({ ok: false, error: 'Invalid token.' });
      return;
    }
    socket.data.isAdmin = true;
    socket.join('lobby');
    const sessions = getAllSessions().map(getSessionSummary);
    const games = getAllGames();
    socket.emit('lobby:snapshot', {
      sessions,
      games,
      lobbyPlayers: getLobbyPlayers(),
    });
    ack({ ok: true });
  });

  socket.on('admin:end_session', ({ sessionId }, ack) => {
    if (!socket.data.isAdmin) {
      ack({ ok: false, error: 'Not authorized.' });
      return;
    }
    const session = getSession(sessionId);
    if (!session) {
      ack({ ok: false, error: 'Session not found.' });
      return;
    }
    endSession(io, session);
    ack({ ok: true });
  });

  socket.on('admin:remove_game', ({ gameId }, ack) => {
    if (!socket.data.isAdmin) {
      ack({ ok: false, error: 'Not authorized.' });
      return;
    }
    if (!getGame(gameId)) {
      ack({ ok: false, error: 'Game not found.' });
      return;
    }
    if (isGameInUse(gameId)) {
      ack({ ok: false, error: 'Game is in use by an active session.' });
      return;
    }
    deleteGame(gameId);
    io.to('lobby').emit('lobby:game_removed', { gameId });
    ack({ ok: true });
  });

  socket.on('admin:end_all_sessions', (ack) => {
    if (!socket.data.isAdmin) {
      ack({ ok: false, error: 'Not authorized.' });
      return;
    }
    const sessions = getAllSessions();
    for (const session of sessions) {
      endSession(io, session);
    }
    ack({ ok: true, ended: sessions.length });
  });

  socket.on('admin:kick_lobby_player', ({ socketId }, ack) => {
    if (!socket.data.isAdmin) {
      ack({ ok: false, error: 'Not authorized.' });
      return;
    }
    const target = io.sockets.sockets.get(socketId);
    if (target) {
      target.disconnect(true);
      ack({ ok: true });
      return;
    }
    if (getConnection(socketId)) {
      removeConnection(socketId);
      io.to('lobby').emit('lobby:players_updated', { players: getLobbyPlayers() });
      ack({ ok: true });
      return;
    }
    ack({ ok: false, error: 'Player not found.' });
  });
}
