import { type ChildProcessByStdio, spawn } from 'node:child_process';
import type { Readable } from 'node:stream';

type E2eProcess = ChildProcessByStdio<null, Readable, Readable>;

interface StartedServer {
  url: string;
  stop: () => Promise<void>;
}

interface ReadyMessage {
  type: 'ready';
  url: string;
}

function serverEntry(): string {
  return new URL('./server-entry.ts', import.meta.url).pathname;
}

export interface DashboardOptions {
  apiBase: string;
  adminToken?: string;
  workspaceId?: string | null;
  port?: number;
  env?: Record<string, string>;
}

function waitForReady(child: E2eProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`timed out waiting for e2e server readiness\n${stderr}`));
    }, 10_000);

    function cleanup() {
      clearTimeout(timer);
      child.stdout.off('data', onStdout);
      child.stderr.off('data', onStderr);
      child.off('exit', onExit);
      child.off('error', onError);
    }

    function onStdout(chunk: Buffer) {
      stdout += chunk.toString();
      for (const line of stdout.split('\n')) {
        if (!line.trim()) continue;
        try {
          const message = JSON.parse(line) as ReadyMessage;
          if (message.type === 'ready') {
            cleanup();
            resolve(message.url);
            return;
          }
        } catch {
          // Ignore non-JSON process output until a readiness message arrives.
        }
      }
    }

    function onStderr(chunk: Buffer) {
      stderr += chunk.toString();
    }

    function onExit(code: number | null, signal: NodeJS.Signals | null) {
      cleanup();
      reject(
        new Error(`e2e server exited before readiness: code=${code ?? 'null'} signal=${signal ?? 'null'}\n${stderr}`),
      );
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    child.stdout.on('data', onStdout);
    child.stderr.on('data', onStderr);
    child.once('exit', onExit);
    child.once('error', onError);
  });
}

async function stopProcess(child: E2eProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;

  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve();
    }, 5000);

    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });

    child.kill('SIGTERM');
  });
}

async function startProcess(args: string[], env: Record<string, string> = {}): Promise<StartedServer> {
  const child = spawn('bun', ['run', serverEntry(), ...args], {
    cwd: process.cwd(),
    env: { ...process.env, LOG_LEVEL: 'silent', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const url = await waitForReady(child);

  return {
    url,
    stop: () => stopProcess(child),
  };
}

export function startStubHoncho(port = 0): Promise<StartedServer> {
  return startProcess(['honcho', String(port)]);
}

export function startDashboard(options: DashboardOptions): Promise<StartedServer> {
  return startProcess(
    [
      'dashboard',
      String(options.port ?? 0),
      options.apiBase,
      options.adminToken ?? 'test-token',
      options.workspaceId ?? '__NULL__',
    ],
    options.env ?? {},
  );
}
