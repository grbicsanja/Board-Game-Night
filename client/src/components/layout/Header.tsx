import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const nickname = useAppStore((s) => s.nickname);
  const connected = useAppStore((s) => s.connected);

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <h1 className="text-lg font-bold text-indigo-700">🎲 Board Game Night</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span
            className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-300'}`}
            aria-hidden="true"
          />
          {nickname && <span className="font-medium text-gray-700">{nickname}</span>}
        </div>
      </div>
    </header>
  );
}
