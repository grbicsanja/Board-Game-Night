import { sha256 } from 'js-sha256';

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
  // Gravatar's modern API hashes the lowercased email with SHA-256. We use a
  // pure-JS implementation rather than crypto.subtle because the latter is
  // only exposed in secure contexts (HTTPS / localhost), not on plain-HTTP
  // LAN IPs.
  const hash = sha256(trimmed.toLowerCase());
  return `https://gravatar.com/avatar/${hash}?s=200&d=identicon`;
}
