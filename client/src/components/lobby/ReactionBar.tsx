import { socket } from '../../socket';

const EMOJIS = ['🎲', '👀', '🔥', '😂', '🏆'];

interface ReactionBarProps {
  sessionId: string;
  reactions: Record<string, number>;
}

export function ReactionBar({ sessionId, reactions }: ReactionBarProps) {
  const handleReact = (emoji: string) => {
    socket.emit('session:react', { sessionId, emoji });
  };

  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Reactions">
      {EMOJIS.map((emoji) => {
        const count = reactions[emoji] ?? 0;
        return (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation();
              handleReact(emoji);
            }}
            aria-label={`React with ${emoji}, ${count} reaction${count !== 1 ? 's' : ''}`}
            className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <span aria-hidden="true">{emoji}</span>
            {count > 0 && <span className="text-xs text-gray-600">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
