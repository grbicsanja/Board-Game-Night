const NICKNAME_KEY = 'bgn_nickname';
const AVATAR_URL_KEY = 'bgn_avatar_url';
const AVATAR_INPUT_KEY = 'bgn_avatar_input';

export function useNickname() {
  const getNickname = (): string | null => localStorage.getItem(NICKNAME_KEY);
  const saveNickname = (nickname: string): void => {
    localStorage.setItem(NICKNAME_KEY, nickname);
  };
  const clearNickname = (): void => {
    localStorage.removeItem(NICKNAME_KEY);
  };

  const getAvatarUrl = (): string | null => localStorage.getItem(AVATAR_URL_KEY);
  const saveAvatarUrl = (url: string): void => {
    if (url) localStorage.setItem(AVATAR_URL_KEY, url);
    else localStorage.removeItem(AVATAR_URL_KEY);
  };

  // Raw user input (email or URL) — kept so the settings form can prefill what
  // the user actually typed instead of the resolved gravatar URL.
  const getAvatarInput = (): string | null => localStorage.getItem(AVATAR_INPUT_KEY);
  const saveAvatarInput = (input: string): void => {
    if (input) localStorage.setItem(AVATAR_INPUT_KEY, input);
    else localStorage.removeItem(AVATAR_INPUT_KEY);
  };

  return {
    getNickname,
    saveNickname,
    clearNickname,
    getAvatarUrl,
    saveAvatarUrl,
    getAvatarInput,
    saveAvatarInput,
  };
}
