const KEY = 'bgn_nickname';

export function useNickname() {
  const get = (): string | null => localStorage.getItem(KEY);

  const set = (nickname: string): void => {
    localStorage.setItem(KEY, nickname);
  };

  const clear = (): void => {
    localStorage.removeItem(KEY);
  };

  return { getNickname: get, saveNickname: set, clearNickname: clear };
}
