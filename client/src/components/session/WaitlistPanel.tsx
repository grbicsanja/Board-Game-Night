import { Session } from '@bgn/shared';

interface WaitlistPanelProps {
  session: Session;
  mySocketId: string;
  isHost: boolean;
}

export function WaitlistPanel({ session, mySocketId, isHost }: WaitlistPanelProps) {
  const onWaitlist = session.waitlist.some((p) => p.id === mySocketId);

  if (!isHost && !onWaitlist) return null;
  if (session.waitlist.length === 0 && !onWaitlist) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <h3 className="mb-1 text-sm font-semibold text-amber-800">
        Waitlist ({session.waitlist.length})
      </h3>
      {onWaitlist && (
        <p className="mb-2 text-xs text-amber-700">
          You're on the waitlist. You'll join when the game is paused.
        </p>
      )}
      <ul className="space-y-1">
        {session.waitlist.map((player) => (
          <li key={player.id} className="text-sm text-amber-900">
            {player.nickname}
          </li>
        ))}
      </ul>
    </div>
  );
}
