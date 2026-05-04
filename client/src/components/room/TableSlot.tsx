import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionSummary } from '@bgn/shared';
import { TableDef, WALL, getSeatsForTable, toCanvas } from './tableLayout';
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
      {session && (
        <SeatRing def={def} session={session} myNickname={myNickname} />
      )}
      <TableButton
        cx={cx}
        cy={cy}
        status={status}
        session={session}
        onClick={handleClick}
      />
    </>
  );
});

// ── Floating labeled button ──────────────────────────────────────────────────

function TableButton({
  cx, cy, status, session, onClick,
}: {
  cx: number; cy: number;
  status: string;
  session: SessionSummary | null;
  onClick: () => void;
}) {
  const bg =
    status === 'available' ? 'rgba(45,89,242,0.88)' :
    status === 'open'      ? 'rgba(0,25,70,0.88)' :
                             'rgba(60,35,0,0.88)';

  const borderColor =
    status === 'available' ? '#2D59F2' :
    status === 'open'      ? '#63b3ed' :
                             '#f9c74f';

  const pulseClass =
    status === 'available' ? 'pulse-blue' :
    status === 'open'      ? 'pulse-blue' :
                             undefined;

  const label: React.CSSProperties = {
    fontFamily: '"Press Start 2P", monospace',
    lineHeight: 1.6,
    textAlign: 'center',
    display: 'block',
  };

  const gameName = session
    ? (session.gameName.length > 9 ? session.gameName.slice(0, 8) + '…' : session.gameName)
    : null;

  const ariaLabel = session
    ? `${session.gameName} — ${status === 'open' ? 'join' : 'in progress, join waitlist'}`
    : 'Empty table — click to host a game';

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={pulseClass}
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        transform: 'translate(-50%, -50%)',
        background: bg,
        border: `2px solid ${borderColor}`,
        padding: '5px 8px',
        minWidth: 66,
        minHeight: 44,
        cursor: 'pointer',
        zIndex: 15,
        boxShadow: `2px 2px 0 #000, 0 0 0 1px ${borderColor}33`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      {!session && (
        <>
          <span style={{ ...label, fontSize: 14, color: '#90cdf4', lineHeight: 1 }}>+</span>
          <span style={{ ...label, fontSize: 5, color: '#bee3f8' }}>GAME</span>
        </>
      )}

      {session && status === 'open' && (
        <>
          <span style={{ ...label, fontSize: 5, color: '#e2f0ff' }}>{gameName}</span>
          <span style={{ ...label, fontSize: 5, color: '#90cdf4' }}>
            {session.playerCount}👥
          </span>
          <span style={{ ...label, fontSize: 4, color: '#63b3ed' }}>JOIN →</span>
        </>
      )}

      {session && status === 'in_progress' && (
        <>
          <span style={{ ...label, fontSize: 5, color: '#fef3c7' }}>{gameName}</span>
          {session.startedAt && <ElapsedTimer startedAt={session.startedAt} />}
          <span style={{ ...label, fontSize: 4, color: '#f9c74f' }}>
            {session.playerCount}👥 WAIT
          </span>
        </>
      )}
    </button>
  );
}

// ── Avatar ring around the table ─────────────────────────────────────────────

const SeatRing = React.memo(function SeatRing({
  def, session, myNickname,
}: {
  def: TableDef;
  session: SessionSummary;
  myNickname: string | null;
}) {
  const seats = getSeatsForTable(def, session.playerNicknames.length);
  const adjustedSeats = seats.map(s => ({
    x: s.x + WALL,
    y: s.y + WALL,
  }));

  return (
    <>
      {session.playerNicknames.map((nick, i) => {
        const seat = adjustedSeats[i];
        if (!seat) return null;
        if (nick === myNickname) return null;
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
