import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionSummary } from '@bgn/shared';
import { TableDef, RECT_W, RECT_H, ROUND_R, WALL, getSeatsForTable, toCanvas } from './tableLayout';
import { PlayerAvatar } from './PlayerAvatar';
import { ElapsedTimer } from './ElapsedTimer';

interface TableSlotProps {
  def: TableDef;
  session: SessionSummary | null;
  myNickname: string | null;
  onHostHere: () => void;
}

export const TableSlot = React.memo(function TableSlot({
  def,
  session,
  myNickname,
  onHostHere,
}: TableSlotProps) {
  const navigate = useNavigate();
  const { left: cx, top: cy } = toCanvas(def.cx, def.cy);

  const handleClick = () => {
    if (!session) {
      onHostHere();
    } else {
      navigate(`/session/${session.id}`);
    }
  };

  const status = session?.status ?? 'available';

  return (
    <>
      {/* Seat markers (chair shapes behind the table) */}
      {session && <SeatRing def={def} session={session} myNickname={myNickname} cx={cx} cy={cy} />}

      {/* Table surface */}
      {def.type === 'rect' ? (
        <RectSurface cx={cx} cy={cy} status={status} session={session} onClick={handleClick} />
      ) : (
        <RoundSurface cx={cx} cy={cy} status={status} session={session} onClick={handleClick} />
      )}
    </>
  );
});

// ── Rect table ──────────────────────────────────────────────────────────────

function RectSurface({
  cx, cy, status, session, onClick,
}: {
  cx: number; cy: number;
  status: string;
  session: SessionSummary | null;
  onClick: () => void;
}) {
  const feltColor =
    status === 'available' ? '#1a472a' :
    status === 'open'      ? '#155a38' :
                             '#0e3d26';

  const borderColor =
    status === 'available' ? '#90ee90' :
    status === 'open'      ? '#63b3ed' :
                             '#f9c74f';

  const pulseClass =
    status === 'available' ? 'pulse-green' :
    status === 'open'      ? 'pulse-blue' :
                             undefined;

  return (
    <button
      onClick={onClick}
      aria-label={session
        ? `${session.gameName} — ${status === 'open' ? 'join gathering' : 'in progress, join waitlist'}`
        : 'Available table — click to host a game'}
      style={{
        position: 'absolute',
        left: cx - RECT_W / 2 - 12,
        top: cy - RECT_H / 2 - 12,
        width: RECT_W + 24,
        height: RECT_H + 24,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        zIndex: 10,
      }}
    >
      {/* Wood frame */}
      <div style={{
        position: 'absolute',
        left: 8,
        top: 8,
        width: RECT_W + 8,
        height: RECT_H + 8,
        background: '#5c3d1e',
        border: '2px solid #3d2608',
      }} />
      {/* Felt surface */}
      <div
        className={pulseClass}
        style={{
          position: 'absolute',
          left: 10,
          top: 10,
          width: RECT_W,
          height: RECT_H,
          background: feltColor,
          border: `2px solid ${borderColor}`,
          boxShadow: `2px 2px 0 #000`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          overflow: 'hidden',
          imageRendering: 'pixelated',
        }}
      >
        <TableContent session={session} status={status} />
      </div>
    </button>
  );
}

// ── Round table ──────────────────────────────────────────────────────────────

