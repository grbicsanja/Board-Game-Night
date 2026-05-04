export type SessionStatus = 'open' | 'in_progress' | 'finished';

export interface Game {
  id: string;
  name: string;
  estimatedMinutes: number;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  addedBy: string;
  addedAt: number;
}

export interface Player {
  id: string;
  nickname: string;
  avatarUrl?: string;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  authorNickname: string;
  text: string;
  timestamp: number;
}

export interface Session {
  id: string;
  gameId: string;
  gameName: string;
  hostNickname: string;
  hostAvatarUrl?: string;
  hostSocketId: string;
  status: SessionStatus;
  players: Player[];
  waitlist: Player[];
  chat: ChatMessage[];
  reactions: Record<string, number>;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
}

export interface LobbyPlayer {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

export interface SessionSummary {
  id: string;
  gameId: string;
  gameName: string;
  hostNickname: string;
  hostAvatarUrl?: string;
  hostSocketId: string;
  status: SessionStatus;
  playerCount: number;
  waitlistCount: number;
  reactions: Record<string, number>;
  createdAt: number;
  playerNicknames: string[];
  waitlistNicknames: string[];
  players: LobbyPlayer[];
  waitlistPlayers: LobbyPlayer[];
  startedAt: number | null;
  maxPlayers: number;
}

// Socket.io typed events
export interface ServerToClientEvents {
  'lobby:snapshot': (data: {
    sessions: SessionSummary[];
    games: Game[];
    lobbyPlayers: LobbyPlayer[];
  }) => void;
  'lobby:session_added': (session: SessionSummary) => void;
  'lobby:session_updated': (session: SessionSummary) => void;
  'lobby:session_removed': (data: { sessionId: string }) => void;
  'lobby:game_added': (game: Game) => void;
  'lobby:game_removed': (data: { gameId: string }) => void;
  'lobby:players_updated': (data: { players: LobbyPlayer[] }) => void;
  'session:snapshot': (session: Session) => void;
  'session:player_joined': (data: { player: Player }) => void;
  'session:player_waitlisted': (data: { player: Player }) => void;
  'session:player_left': (data: { playerId: string }) => void;
  'session:player_updated': (data: { player: Player }) => void;
  'session:status_changed': (data: { sessionId: string; status: SessionStatus }) => void;
  'session:ended': (data: { sessionId: string }) => void;
  'chat:message': (message: ChatMessage) => void;
  'reaction:updated': (data: { sessionId: string; reactions: Record<string, number> }) => void;
  error: (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'player:register': (data: { nickname: string; avatarUrl?: string }) => void;
  'player:update': (data: { nickname?: string; avatarUrl?: string }) => void;
  'session:create': (
    data: { gameId: string },
    ack: (response: { sessionId: string } | { error: string }) => void
  ) => void;
  'session:join': (data: { sessionId: string }) => void;
  'session:leave': (data: { sessionId: string }) => void;
  'session:start': (data: { sessionId: string }) => void;
  'session:pause': (data: { sessionId: string }) => void;
  'session:end': (data: { sessionId: string }) => void;
  'session:cancel': (data: { sessionId: string }) => void;
  'session:react': (data: { sessionId: string; emoji: string }) => void;
  'chat:send': (data: { sessionId: string; text: string }) => void;
  'game:add': (
    data: {
      name: string;
      estimatedMinutes: number;
      category: string;
      minPlayers: number;
      maxPlayers: number;
    },
    ack: (response: { game: Game } | { error: string }) => void
  ) => void;
  'admin:auth': (
    data: { token: string },
    ack: (response: { ok: true } | { ok: false; error: string }) => void
  ) => void;
  'admin:end_session': (
    data: { sessionId: string },
    ack: (response: { ok: true } | { ok: false; error: string }) => void
  ) => void;
  'admin:remove_game': (
    data: { gameId: string },
    ack: (response: { ok: true } | { ok: false; error: string }) => void
  ) => void;
  'admin:end_all_sessions': (
    ack: (response: { ok: true; ended: number } | { ok: false; error: string }) => void
  ) => void;
  'admin:kick_lobby_player': (
    data: { socketId: string },
    ack: (response: { ok: true } | { ok: false; error: string }) => void
  ) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  nickname: string;
  avatarUrl?: string;
  sessionId: string | null;
  isAdmin?: boolean;
}
