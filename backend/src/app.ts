import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { errorHandler } from './middleware/error';
import { setupSwagger } from './swagger';
import { config } from './config';

export const createApp = (): Express => {
  const app = express();

  // Security headers (allowing Swagger UI assets)
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : [config.corsOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000', 'exp://*'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing & logging
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'PulseFlow API Server',
    });
  });

  // Interactive Swagger Docs
  setupSwagger(app);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
};

