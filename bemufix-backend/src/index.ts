import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routers
import vehicleRouter from './routes/vehicle';
// import chatRouter from './routes/chat'; // OpenAI chat - disabled
import chatV2Router from './routes/chatV2';

// Import middleware
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Import services
import { RedisService } from './services/RedisService';
import { BMWIntelligence } from './services/BMWIntelligence';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for serving React app
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(rateLimiter);

// Serve static files from React app (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/vehicle', vehicleRouter);
// app.use('/api/chat', chatRouter); // OpenAI chat - disabled
app.use('/api/v2/chat', chatV2Router);

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    // Initialize Redis
    await RedisService.connect();
    logger.info('Redis connected successfully');

    // Initialize BMW Intelligence
    await BMWIntelligence.initialize();
    logger.info('BMW Intelligence initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Bemufix Backend + Frontend running on port ${PORT}`);
      logger.info(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Domain: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  
  await RedisService.disconnect();
  logger.info('Redis disconnected');
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  
  await RedisService.disconnect();
  logger.info('Redis disconnected');
  
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize and start the application
initializeServices().catch((error) => {
  logger.error('Application startup failed:', error);
  process.exit(1);
});

export default app;