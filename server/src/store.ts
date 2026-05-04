import { Game, Session, SessionSummary } from '@bgn/shared';

interface ConnectionInfo {
  nickname: string;
  sessionId: string | null;
}

interface Store {
  sessions: Map<string, Session>;
  games: Map<string, Game>;
  reactions: Map<string, Set<string>>;
  connections: Map<string, ConnectionInfo>;
}

const store: Store = {
  sessions: new Map(),
  games: new Map(),
  reactions: new Map(),
  connections: new Map(),
};

export function getSession(id: string): Session | undefined {
  return store.sessions.get(id);
}

export function setSession(session: Session): void {
  store.sessions.set(session.id, session);
}

export function deleteSession(id: string): void {
  store.sessions.delete(id);
  for (const key of store.reactions.keys()) {
    if (key.startsWith(`${id}:`)) store.reactions.delete(key);
  }
}

export function getAllSessions(): Session[] {
  return Array.from(store.sessions.values());
}

export function getGame(id: string): Game | undefined {
  return store.games.get(id);
}

export function getAllGames(): Game[] {
  return Array.from(store.games.values());
}

export function addGame(game: Game): void {
  store.games.set(game.id, game);
}

export function registerConnection(socketId: string, nickname: string): void {
  store.connections.set(socketId, { nickname, sessionId: null });
}

export function getConnection(socketId: string): ConnectionInfo | undefined {
  return store.connections.get(socketId);
}

export function setConnectionSession(socketId: string, sessionId: string | null): void {
  const conn = store.connections.get(socketId);
  if (conn) conn.sessionId = sessionId;
}

export function removeConnection(socketId: string): ConnectionInfo | undefined {
  const conn = store.connections.get(socketId);
  store.connections.delete(socketId);
  return conn;
}

export function toggleReaction(sessionId: string, emoji: string, socketId: string): boolean {
  const key = `${sessionId}:${emoji}`;
  if (!store.reactions.has(key)) store.reactions.set(key, new Set());
  const set = store.reactions.get(key)!;
  if (set.has(socketId)) {
    set.delete(socketId);
    return false;
  } else {
    set.add(socketId);
    return true;
  }
}

export function getSessionSummary(session: Session): SessionSummary {
  return {
    id: session.id,
    gameId: session.gameId,
    gameName: session.gameName,
    hostNickname: session.hostNickname,
    hostSocketId: session.hostSocketId,
    status: session.status,
    playerCount: session.players.length,
    waitlistCount: session.waitlist.length,
    reactions: { ...session.reactions },
    createdAt: session.createdAt,
  };
}
