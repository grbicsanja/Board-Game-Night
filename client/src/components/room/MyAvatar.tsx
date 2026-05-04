import { useEffect, useRef, useState } from 'react';
import { getAvatarColor, WALL } from './tableLayout';

interface MyAvatarProps {
  nickname: string;
  targetX: number; // interior coordinates
  targetY: number;
}

const SIZE = 22;

export function MyAvatar({ nickname, targetX, targetY }: MyAvatarProps) {
  // Track canvas position (interior + wall offset)
  const [pos, setPos] = useState({ x: targetX + WALL, y: targetY + WALL });
  const [isWalking, setIsWalking] = useState(false);
  const prevRef = useRef({ x: targetX, y: targetY });

  useEffect(() => {
    if (targetX !== prevRef.current.x || targetY !== prevRef.current.y) {
      prevRef.current = { x: targetX, y: targetY };
      setIsWalking(true);
      setPos({ x: targetX + WALL, y: targetY + WALL });
      const t = setTimeout(() => setIsWalking(false), 750);
      return () => clearTimeout(t);
    }
  }, [targetX, targetY]);

  const color = getAvatarColor(nickname);
  const initial = nickname.slice(0, 1).toUpperCase();

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x - SIZE / 2,
        top: pos.y - SIZE / 2,
        width: SIZE,
        height: SIZE,
        zIndex: 30,
        transition: 'left 0.7s steps(8, end), top 0.7s steps(8, end)',
        pointerEvents: 'none',
      }}
      className={isWalking ? 'pixel-walk' : undefined}
    >
      {/* Glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.6)',
          boxShadow: `0 0 6px 2px ${color}80`,
        }}
      />
      {/* Avatar body */}
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: '50%',
          background: color,
          border: '2px solid #fff',
          boxShadow: '2px 2px 0 #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: SIZE * 0.4,
          fontFamily: '"Press Start 2P", monospace',
          color: '#fff',
          imageRendering: 'pixelated',
        }}
      >
        {initial}
      </div>
      {/* YOU label */}
      <div
        style={{
          position: 'absolute',
          top: SIZE + 3,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#000',
          color: '#f9c74f',
          fontSize: 5,
          fontFamily: '"Press Start 2P", monospace',
          padding: '1px 3px',
          whiteSpace: 'nowrap',
          border: '1px solid #f9c74f',
        }}
      >
        YOU
      </div>
    </div>
  );
}
