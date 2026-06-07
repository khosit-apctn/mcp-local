import { runServer } from './server.js';
import { closePool } from './db.js';

async function main() {
  await runServer();
}

async function handleShutdown(signal: string) {
  console.error(`Received ${signal}. Shutting down...`);
  await closePool();
  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

main().catch(err => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