function RoundSurface({
  cx, cy, status, session, onClick,
}: {
  cx: number; cy: number;
  status: string;
  session: SessionSummary | null;
  onClick: () => void;
}) {
  const feltColor =
    status === 'available' ? '#023e8a' :
    status === 'open'      ? '#0059b3' :
                             '#0077cc';

  const borderColor =
    status === 'available' ? '#90ee90' :
    status === 'open'      ? '#63b3ed' :
                             '#f9c74f';

  const pulseClass =
    status === 'available' ? 'pulse-green' :
    status === 'open'      ? 'pulse-blue' :
                             undefined;

  const D = ROUND_R * 2;

  return (
    <button
      onClick={onClick}
      aria-label={session
        ? `${session.gameName} — ${status === 'open' ? 'join gathering' : 'in progress, join waitlist'}`
        : 'Available table — click to host a game'}
      style={{
        position: 'absolute',
        left: cx - ROUND_R - 12,
        top: cy - ROUND_R - 12,
        width: D + 24,
        height: D + 24,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        zIndex: 10,
      }}
    >
      {/* Wood rim */}
      <div style={{
        position: 'absolute',
        left: 8,
        top: 8,
        width: D + 8,
        height: D + 8,
        borderRadius: '50%',
        background: '#5c3d1e',
        border: '2px solid #3d2608',
      }} />
      {/* Felt */}
      <div
        className={pulseClass}
        style={{
          position: 'absolute',
          left: 10,
          top: 10,
          width: D,
          height: D,
          borderRadius: '50%',
          background: feltColor,
          border: `2px solid ${borderColor}`,
          boxShadow: '2px 2px 0 #000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          overflow: 'hidden',
          imageRendering: 'pixelated',
        }}
      >
        <TableContent session={session} status={status} />
      </div>
    </button>
  );
}

// ── Table content (game info inside the felt) ────────────────────────────────

function TableContent({ session, status }: { session: SessionSummary | null; status: string }) {
  const label: React.CSSProperties = {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: 5,
    lineHeight: 1.4,
    textAlign: 'center',
    imageRendering: 'pixelated',
  };

  if (!session) {
    return (
      <>
        <span style={{ ...label, fontSize: 10, color: '#90ee90' }} className="blink-cursor">+</span>
        <span style={{ ...label, color: '#5aab6e' }}>HOST</span>
      </>
    );
  }

  const gameName = session.gameName.length > 8
    ? session.gameName.slice(0, 7) + '…'
    : session.gameName;

  if (status === 'open') {
    return (
      <>
        <span style={{ ...label, color: '#a8d8b9' }}>{gameName}</span>
        <span style={{ ...label, color: '#63b3ed' }}>
          {session.playerCount}👥
        </span>
        <span style={{ ...label, color: '#90cdf4', fontSize: 4 }}>JOIN→</span>
      </>
    );
  }

  // in_progress
  return (
    <>
      <span style={{ ...label, color: '#ffd980' }}>{gameName}</span>
      {session.startedAt && <ElapsedTimer startedAt={session.startedAt} />}
      <span style={{ ...label, color: '#f9c74f' }}>⏳{session.playerCount}</span>
    </>
  );
}

// ── Avatar ring around the table ─────────────────────────────────────────────

const SeatRing = React.memo(function SeatRing({
  def, session, myNickname,
}: {
  def: TableDef;
  session: SessionSummary;
  myNickname: string | null;
  cx: number;
  cy: number;
}) {
  const seats = getSeatsForTable(def, session.playerNicknames.length);
  const adjustedSeats = seats.map(s => ({
    x: s.x + WALL,
    y: s.y + WALL,
  }));

  return (
    <>
      {/* Empty chair indicators */}
      {adjustedSeats.map((seat, i) => (
        <div
          key={`chair-${i}`}
          style={{
            position: 'absolute',
            left: seat.x - 5,
            top: seat.y - 3,
            width: 10,
            height: 6,
            background: '#5c3d1e',
            border: '1px solid #3d2608',
            borderRadius: def.type === 'round' ? '50%' : 1,
            zIndex: 5,
            imageRendering: 'pixelated',
          }}
        />
      ))}
      {/* Player avatars */}
      {session.playerNicknames.map((nick, i) => {
        const seat = adjustedSeats[i];
        if (!seat) return null;
        const isMe = nick === myNickname;
        if (isMe) return null; // MyAvatar handles the current user
        return (
          <PlayerAvatar
            key={nick}
            nickname={nick}
            x={seat.x}
            y={seat.y}
            size={16}
            showLabel
          />
        );
      })}
    </>
  );
});
