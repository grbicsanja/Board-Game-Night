import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { socket } from '../socket';
import { useAppStore } from '../store/useAppStore';

const TOKEN_STORAGE_KEY = 'bgn-admin-token';

export function AdminPage() {
  const sessions = useAppStore((s) => s.sessions);
  const games = useAppStore((s) => s.games);
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmEndAll, setConfirmEndAll] = useState(false);

  // Auto-auth on mount if a token is stored, and on every reconnect.
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) return;

    const tryAuth = () => {
      socket.emit('admin:auth', { token: stored }, (res) => {
        if (res.ok) {
          setAuthed(true);
        } else {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setAuthed(false);
        }
      });
    };

    if (socket.connected) tryAuth();
    socket.on('connect', tryAuth);
    return () => {
      socket.off('connect', tryAuth);
    };
  }, []);

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    socket.emit('admin:auth', { token: token.trim() }, (res) => {
      setSubmitting(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
      setToken('');
      setAuthed(true);
    });
  };

  const handleEndSession = (sessionId: string) => {
    setEndingId(sessionId);
    socket.emit('admin:end_session', { sessionId }, (res) => {
      setEndingId(null);
      if (!res.ok) alert(res.error);
    });
  };

  const handleRemoveGame = (gameId: string) => {
    setRemovingId(gameId);
    socket.emit('admin:remove_game', { gameId }, (res) => {
      setRemovingId(null);
      if (!res.ok) alert(res.error);
    });
  };

  const handleEndAll = () => {
    socket.emit('admin:end_all_sessions', (res) => {
      setConfirmEndAll(false);
      if (!res.ok) alert(res.error);
    });
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthed(false);
  };

  if (!authed) {
    return (
      <Layout>
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          ← Back to lobby
        </Link>
        <h2 className="mb-4 text-sm font-bold text-gray-900">Server Admin</h2>
        <form
          onSubmit={handleAuth}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label htmlFor="admin-token" className="mb-1 block text-xs font-bold text-gray-700">
              Admin token
            </label>
            <input
              id="admin-token"
              type="password"
              value={token}
              autoComplete="off"
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-describedby={error ? 'admin-token-error' : undefined}
            />
            {error && (
              <p id="admin-token-error" role="alert" className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting || !token.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          ← Back to lobby
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Sign out
        </button>
      </div>

      <h2 className="mb-4 text-sm font-bold text-gray-900">Server Admin</h2>

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Active sessions ({sessions.length})
          </h3>
          {sessions.length > 0 &&
            (confirmEndAll ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEndAll}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Confirm end all
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmEndAll(false)}
                  className="text-xs text-gray-600 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmEndAll(true)}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                End all
              </button>
            ))}
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">No active sessions.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium text-gray-800">{s.gameName}</span>
                  <span className="ml-2 text-gray-500">
                    {s.hostNickname} · {s.playerCount} player{s.playerCount === 1 ? '' : 's'} ·{' '}
                    {s.status}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleEndSession(s.id)}
                  disabled={endingId === s.id}
                  className="ml-3 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {endingId === s.id ? 'Ending…' : 'End'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
          Game library ({games.length})
        </h3>
        {games.length === 0 ? (
          <p className="text-sm text-gray-500">No games in library.</p>
        ) : (
          <ul className="space-y-2">
            {games.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium text-gray-800">{g.name}</span>
                  <span className="ml-2 text-gray-500">
                    {g.category} · {g.minPlayers}–{g.maxPlayers} · ~{g.estimatedMinutes}m
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveGame(g.id)}
                  disabled={removingId === g.id}
                  className="ml-3 rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {removingId === g.id ? 'Removing…' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
