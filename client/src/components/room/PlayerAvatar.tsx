import React from 'react';
import { getAvatarColor } from './tableLayout';

interface PlayerAvatarProps {
  nickname: string;
  x: number; // canvas coordinate
  y: number;
  size?: number;
  showLabel?: boolean;
  isMoving?: boolean;
}

export const PlayerAvatar = React.memo(function PlayerAvatar({
  nickname,
  x,
  y,
  size = 18,
  showLabel = false,
  isMoving = false,
}: PlayerAvatarProps) {
  const color = getAvatarColor(nickname);
  const initial = nickname.slice(0, 1).toUpperCase();

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        zIndex: 20,
        pointerEvents: 'none',
      }}
      className={isMoving ? 'pixel-bob' : undefined}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          border: '2px solid #000',
          boxShadow: '1px 1px 0 #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          fontFamily: '"Press Start 2P", monospace',
          color: '#fff',
          imageRendering: 'pixelated',
        }}
        title={nickname}
      >
        {initial}
      </div>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            bottom: size + 2,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#000',
            color: '#fff',
            fontSize: 5,
            fontFamily: '"Press Start 2P", monospace',
            padding: '1px 3px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            imageRendering: 'pixelated',
          }}
        >
          {nickname.length > 6 ? nickname.slice(0, 6) + '…' : nickname}
        </div>
      )}
    </div>
  );
});
