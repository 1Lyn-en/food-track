import { cp, mkdir } from 'node:fs/promises';

const source = 'server/capabilities';
const destination = 'dist/server/capabilities';

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
