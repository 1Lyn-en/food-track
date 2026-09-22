import { chmod } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const hookPath = new URL('../.githooks/pre-commit', import.meta.url);

try {
  await chmod(hookPath, 0o755);
} catch {
  // Windows does not require executable file mode for Git hooks.
}

const probe = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
  stdio: 'ignore',
});

if (probe.status === 0) {
  const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
