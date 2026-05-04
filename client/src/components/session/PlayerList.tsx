import { Session } from '@bgn/shared';

interface PlayerListProps {
  session: Session;
}

export function PlayerList({ session }: PlayerListProps) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[9px] font-bold text-gray-500">
        Players ({session.players.length})
      </h3>
      <ul className="space-y-1">
        {session.players.map((player) => (
          <li
            key={player.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
          >
            {player.id === session.hostSocketId && (
              <span aria-label="Host" title="Host" className="text-sm">
                👑
              </span>
            )}
            <span className="text-[10px] font-bold text-gray-800">{player.nickname}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
