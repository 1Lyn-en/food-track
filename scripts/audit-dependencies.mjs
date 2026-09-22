import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const auditArgs = [
  'audit',
  '--json',
  '--registry=https://registry.npmjs.org',
];
const npmCli = process.env.npm_execpath;
const audit = npmCli
  ? spawnSync(process.execPath, [npmCli, ...auditArgs], { encoding: 'utf8' })
  : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', auditArgs, {
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });

if (audit.error) throw audit.error;
if (!audit.stdout?.trim()) {
  process.stderr.write(audit.stderr ?? '');
  throw new Error('npm audit did not return JSON output');
}

const report = JSON.parse(audit.stdout);
const vulnerabilities = Object.values(report.vulnerabilities ?? {});
const severe = vulnerabilities.filter((item) =>
  ['high', 'critical'].includes(item.severity),
);

const acceptedPackages = new Set([
  'drizzle-orm',
  '@lark-apaas/nestjs-datapaas',
  '@lark-apaas/fullstack-nestjs-core',
]);
const unexpected = severe.filter((item) => !acceptedPackages.has(item.name));

const postgresDialect = readFileSync(
  'node_modules/drizzle-orm/pg-core/dialect.js',
  'utf8',
);
const hasIdentifierEscaping = postgresDialect.includes(
  'name.replace(/"/g, \'""\')',
);

if (!hasIdentifierEscaping) {
  throw new Error(
    'The accepted Drizzle advisory requires escaped PostgreSQL identifiers',
  );
}

if (unexpected.length > 0) {
  for (const item of unexpected) {
    console.error(`[${item.severity}] ${item.name}`);
  }
  process.exit(1);
}

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `Dependency audit: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high`,
);
if (severe.length > 0) {
  console.log(
    'Accepted residual: Drizzle GHSA-gpj5-g38j-94v9 and parent propagation.',
  );
}
