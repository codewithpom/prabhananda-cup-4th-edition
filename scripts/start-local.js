#!/usr/bin/env node
import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const firebaseCommand = isWindows ? 'npx.cmd' : 'npx';

function start(command, args, name) {
  const proc = spawn(command, args, { stdio: 'inherit', shell: false });
  proc.on('exit', (code, signal) => {
    console.log(`${name} exited with code=${code} signal=${signal}`);
  });
  proc.on('error', (err) => {
    console.error(`${name} failed to start:`, err.message || err);
    if (name === 'firebase-emulator') {
      console.error('Make sure Node/npm is installed. If Firebase CLI is not available globally, npx will fetch it temporarily.');
    }
  });
  return proc;
}

// Start Firebase emulators via npx to avoid PATH issues on Windows
const emu = start(firebaseCommand, ['firebase', 'emulators:start', '--only', 'database,auth'], 'firebase-emulator');

// Delay starting the dev server slightly so emulators can initialize
setTimeout(() => {
  const dev = start(npmCommand, ['run', 'dev'], 'vite-dev');

  function shutdown(code) {
    try { if (dev && !dev.killed) dev.kill('SIGINT'); } catch(e) {}
    try { if (emu && !emu.killed) emu.kill('SIGINT'); } catch(e) {}
    process.exit(code ?? 0);
  }

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
  dev.on('exit', (c) => shutdown(c));
}, 1200);
