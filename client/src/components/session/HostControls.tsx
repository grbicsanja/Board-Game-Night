import { useState } from 'react';
import { Session } from '@bgn/shared';
import { socket } from '../../socket';

interface HostControlsProps {
  session: Session;
}

export function HostControls({ session }: HostControlsProps) {
  const [confirming, setConfirming] = useState<'end' | 'cancel' | null>(null);

  const handleStart = () => socket.emit('session:start', { sessionId: session.id });
  const handlePause = () => socket.emit('session:pause', { sessionId: session.id });
  const handleConfirm = () => {
    if (confirming === 'end') socket.emit('session:end', { sessionId: session.id });
    if (confirming === 'cancel') socket.emit('session:cancel', { sessionId: session.id });
    setConfirming(null);
  };

  if (confirming) {
    return (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="mb-3 text-sm font-medium text-red-800">
          {confirming === 'end'
            ? 'End the game? Everyone will return to the lobby.'
            : 'Cancel this session? Everyone will return to the lobby.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(null)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Keep playing
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Yes, {confirming === 'end' ? 'end game' : 'cancel'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {session.status === 'open' && (
        <>
          <button
            onClick={handleStart}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Start Game
          </button>
          <button
            onClick={() => setConfirming('cancel')}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Cancel Session
          </button>
        </>
      )}
      {session.status === 'in_progress' && (
        <>
          <button
            onClick={handlePause}
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Pause Game
          </button>
          <button
            onClick={() => setConfirming('end')}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            End Game
          </button>
        </>
      )}
    </div>
  );
}
