import { rm } from 'node:fs/promises';

const targets = ['dist', 'dist-server'];

await Promise.all(
  targets.map((target) => rm(target, { force: true, recursive: true })),
);
