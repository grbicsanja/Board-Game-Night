import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { socket } from '../socket';

const CATEGORIES = ['Strategy', 'Party', 'Cooperative', 'Deduction', 'Deck-building', 'Other'];

export function AddGamePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Game name is required.');
      return;
    }
    setSubmitting(true);
    socket.emit(
      'game:add',
      { name: trimmed, category, estimatedMinutes, minPlayers, maxPlayers },
      (response) => {
        setSubmitting(false);
        if ('error' in response) {
          setError(response.error);
          return;
        }
        navigate('/');
      }
    );
  };

  return (
    <Layout>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        ← Back to lobby
      </Link>

      <h2 className="mb-4 text-lg font-bold text-gray-900">Add a Game</h2>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <label htmlFor="game-name" className="mb-1 block text-sm font-medium text-gray-700">
            Game name <span aria-hidden="true">*</span>
          </label>
          <input
            id="game-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Splendor"
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-describedby={error ? 'game-name-error' : undefined}
          />
          {error && (
            <p id="game-name-error" role="alert" className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="est-minutes" className="mb-1 block text-sm font-medium text-gray-700">
            Estimated play time (minutes)
          </label>
          <input
            id="est-minutes"
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={600}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="min-players" className="mb-1 block text-sm font-medium text-gray-700">
              Min players
            </label>
            <input
              id="min-players"
              type="number"
              value={minPlayers}
              onChange={(e) => setMinPlayers(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label htmlFor="max-players" className="mb-1 block text-sm font-medium text-gray-700">
              Max players
            </label>
            <input
              id="max-players"
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Link
            to="/"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Game'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
