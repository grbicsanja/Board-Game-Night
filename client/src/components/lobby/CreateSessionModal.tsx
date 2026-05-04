import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../shared/Modal';
import { socket } from '../../socket';
import { useAppStore } from '../../store/useAppStore';

interface CreateSessionModalProps {
  onClose: () => void;
}

export function CreateSessionModal({ onClose }: CreateSessionModalProps) {
  const navigate = useNavigate();
  const games = useAppStore((s) => s.games);
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGameId || submitting) return;
    setSubmitting(true);

    socket.emit('session:create', { gameId: selectedGameId }, (response) => {
      setSubmitting(false);
      if ('error' in response) {
        alert(response.error);
        return;
      }
      onClose();
      navigate(`/session/${response.sessionId}`);
    });
  };

  return (
    <Modal titleId="create-session-title" onClose={onClose}>
      <h2 id="create-session-title" className="mb-4 text-xl font-bold text-gray-900">
        Host a Game
      </h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="game-select" className="mb-1 block text-sm font-medium text-gray-700">
          Choose a game
        </label>
        <select
          id="game-select"
          value={selectedGameId}
          onChange={(e) => setSelectedGameId(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {selectedGame && (
          <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            <div className="flex flex-wrap gap-3">
              <span>~{selectedGame.estimatedMinutes} min</span>
              <span>{selectedGame.category}</span>
              <span>
                {selectedGame.minPlayers}–{selectedGame.maxPlayers} players
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedGameId}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
