const args = Bun.argv.slice(2);

const bff = Bun.spawn(['bun', 'run', 'src/server/index.ts'], {
  env: { ...process.env, PORT: '3001' },
  stdout: 'inherit',
  stderr: 'inherit',
});

const vite = Bun.spawn(['bun', 'x', 'vite', 'dev', ...args], {
  env: process.env,
  stdout: 'inherit',
  stderr: 'inherit',
});

let shuttingDown = false;

async function shutdown(code: number): Promise<never> {
  if (shuttingDown) process.exit(code);
  shuttingDown = true;

  bff.kill();
  vite.kill();
  await Promise.allSettled([bff.exited, vite.exited]);
  process.exit(code);
}

process.on('SIGINT', () => {
  void shutdown(130);
});

process.on('SIGTERM', () => {
  void shutdown(143);
});

const [processName, code] = await Promise.race([
  bff.exited.then((code) => ['BFF', code] as const),
  vite.exited.then((code) => ['Vite', code] as const),
]);

if (!shuttingDown) {
  console.error(`${processName} dev process exited with code ${code}.`);
  await shutdown(code ?? 1);
}

export {};
