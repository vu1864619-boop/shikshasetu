import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { dbManager } from './db/database.js';
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const app = express();

// Initialize database
dbManager.init();

// Middleware
app.use(cors({
  origin: '*', // Configurable in production via environment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'ShikshaSetu Practical Learning & Education Platform',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'NotFound', message: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected server error occurred. Please try again later.'
  });
});

// Start listening if run directly
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.js')) {
  app.listen(config.port, () => {
    console.log(`ShikshaSetu backend listening on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}
