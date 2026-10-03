import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

import env from './config/environment.js';
import { getDatabaseHealth } from './config/database.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { notFoundMiddleware } from './middleware/notFoundMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const openApiDocument = parse(
  fs.readFileSync(path.resolve(process.cwd(), 'docs', 'openapi.yaml'), 'utf8')
);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/v1', apiRateLimiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/api/v1', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management API is running'
  });
});

app.get('/api/v1/health', (_req, res) => {
  const database = getDatabaseHealth();
  const healthy = database === 'connected';

  res.status(200).json({
    success: true,
    status: healthy ? 'healthy' : 'degraded',
    database,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
