import { create } from 'zustand';
import {
  ChatMessage,
  Game,
  LobbyPlayer,
  Player,
  Session,
  SessionStatus,
  SessionSummary,
} from '@bgn/shared';

interface AppState {
  nickname: string | null;
  avatarUrl: string | null;
  sessions: SessionSummary[];
  currentSession: Session | null;
  games: Game[];
  lobbyPlayers: LobbyPlayer[];
  socketId: string | null;
  connected: boolean;
  statusAnnouncement: string;

  setNickname: (n: string) => void;
  setAvatarUrl: (url: string | null) => void;
  setSocketId: (id: string | null) => void;
  setConnected: (c: boolean) => void;
  setLobbySnapshot: (sessions: SessionSummary[], games: Game[], lobbyPlayers: LobbyPlayer[]) => void;
  setLobbyPlayers: (players: LobbyPlayer[]) => void;
  upsertSessionSummary: (s: SessionSummary) => void;
  removeSessionSummary: (sessionId: string) => void;
  addGame: (g: Game) => void;
  removeGame: (gameId: string) => void;
  setCurrentSession: (s: Session | null) => void;
  updateCurrentSessionStatus: (status: SessionStatus) => void;
  addPlayerToSession: (player: Player) => void;
  addPlayerToWaitlist: (player: Player) => void;
  removePlayerFromSession: (playerId: string) => void;
  updatePlayerInSession: (player: Player) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateReactions: (sessionId: string, reactions: Record<string, number>) => void;
  announce: (msg: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  nickname: null,
  avatarUrl: null,
  sessions: [],
  currentSession: null,
  games: [],
  lobbyPlayers: [],
  socketId: null,
  connected: false,
  statusAnnouncement: '',

  setNickname: (n) => set({ nickname: n }),
  setAvatarUrl: (url) => set({ avatarUrl: url }),
  setSocketId: (id) => set({ socketId: id }),
  setConnected: (c) => set({ connected: c }),

  setLobbySnapshot: (sessions, games, lobbyPlayers) => set({ sessions, games, lobbyPlayers }),
  setLobbyPlayers: (lobbyPlayers) => set({ lobbyPlayers }),

  upsertSessionSummary: (s) =>
    set((state) => {
      const idx = state.sessions.findIndex((x) => x.id === s.id);
      if (idx === -1) return { sessions: [...state.sessions, s] };
      const updated = [...state.sessions];
      updated[idx] = s;
      return { sessions: updated };
    }),

  removeSessionSummary: (sessionId) =>
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== sessionId) })),

  addGame: (g) => set((state) => ({ games: [...state.games, g] })),

  removeGame: (gameId) => set((state) => ({ games: state.games.filter((g) => g.id !== gameId) })),

  setCurrentSession: (s) => set({ currentSession: s }),

  updateCurrentSessionStatus: (status) =>
    set((state) => {
      if (!state.currentSession) return {};
      return { currentSession: { ...state.currentSession, status } };
    }),

  addPlayerToSession: (player) =>
    set((state) => {
      if (!state.currentSession) return {};
      return {
        currentSession: {
          ...state.currentSession,
          players: [...state.currentSession.players, player],
        },
      };
    }),

  addPlayerToWaitlist: (player) =>
    set((state) => {
      if (!state.currentSession) return {};
      return {
        currentSession: {
          ...state.currentSession,
          waitlist: [...state.currentSession.waitlist, player],
        },
      };
    }),

  removePlayerFromSession: (playerId) =>
    set((state) => {
      if (!state.currentSession) return {};
      return {
        currentSession: {
          ...state.currentSession,
          players: state.currentSession.players.filter((p) => p.id !== playerId),
          waitlist: state.currentSession.waitlist.filter((p) => p.id !== playerId),
        },
      };
    }),

  updatePlayerInSession: (player) =>
    set((state) => {
      if (!state.currentSession) return {};
      const replace = (p: Player) => (p.id === player.id ? player : p);
      const next: Session = {
        ...state.currentSession,
        players: state.currentSession.players.map(replace),
        waitlist: state.currentSession.waitlist.map(replace),
      };
      if (state.currentSession.hostSocketId === player.id) {
        next.hostNickname = player.nickname;
        next.hostAvatarUrl = player.avatarUrl;
      }
      return { currentSession: next };
    }),

  addChatMessage: (msg) =>
    set((state) => {
      if (!state.currentSession) return {};
      return {
        currentSession: {
          ...state.currentSession,
          chat: [...state.currentSession.chat, msg],
        },
      };
    }),

  updateReactions: (sessionId, reactions) =>
    set((state) => {
      const idx = state.sessions.findIndex((s) => s.id === sessionId);
      if (idx === -1) return {};
      const updated = [...state.sessions];
      updated[idx] = { ...updated[idx], reactions };
      return { sessions: updated };
    }),

  announce: (msg) => set({ statusAnnouncement: msg }),
}));
