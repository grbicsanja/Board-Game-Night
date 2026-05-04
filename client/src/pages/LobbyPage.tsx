import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NicknameModal } from '../components/lobby/NicknameModal';
import { CreateSessionModal } from '../components/lobby/CreateSessionModal';
import { RoomView } from '../components/room/RoomView';
import { useAppStore } from '../store/useAppStore';
import { CANVAS_W, CANVAS_H } from '../components/room/tableLayout';

const TOP_BAR_H = 38;
const RESUME_BAR_H = 28;

export function LobbyPage() {
  const nickname = useAppStore((s) => s.nickname);
  const sessions = useAppStore((s) => s.sessions);
  const currentSession = useAppStore((s) => s.currentSession);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const sx = window.innerWidth / CANVAS_W;
      const extraH = currentSession ? RESUME_BAR_H : 0;
      const sy = window.innerHeight / (CANVAS_H + TOP_BAR_H + extraH);
      setScale(Math.min(sx, sy));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [currentSession]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {!nickname && <NicknameModal />}

      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          display: 'flex',
          flexDirection: 'column',
          width: CANVAS_W,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: TOP_BAR_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            background: '#0d0d1a',
            borderBottom: '2px solid #3d2608',
          }}
        >
          <span style={{ fontSize: 7, color: '#f9c74f', letterSpacing: 1 }}>
            🎲 {nickname ?? '…'}
          </span>
          <Link
            to="/add-game"
            style={{
              fontSize: 6,
              color: '#90cdf4',
              textDecoration: 'none',
              border: '1px solid #4a5568',
              padding: '4px 8px',
              background: '#1a202c',
            }}
          >
            + GAME
          </Link>
        </div>

        {/* Resume banner */}
        {currentSession && (
          <button
            onClick={() => navigate(`/session/${currentSession.id}`)}
            style={{
              height: RESUME_BAR_H,
              width: '100%',
              background: 'rgba(45,89,242,0.92)',
              border: 'none',
              borderBottom: '2px solid #2D59F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            <span style={{ fontSize: 6, color: '#fff' }}>
              🎮 {currentSession.gameName}
            </span>
            <span style={{ fontSize: 5, color: '#bee3f8' }}>RESUME →</span>
          </button>
        )}

        {/* Room */}
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
