import { create } from 'zustand';
import { ChatMessage, Game, Player, Session, SessionStatus, SessionSummary } from '@bgn/shared';

interface AppState {
  nickname: string | null;
  sessions: SessionSummary[];
  currentSession: Session | null;
  games: Game[];
  connected: boolean;
  statusAnnouncement: string;

  setNickname: (n: string) => void;
  setConnected: (c: boolean) => void;
  setLobbySnapshot: (sessions: SessionSummary[], games: Game[]) => void;
  upsertSessionSummary: (s: SessionSummary) => void;
  removeSessionSummary: (sessionId: string) => void;
  addGame: (g: Game) => void;
  setCurrentSession: (s: Session | null) => void;
  updateCurrentSessionStatus: (status: SessionStatus) => void;
  addPlayerToSession: (player: Player) => void;
  addPlayerToWaitlist: (player: Player) => void;
  removePlayerFromSession: (playerId: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateReactions: (sessionId: string, reactions: Record<string, number>) => void;
  announce: (msg: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  nickname: null,
  sessions: [],
  currentSession: null,
  games: [],
  connected: false,
  statusAnnouncement: '',

  setNickname: (n) => set({ nickname: n }),
  setConnected: (c) => set({ connected: c }),

  setLobbySnapshot: (sessions, games) => set({ sessions, games }),

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
