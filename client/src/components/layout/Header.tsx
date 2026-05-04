import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SettingsModal } from './SettingsModal';

export function Header() {
  const nickname = useAppStore((s) => s.nickname);
  const connected = useAppStore((s) => s.connected);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="border-b-2 border-indigo-900 bg-indigo-950 px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <h1 className="text-[10px] font-bold text-indigo-300">🎲 Board Game Night</h1>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-500'}`}
            aria-hidden="true"
          />
          {nickname && <span className="text-[9px] font-bold text-indigo-200">{nickname}</span>}
          {nickname && (
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded text-indigo-300 hover:bg-indigo-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
}
