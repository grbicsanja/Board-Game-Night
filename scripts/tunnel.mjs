#!/usr/bin/env node
import { spawn } from 'node:child_process';
import process from 'node:process';

const subdomain = process.argv[2] || process.env.TUNNEL_SUBDOMAIN;
const port = process.env.PORT || '3030';

const children = [];

function run(label, command, args, env = {}) {
  const child = spawn(command, args, {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, ...env },
  });
  children.push(child);
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[${label}] exited (code=${code ?? 'null'} signal=${signal ?? 'null'})`);
    shutdown(code ?? 1);
  });
  return child;
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    if (!c.killed) c.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 200).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log(`▶ board-game-night server on :${port}`);
console.log(`▶ tunnel: ${subdomain ? `subdomain "${subdomain}"` : 'random subdomain'}`);
console.log('');

run('server', process.execPath, ['server/dist/index.js'], {
  NODE_ENV: 'production',
  PORT: port,
});

const ltArgs = ['--yes', 'localtunnel', '--port', port];
if (subdomain) ltArgs.push('--subdomain', subdomain);
run('tunnel', 'npx', ltArgs);
