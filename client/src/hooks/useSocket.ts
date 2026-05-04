import { useEffect } from 'react';
import { socket } from '../socket';
import { useAppStore } from '../store/useAppStore';
import { useNickname } from './useNickname';

export function useSocket() {
  const store = useAppStore();
  const { getNickname } = useNickname();

  useEffect(() => {
    const nickname = getNickname();

    socket.on('connect', () => {
      store.setConnected(true);
      if (nickname) {
        store.setNickname(nickname);
        socket.emit('player:register', { nickname });
      }
    });

    socket.on('disconnect', () => store.setConnected(false));

    socket.on('lobby:snapshot', ({ sessions, games }) => {
      store.setLobbySnapshot(sessions, games);
    });

    socket.on('lobby:session_added', (session) => store.upsertSessionSummary(session));
    socket.on('lobby:session_updated', (session) => store.upsertSessionSummary(session));
    socket.on('lobby:session_removed', ({ sessionId }) => store.removeSessionSummary(sessionId));
    socket.on('lobby:game_added', (game) => store.addGame(game));

    socket.on('session:snapshot', (session) => store.setCurrentSession(session));
    socket.on('session:ended', () => store.setCurrentSession(null));

    socket.on('session:player_joined', ({ player }) => {
      store.addPlayerToSession(player);
    });

    socket.on('session:player_waitlisted', ({ player }) => {
      store.addPlayerToWaitlist(player);
    });

    socket.on('session:player_left', ({ playerId }) => {
      store.removePlayerFromSession(playerId);
    });

    socket.on('session:status_changed', ({ status }) => {
      store.updateCurrentSessionStatus(status);
      const label = status === 'open' ? 'Game paused' : 'Game started';
      store.announce(label);
    });

    socket.on('chat:message', (msg) => store.addChatMessage(msg));

    socket.on('reaction:updated', ({ sessionId, reactions }) => {
      store.updateReactions(sessionId, reactions);
    });

    socket.connect();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('lobby:snapshot');
      socket.off('lobby:session_added');
      socket.off('lobby:session_updated');
      socket.off('lobby:session_removed');
      socket.off('lobby:game_added');
      socket.off('session:snapshot');
    socket.off('session:ended');
      socket.off('session:player_joined');
      socket.off('session:player_waitlisted');
      socket.off('session:player_left');
      socket.off('session:status_changed');
      socket.off('chat:message');
      socket.off('reaction:updated');
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
