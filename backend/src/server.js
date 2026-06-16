import http from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { initSocket } from './sockets/index.js';

const app = createApp();
const server = http.createServer(app);
const io = initSocket(server);

app.set('io', io);

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('[database] connected');
  } catch (error) {
    console.error('[database] connection failed — ensure PostgreSQL is running and DATABASE_URL is set');
    console.error(error.message);
    process.exit(1);
  }

  server.listen(env.port, () => {
    console.log(`[server] HustleBridge API listening on port ${env.port}`);
    console.log(`[server] REST base URL: http://localhost:${env.port}${env.apiPrefix}`);
    console.log(`[server] environment: ${env.nodeEnv}`);
  });
}

const shutdown = async (signal) => {
  console.log(`[server] ${signal} received, shutting down gracefully`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
