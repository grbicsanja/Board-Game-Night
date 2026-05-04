import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@bgn/shared';
import { v4 as uuid } from 'uuid';
import { getConnection, getSession, setSession } from '../store';

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

const MAX_CHAT_MESSAGES = 200;
const MAX_TEXT_LENGTH = 500;

export function registerChatHandlers(socket: TypedSocket, io: TypedServer): void {
  socket.on('chat:send', ({ sessionId, text }) => {
    const conn = getConnection(socket.id);
    if (!conn) return;

    const trimmed = text.trim().slice(0, MAX_TEXT_LENGTH);
    if (!trimmed) return;

    const session = getSession(sessionId);
    if (!session) return;

    const message = {
      id: uuid(),
      sessionId,
      authorNickname: conn.nickname,
      text: trimmed,
      timestamp: Date.now(),
    };

    session.chat.push(message);
    if (session.chat.length > MAX_CHAT_MESSAGES) {
      session.chat = session.chat.slice(-MAX_CHAT_MESSAGES);
    }
    setSession(session);

    io.to(`session:${sessionId}`).emit('chat:message', message);
  });
}
