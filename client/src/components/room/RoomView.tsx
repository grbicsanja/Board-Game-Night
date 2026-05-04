import { useMemo } from 'react';
import { LobbyPlayer, SessionSummary } from '@bgn/shared';
import {
  CANVAS_W,
  CANVAS_H,
  TABLE_DEFS,
  SPAWN_X,
  SPAWN_Y,
  WALL,
  getSeatsForTable,
} from './tableLayout';
import { RoomDecorations } from './RoomDecorations';
import { TableSlot } from './TableSlot';
import { MyAvatar } from './MyAvatar';
import { PlayerAvatar } from './PlayerAvatar';

interface RoomViewProps {
  sessions: SessionSummary[];
  lobbyPlayers: LobbyPlayer[];
  mySocketId: string | null;
  myNickname: string | null;
  myAvatarUrl?: string | null;
  onHostHere: () => void;
}

const LOBBY_AVATAR_SPACING = 28;

export function RoomView({
  sessions,
  lobbyPlayers,
  mySocketId,
  myNickname,
  myAvatarUrl,
  onHostHere,
}: RoomViewProps) {
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

  const myInLobby = myTableIndex === null && !!myNickname;

  // Single source of truth for every "other player" position. A player keeps
  // the same React component (keyed by socket id) whether they're in the
  // lobby or seated at a table, so CSS transitions on left/top animate the
  // walk between the two.
  const otherPlayerSlots = useMemo(() => {
    const slots = new Map<
      string,
      { x: number; y: number; nickname: string; avatarUrl?: string; atTable: boolean }
    >();

    // Seat session players around their table
    sortedSessions.forEach((session, tableIdx) => {
      const def = TABLE_DEFS[tableIdx];
      if (!def) return;
      const seats = getSeatsForTable(def, session.players.length);
      session.players.forEach((p, i) => {
        if (p.id === mySocketId) return; // self handled by MyAvatar
        const seat = seats[i];
        if (!seat) return;
        slots.set(p.id, {
          x: seat.x + WALL,
          y: seat.y + WALL,
          nickname: p.nickname,
          avatarUrl: p.avatarUrl,
          atTable: true,
        });
      });
    });

    // Place remaining lobby players at the spawn area. When the local user
    // is also in the lobby, fan others alternately around their spawn so
    // MyAvatar stays visually centered.
    const lobbyOthers = lobbyPlayers.filter(
      (p) => p.id !== mySocketId && !slots.has(p.id),
    );

    if (myInLobby) {
      lobbyOthers.forEach((player, i) => {
        const slot = Math.floor(i / 2) + 1;
        const sign = i % 2 === 0 ? 1 : -1;
        slots.set(player.id, {
          x: SPAWN_X + sign * slot * LOBBY_AVATAR_SPACING + WALL,
          y: SPAWN_Y + WALL,
          nickname: player.nickname,
          avatarUrl: player.avatarUrl,
          atTable: false,
        });
      });
    } else {
      const startX = SPAWN_X - ((lobbyOthers.length - 1) * LOBBY_AVATAR_SPACING) / 2;
      lobbyOthers.forEach((player, i) => {
        slots.set(player.id, {
          x: startX + i * LOBBY_AVATAR_SPACING + WALL,
          y: SPAWN_Y + WALL,
          nickname: player.nickname,
          avatarUrl: player.avatarUrl,
          atTable: false,
        });
      });
    }

    return slots;
  }, [sortedSessions, lobbyPlayers, mySocketId, myInLobby]);

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
        backgroundImage: "url('/room-bg.png')",
        backgroundSize: '100% 100%',
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
          onHostHere={onHostHere}
        />
      ))}

      {Array.from(otherPlayerSlots.entries()).map(([id, slot]) => (
        <PlayerAvatar
          key={id}
          nickname={slot.nickname}
          avatarUrl={slot.avatarUrl}
          x={slot.x}
          y={slot.y}
          size={slot.atTable ? 16 : 18}
          showLabel={!slot.atTable}
          animatePosition
        />
      ))}

      {myNickname && (
        <MyAvatar
          nickname={myNickname}
          avatarUrl={myAvatarUrl}
          targetX={myTargetPos.x}
          targetY={myTargetPos.y}
        />
      )}

      {/* Spawn area indicator when no sessions */}
      {sessions.length === 0 && lobbyPlayers.length <= 1 && (
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
