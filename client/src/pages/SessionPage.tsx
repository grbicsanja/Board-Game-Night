import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { GameInfo } from '../components/session/GameInfo';
import { PlayerList } from '../components/session/PlayerList';
import { WaitlistPanel } from '../components/session/WaitlistPanel';
import { HostControls } from '../components/session/HostControls';
import { ChatPanel } from '../components/session/ChatPanel';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useAppStore } from '../store/useAppStore';
import { useSessionSync } from '../hooks/useSessionSync';
import { socket } from '../socket';

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const currentSession = useAppStore((s) => s.currentSession);
  const nickname = useAppStore((s) => s.nickname);

  useSessionSync(sessionId!);

  if (!currentSession) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const mySocketId = socket.id ?? '';
  const isHost = currentSession.hostSocketId === mySocketId;

  return (
    <Layout>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        ← Back to lobby
      </Link>

      <GameInfo session={currentSession} />

      {isHost && <HostControls session={currentSession} />}

      <WaitlistPanel
        session={currentSession}
        mySocketId={mySocketId}
        isHost={isHost}
      />

      <PlayerList session={currentSession} />

      <ChatPanel session={currentSession} myNickname={nickname ?? ''} />
    </Layout>
  );
}
