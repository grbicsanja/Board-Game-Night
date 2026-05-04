import React from 'react';
import { CANVAS_W, WALL, ROOM_W, ROOM_H } from './tableLayout';

export const RoomDecorations = React.memo(function RoomDecorations() {
  return (
    <>
      {/* Room title */}
      <div style={{
        position: 'absolute',
        left: CANVAS_W / 2,
        top: 6,
        transform: 'translateX(-50%)',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 7,
        color: '#f9c74f',
        textShadow: '1px 1px 0 #000, -1px -1px 0 #000',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 20,
      }}>
        BOARD GAME NIGHT
      </div>

    </>
  );
});
