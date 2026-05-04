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

export interface SessionSummary {
  id: string;
  gameId: string;
  gameName: string;
  hostNickname: string;
  hostSocketId: string;
  status: SessionStatus;
  playerCount: number;
  waitlistCount: number;
  reactions: Record<string, number>;
  createdAt: number;
}

// Socket.io typed events
export interface ServerToClientEvents {
  'lobby:snapshot': (data: { sessions: SessionSummary[]; games: Game[] }) => void;
  'lobby:session_added': (session: SessionSummary) => void;
  'lobby:session_updated': (session: SessionSummary) => void;
  'lobby:session_removed': (data: { sessionId: string }) => void;
  'lobby:game_added': (game: Game) => void;
  'session:snapshot': (session: Session) => void;
  'session:player_joined': (data: { player: Player }) => void;
  'session:player_waitlisted': (data: { player: Player }) => void;
  'session:player_left': (data: { playerId: string }) => void;
  'session:status_changed': (data: { sessionId: string; status: SessionStatus }) => void;
  'session:ended': (data: { sessionId: string }) => void;
  'chat:message': (message: ChatMessage) => void;
  'reaction:updated': (data: { sessionId: string; reactions: Record<string, number> }) => void;
  error: (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'player:register': (data: { nickname: string }) => void;
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
}

export interface InterServerEvents {}

export interface SocketData {
  nickname: string;
  sessionId: string | null;
}
