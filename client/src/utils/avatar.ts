const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\//i;

export type AvatarInputKind = 'empty' | 'email' | 'url' | 'invalid';

export function classifyAvatarInput(raw: string): AvatarInputKind {
  const trimmed = raw.trim();
  if (!trimmed) return 'empty';
  if (URL_RE.test(trimmed)) return 'url';
  if (EMAIL_RE.test(trimmed)) return 'email';
  return 'invalid';
}

export async function resolveAvatarInput(raw: string): Promise<string> {
  const trimmed = raw.trim();
  const kind = classifyAvatarInput(trimmed);
  if (kind === 'empty' || kind === 'invalid') return '';
  if (kind === 'url') return trimmed;
  const hash = await sha256Hex(trimmed.toLowerCase());
  return `https://gravatar.com/avatar/${hash}?s=200&d=identicon`;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
