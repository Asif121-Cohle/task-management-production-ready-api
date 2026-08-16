import http from 'node:http';

import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import env from './config/environment.js';

const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase(env.MONGO_URI);

  server.listen(env.PORT, () => {
    console.info(`Server listening on port ${env.PORT}`);
  });
};

const shutdown = async (signal) => {
  console.warn(`${signal} received. Starting graceful shutdown.`);

  server.close(async () => {
    await disconnectDatabase();
    console.info('HTTP server and MongoDB connection closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
