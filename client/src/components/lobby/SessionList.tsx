import { useAppStore } from '../../store/useAppStore';
import { SessionCard } from './SessionCard';

export function SessionList() {
  const sessions = useAppStore((s) => s.sessions);

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <p className="text-2xl">🎲</p>
        <p className="mt-3 text-xs font-bold text-gray-700">No sessions yet</p>
        <p className="mt-2 text-[9px] text-gray-500">Be the first to host a game!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Active game sessions">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </ul>
  );
}
