import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const nickname = useAppStore((s) => s.nickname);
  const connected = useAppStore((s) => s.connected);

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
        </div>
      </div>
    </header>
  );
}
