import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NicknameModal } from '../components/lobby/NicknameModal';
import { CreateSessionModal } from '../components/lobby/CreateSessionModal';
import { SettingsModal } from '../components/layout/SettingsModal';
import { RoomView } from '../components/room/RoomView';
import { useAppStore } from '../store/useAppStore';
import { CANVAS_W, CANVAS_H } from '../components/room/tableLayout';

const TOP_BAR_H = 38;

export function LobbyPage() {
  const nickname = useAppStore((s) => s.nickname);
  const avatarUrl = useAppStore((s) => s.avatarUrl);
  const sessions = useAppStore((s) => s.sessions);
  const lobbyPlayers = useAppStore((s) => s.lobbyPlayers);
  const mySocketId = useAppStore((s) => s.socketId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const sx = window.innerWidth / CANVAS_W;
      const sy = window.innerHeight / (CANVAS_H + TOP_BAR_H);
      setScale(Math.min(sx, sy));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
            {nickname && (
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                aria-label="Open settings"
                style={{
                  fontSize: 6,
                  color: '#f9c74f',
                  border: '1px solid #4a5568',
                  padding: '4px 8px',
                  background: '#1a202c',
                  cursor: 'pointer',
                  fontFamily: '"Press Start 2P", monospace',
                  lineHeight: 1,
                }}
              >
                ⚙ SETTINGS
              </button>
            )}
          </div>
        </div>

        {/* Room */}
        <RoomView
          sessions={sessions}
          lobbyPlayers={lobbyPlayers}
          mySocketId={mySocketId}
          myNickname={nickname}
          myAvatarUrl={avatarUrl}
          onHostHere={() => {
            if (nickname) setShowCreateModal(true);
          }}
        />
      </div>

      {showCreateModal && (
        <CreateSessionModal onClose={() => setShowCreateModal(false)} />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
