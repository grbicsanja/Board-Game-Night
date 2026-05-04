import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NicknameModal } from '../components/lobby/NicknameModal';
import { CreateSessionModal } from '../components/lobby/CreateSessionModal';
import { RoomView } from '../components/room/RoomView';
import { useAppStore } from '../store/useAppStore';

export function LobbyPage() {
  const nickname = useAppStore((s) => s.nickname);
  const sessions = useAppStore((s) => s.sessions);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {!nickname && <NicknameModal />}

      {/* Top bar */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        background: '#0d0d1a',
        borderBottom: '2px solid #3d2608',
      }}>
        <span style={{ fontSize: 7, color: '#f9c74f', letterSpacing: 1 }}>
          🎲 {nickname ?? '…'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            to="/add-game"
            style={{
              fontSize: 5,
              color: '#90cdf4',
              textDecoration: 'none',
              border: '1px solid #4a5568',
              padding: '4px 6px',
              background: '#1a202c',
            }}
          >
            + GAME
          </Link>
        </div>
      </div>

      {/* Scrollable room viewport */}
      <div style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1,
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        justifyContent: 'center',
        WebkitOverflowScrolling: 'touch',
      }}>
        <RoomView
          sessions={sessions}
          myNickname={nickname}
          onHostHere={() => {
            if (nickname) setShowCreateModal(true);
          }}
        />
      </div>

      {showCreateModal && (
        <CreateSessionModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
