import { useNavigate } from 'react-router-dom';
import { SessionSummary } from '@bgn/shared';
import { Badge } from '../shared/Badge';
import { ReactionBar } from './ReactionBar';
import { useAppStore } from '../../store/useAppStore';

interface SessionCardProps {
  session: SessionSummary;
}

export function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();
  const games = useAppStore((s) => s.games);
  const game = games.find((g) => g.id === session.gameId);

  const actionLabel = session.status === 'open' ? 'Join' : 'Join waitlist';
  const ariaLabel = `${session.gameName}, hosted by ${session.hostNickname}, ${session.playerCount} player${session.playerCount !== 1 ? 's' : ''}, status: ${session.status === 'in_progress' ? 'in progress' : session.status}. ${actionLabel}.`;

  return (
    <li>
      <button
        onClick={() => navigate(`/session/${session.id}`)}
        aria-label={ariaLabel}
        className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-gray-900">{session.gameName}</p>
            <p className="mt-1 text-[9px] text-gray-500">hosted by {session.hostNickname}</p>
          </div>
          <Badge status={session.status} />
        </div>

        <div className="mb-3 flex flex-wrap gap-3 text-[9px] text-gray-400">
          <span>{session.playerCount} player{session.playerCount !== 1 ? 's' : ''}</span>
          {session.waitlistCount > 0 && (
            <span>{session.waitlistCount} waiting</span>
          )}
          {game && (
            <>
              <span>~{game.estimatedMinutes}min</span>
              <span>{game.category}</span>
            </>
          )}
        </div>

        <ReactionBar sessionId={session.id} reactions={session.reactions} />
      </button>
    </li>
  );
}
