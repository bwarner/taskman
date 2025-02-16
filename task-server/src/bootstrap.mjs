// register.ts
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// ✅ Register ts-node/esm loader dynamically
register('ts-node/esm', pathToFileURL('./'));

// ✅ Now load your actual TypeScript server
import('./server.ts');
