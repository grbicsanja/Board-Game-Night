import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useAppStore } from '../store/useAppStore';

export function useSessionSync(sessionId: string) {
  const navigate = useNavigate();
  const setCurrentSession = useAppStore((s) => s.setCurrentSession);

  useEffect(() => {
    socket.emit('session:join', { sessionId });

    const handleEnded = ({ sessionId: endedId }: { sessionId: string }) => {
      if (endedId === sessionId) {
        setCurrentSession(null);
        navigate('/');
      }
    };

    socket.on('session:ended', handleEnded);

    return () => {
      socket.off('session:ended', handleEnded);
      socket.emit('session:leave', { sessionId });
      // Keep currentSession in the store so the lobby can show a resume banner.
    };
  }, [sessionId, navigate, setCurrentSession]);
}
