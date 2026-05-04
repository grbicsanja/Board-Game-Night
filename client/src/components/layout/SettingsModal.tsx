import { FormEvent, useState } from 'react';
import { Modal } from '../shared/Modal';
import { socket } from '../../socket';
import { useAppStore } from '../../store/useAppStore';
import { useNickname } from '../../hooks/useNickname';
import { classifyAvatarInput, resolveAvatarInput } from '../../utils/avatar';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const nickname = useAppStore((s) => s.nickname);
  const setNickname = useAppStore((s) => s.setNickname);
  const setAvatarUrl = useAppStore((s) => s.setAvatarUrl);
  const { saveNickname, saveAvatarUrl, getAvatarInput, saveAvatarInput } = useNickname();

  const [nameInput, setNameInput] = useState(nickname ?? '');
  const [avatarInput, setAvatarInput] = useState(getAvatarInput() ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim().slice(0, 20);
    const trimmedAvatar = avatarInput.trim();

    if (!trimmedName) {
      setError('Display name cannot be empty.');
      return;
    }

    const kind = classifyAvatarInput(trimmedAvatar);
    if (kind === 'invalid') {
      setError('Enter your Gravatar email or an image URL starting with http(s)://');
      return;
    }

    setSubmitting(true);
    const resolvedUrl = await resolveAvatarInput(trimmedAvatar);

    saveNickname(trimmedName);
    saveAvatarInput(trimmedAvatar);
    saveAvatarUrl(resolvedUrl);
    setNickname(trimmedName);
    setAvatarUrl(resolvedUrl || null);

    socket.emit('player:update', {
      nickname: trimmedName,
      avatarUrl: resolvedUrl,
    });

    onClose();
  };

  return (
    <Modal titleId="settings-modal-title" onClose={onClose}>
      <h2 id="settings-modal-title" className="mb-1 text-xl font-bold text-gray-900">
        Your settings
      </h2>
      <p className="mb-4 text-sm text-gray-500">
        Change how you appear to other players.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="settings-nickname" className="mb-1 block text-xs font-bold text-gray-700">
          Display name
        </label>
        <input
          id="settings-nickname"
          type="text"
          value={nameInput}
          onChange={(e) => {
            setNameInput(e.target.value);
            setError('');
          }}
          maxLength={20}
          autoComplete="off"
          autoCapitalize="words"
          inputMode="text"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <label htmlFor="settings-avatar" className="mb-1 block text-xs font-bold text-gray-700">
          Gravatar email or image URL
        </label>
        <input
          id="settings-avatar"
          type="text"
          value={avatarInput}
          onChange={(e) => {
            setAvatarInput(e.target.value);
            setError('');
          }}
          placeholder="you@example.com or https://..."
          autoComplete="off"
          inputMode="email"
          className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <p className="mb-4 text-xs text-gray-400">
          Enter the email tied to your Gravatar — we'll fetch your avatar from gravatar.com. Or paste any public image URL. Leave empty for the default initial.
        </p>

        {error && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-base font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
