import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@bgn/shared';
import { v4 as uuid } from 'uuid';
import { addGame, getConnection } from '../store';

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

export function registerGameLibraryHandlers(socket: TypedSocket, io: TypedServer): void {
  socket.on('game:add', ({ name, estimatedMinutes, category, minPlayers, maxPlayers }, ack) => {
    const conn = getConnection(socket.id);
    if (!conn) {
      ack({ error: 'Not registered.' });
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      ack({ error: 'Game name is required.' });
      return;
    }

    const game = {
      id: uuid(),
      name: trimmedName.slice(0, 100),
      estimatedMinutes: Math.max(1, Math.min(600, estimatedMinutes)),
      category: category.trim().slice(0, 50),
      minPlayers: Math.max(1, minPlayers),
      maxPlayers: Math.max(1, maxPlayers),
      addedBy: conn.nickname,
      addedAt: Date.now(),
    };

    addGame(game);
    io.to('lobby').emit('lobby:game_added', game);
    ack({ game });
  });
}
