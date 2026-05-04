import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { NicknameModal } from '../components/lobby/NicknameModal';
import { SessionList } from '../components/lobby/SessionList';
import { CreateSessionModal } from '../components/lobby/CreateSessionModal';
import { useAppStore } from '../store/useAppStore';

export function LobbyPage() {
  const nickname = useAppStore((s) => s.nickname);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <Layout>
      {!nickname && <NicknameModal />}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Active Sessions</h2>
        <div className="flex gap-2">
          <Link
            to="/add-game"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            + Add Game
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!nickname}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Host a Game
          </button>
        </div>
      </div>

      <SessionList />

      {showCreateModal && <CreateSessionModal onClose={() => setShowCreateModal(false)} />}
    </Layout>
  );
}
