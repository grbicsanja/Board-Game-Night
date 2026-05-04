import { useState, FormEvent } from 'react';
import { Modal } from '../shared/Modal';
import { socket } from '../../socket';
import { useAppStore } from '../../store/useAppStore';
import { useNickname } from '../../hooks/useNickname';

export function NicknameModal() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const setNickname = useAppStore((s) => s.setNickname);
  const { saveNickname } = useNickname();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim().slice(0, 20);
    if (!trimmed) {
      setError('Please enter a nickname.');
      return;
    }
    saveNickname(trimmed);
    setNickname(trimmed);
    socket.emit('player:register', { nickname: trimmed });
  };

  return (
    <Modal titleId="nickname-modal-title" onClose={() => {}}>
      <h2 id="nickname-modal-title" className="mb-1 text-xl font-bold text-gray-900">
        Welcome to Board Game Night!
      </h2>
      <p className="mb-4 text-sm text-gray-500">Pick a nickname to join the party.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="nickname-input" className="mb-1 block text-xs font-bold text-gray-700">
          Your nickname
        </label>
        <input
          id="nickname-input"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          placeholder="e.g. BoardGamePro"
          maxLength={20}
          autoComplete="off"
          autoCapitalize="words"
          inputMode="text"
          className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-describedby={error ? 'nickname-error' : undefined}
        />
        {error && (
          <p id="nickname-error" role="alert" className="mb-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <p className="mb-4 text-xs text-gray-400">{20 - value.trim().length} characters remaining</p>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Join Party
        </button>
      </form>
    </Modal>
  );
}
