import { Session } from '@bgn/shared';
import { useAppStore } from '../../store/useAppStore';
import { Badge } from '../shared/Badge';

interface GameInfoProps {
  session: Session;
}

export function GameInfo({ session }: GameInfoProps) {
  const games = useAppStore((s) => s.games);
  const game = games.find((g) => g.id === session.gameId);

  return (
    <div className="mb-4 rounded-xl bg-indigo-50 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-indigo-900">{session.gameName}</h2>
          <p className="mt-1 text-[9px] text-indigo-700">hosted by {session.hostNickname}</p>
        </div>
        <Badge status={session.status} />
      </div>
      {game && (
        <div className="mt-2 flex flex-wrap gap-3 text-[9px] text-indigo-600">
          <span>~{game.estimatedMinutes} min</span>
          <span>{game.category}</span>
          <span>{game.minPlayers}–{game.maxPlayers} players suggested</span>
        </div>
      )}
    </div>
  );
}
