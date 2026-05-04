import React from 'react';
import { CANVAS_W, CANVAS_H, WALL, ROOM_H, ROOM_W } from './tableLayout';

// Pure visual decorations — never re-renders
export const RoomDecorations = React.memo(function RoomDecorations() {
  return (
    <>
      {/* ── Floor ── */}
      <div
        style={{
          position: 'absolute',
          left: WALL,
          top: WALL,
          width: ROOM_W,
          height: ROOM_H,
          backgroundImage: `
            repeating-conic-gradient(#c8a96e 0% 25%, #b8955a 25% 50%)
          `,
          backgroundSize: '16px 16px',
          imageRendering: 'pixelated',
        }}
      />

      {/* ── Walls ── */}
      {/* top */}
      <div style={{ position:'absolute', top:0, left:0, width:CANVAS_W, height:WALL, background:'#3d2608',
        backgroundImage:'repeating-linear-gradient(90deg,transparent 0,transparent 15px,#2a1a04 15px,#2a1a04 16px)',
        boxShadow:'inset 0 -2px 0 #2a1a04' }} />
      {/* bottom */}
      <div style={{ position:'absolute', bottom:0, left:0, width:CANVAS_W, height:WALL, background:'#3d2608',
        backgroundImage:'repeating-linear-gradient(90deg,transparent 0,transparent 15px,#2a1a04 15px,#2a1a04 16px)',
        boxShadow:'inset 0 2px 0 #2a1a04' }} />
      {/* left */}
      <div style={{ position:'absolute', top:0, left:0, width:WALL, height:CANVAS_H, background:'#3d2608',
        backgroundImage:'repeating-linear-gradient(180deg,transparent 0,transparent 15px,#2a1a04 15px,#2a1a04 16px)',
        boxShadow:'inset -2px 0 0 #2a1a04' }} />
      {/* right */}
      <div style={{ position:'absolute', top:0, right:0, width:WALL, height:CANVAS_H, background:'#3d2608',
        backgroundImage:'repeating-linear-gradient(180deg,transparent 0,transparent 15px,#2a1a04 15px,#2a1a04 16px)',
        boxShadow:'inset 2px 0 0 #2a1a04' }} />

      {/* ── Corner plants ── */}
      <Plant x={WALL + 4} y={WALL + 4} />
      <Plant x={CANVAS_W - WALL - 4 - 12} y={WALL + 4} />

      {/* ── Ceiling lights ── */}
      <Light x={WALL + 72}  y={WALL - 2} />
      <Light x={WALL + 168} y={WALL - 2} />
      <Light x={WALL + 264} y={WALL - 2} />

      {/* ── Section divider / rug ── */}
      <div style={{
        position: 'absolute',
        left: WALL + 16,
        top: WALL + 280,
        width: ROOM_W - 32,
        height: 12,
        backgroundImage: 'repeating-linear-gradient(90deg, #f9c74f 0,#f9c74f 8px,#f3722c 8px,#f3722c 16px)',
        opacity: 0.7,
        imageRendering: 'pixelated',
      }} />
      <div style={{
        position: 'absolute',
        left: WALL + 16,
        top: WALL + 290,
        width: ROOM_W - 32,
        height: 3,
        background: '#3d2608',
        opacity: 0.4,
      }} />

      {/* ── Section label: GAMES ROOM ── */}
      <div style={{
        position: 'absolute',
        left: WALL + ROOM_W / 2,
        top: WALL + 10,
        transform: 'translateX(-50%)',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 8,
        color: '#f9c74f',
        textShadow: '1px 1px 0 #000',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        BOARD GAME NIGHT
      </div>

      {/* ── Bar counter at bottom ── */}
      <div style={{
        position: 'absolute',
        left: WALL,
        top: WALL + ROOM_H - 72,
        width: ROOM_W,
        height: 14,
        background: '#5c3d1e',
        borderTop: '2px solid #8b5e3c',
        borderBottom: '2px solid #3d2710',
      }}>
        {/* Bar stools */}
        {[24, 56, 88, 120, 152, 184, 216, 248, 280, 312].map((bx) => (
          <div key={bx} style={{
            position: 'absolute',
            top: -8,
            left: bx,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#c1440e',
            border: '1px solid #8b2e08',
          }} />
        ))}
      </div>

      {/* ── Entrance door ── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: WALL + ROOM_W / 2 - 20,
        width: 40,
        height: WALL,
        background: '#1a1a2e',
        borderLeft: '2px solid #4a3228',
        borderRight: '2px solid #4a3228',
      }} />
      <div style={{
        position: 'absolute',
        bottom: WALL + 2,
        left: WALL + ROOM_W / 2 - 12,
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 5,
        color: '#f9c74f',
        letterSpacing: 1,
        pointerEvents: 'none',
      }}>
        ENTER
      </div>

      {/* ── Area label: LOUNGE ── */}
      <div style={{
        position: 'absolute',
        left: WALL + ROOM_W / 2,
        top: WALL + ROOM_H - 90,
        transform: 'translateX(-50%)',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 6,
        color: '#8b6914',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        ★ LOUNGE ★
      </div>
    </>
  );
});

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 12, height: 20, imageRendering: 'pixelated' }}>
      {/* Leaves */}
      <div style={{ position:'absolute', top:0, left:2, width:8, height:10, background:'#2d6a4f',
        boxShadow:'4px 2px 0 #40916c,-2px 4px 0 #1b4332', border:'1px solid #1b4332' }} />
      {/* Pot */}
      <div style={{ position:'absolute', bottom:0, left:2, width:8, height:8,
        background:'#8b5e3c', border:'1px solid #5c3d1e', borderRadius:'0 0 2px 2px' }} />
    </div>
  );
}

function Light({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position:'absolute', left: x, top: y }}>
      {/* Cord */}
      <div style={{ position:'absolute', left:3, top:0, width:2, height:6, background:'#888' }} />
      {/* Bulb */}
      <div style={{
        position:'absolute', left:0, top:6,
        width:8, height:8,
        background:'#fff9c4',
        border:'1px solid #f9c74f',
        boxShadow:'0 0 4px 2px rgba(249,199,79,0.4)',
        borderRadius:'0 0 4px 4px',
      }} />
    </div>
  );
}
