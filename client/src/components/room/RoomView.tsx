import { useMemo } from 'react';
import { SessionSummary } from '@bgn/shared';
import { CANVAS_W, CANVAS_H, TABLE_DEFS, SPAWN_X, SPAWN_Y, WALL } from './tableLayout';
import { RoomDecorations } from './RoomDecorations';
import { TableSlot } from './TableSlot';
import { MyAvatar } from './MyAvatar';

interface RoomViewProps {
  sessions: SessionSummary[];
  myNickname: string | null;
  onHostHere: () => void;
}

export function RoomView({ sessions, myNickname, onHostHere }: RoomViewProps) {
  // Map sessions to table slots by creation order (up to 20)
  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.createdAt - b.createdAt).slice(0, 20),
    [sessions]
  );

  const sessionByTableIndex = useMemo(() => {
    const map = new Map<number, SessionSummary>();
    sortedSessions.forEach((s, i) => map.set(i, s));
    return map;
  }, [sortedSessions]);

  // Compute where MY avatar should be
  const myTableIndex = useMemo(() => {
    if (!myNickname) return null;
    const idx = sortedSessions.findIndex(s =>
      s.playerNicknames.includes(myNickname)
    );
    return idx === -1 ? null : idx;
  }, [sortedSessions, myNickname]);

  const myTargetPos = useMemo(() => {
    if (myTableIndex === null) return { x: SPAWN_X, y: SPAWN_Y };
    const def = TABLE_DEFS[myTableIndex];
    if (!def) return { x: SPAWN_X, y: SPAWN_Y };
    // Stand at the first available seat
    const session = sessionByTableIndex.get(myTableIndex);
    const myPlayerIdx = session?.playerNicknames.indexOf(myNickname ?? '') ?? 0;
    const seatIdx = Math.max(0, myPlayerIdx);
    // Use interior coords offset from the table center
    const offset = def.type === 'rect' ? 28 : 26;
    const angle = (2 * Math.PI * seatIdx) / 6 - Math.PI / 2;
    return {
      x: Math.round(def.cx + offset * Math.cos(angle)),
      y: Math.round(def.cy + offset * Math.sin(angle)),
    };
  }, [myTableIndex, myNickname, sessionByTableIndex]);

  return (
    <div
      style={{
        position: 'relative',
        width: CANVAS_W,
        height: CANVAS_H,
        imageRendering: 'pixelated',
        flexShrink: 0,
      }}
      role="main"
      aria-label="Game room"
    >
      <RoomDecorations />

      {TABLE_DEFS.map((def) => (
        <TableSlot
          key={def.index}
          def={def}
          session={sessionByTableIndex.get(def.index) ?? null}
          myNickname={myNickname}
          onHostHere={onHostHere}
        />
      ))}

      {myNickname && (
        <MyAvatar
          nickname={myNickname}
          targetX={myTargetPos.x}
          targetY={myTargetPos.y}
        />
      )}

      {/* Spawn area indicator when no sessions */}
      {sessions.length === 0 && (
        <div style={{
          position: 'absolute',
          left: WALL + 40,
          top: WALL + SPAWN_Y - 30,
          width: 256,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 6,
          color: '#8b6914',
          textAlign: 'center',
          lineHeight: 1.8,
          pointerEvents: 'none',
        }}>
          <div>click any table</div>
          <div>to host a game!</div>
        </div>
      )}
    </div>
  );
}
