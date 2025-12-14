import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston about the colors
winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  })
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  (transports as any[]).push(
    // Info and above go to combined.log
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: fileFormat,
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Only errors go to error.log
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      format: fileFormat,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports,
  // Don't exit on handled exceptions
  exitOnError: false
});

// Create a stream object for Morgan HTTP logger
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Enhanced logging methods
export const loggers = {
  // Vehicle lookup specific logging
  vehicleLookup: {
    success: (regNumber: string, source: string, responseTime: number) => {
      logger.info(`Vehicle lookup success: ${regNumber} from ${source} in ${responseTime}ms`);
    },
    failure: (regNumber: string, error: any, source?: string) => {
      logger.error(`Vehicle lookup failed: ${regNumber} ${source ? `from ${source}` : ''} - ${error.message}`);
    },
    cache: {
      hit: (regNumber: string) => {
        logger.debug(`Cache hit for vehicle: ${regNumber}`);
      },
      miss: (regNumber: string) => {
        logger.debug(`Cache miss for vehicle: ${regNumber}`);
      },
      set: (regNumber: string, ttl: number) => {
        logger.debug(`Cache set for vehicle: ${regNumber} (TTL: ${ttl}s)`);
      }
    }
  },
  
  // Chat specific logging
  chat: {
    message: (sessionId: string, messageLength: number, hasVehicleInfo: boolean) => {
      logger.info(`Chat message: session=${sessionId}, length=${messageLength}, vehicle=${hasVehicleInfo}`);
    },
    aiResponse: (sessionId: string, model: string, tokens?: number) => {
      logger.info(`AI response: session=${sessionId}, model=${model}${tokens ? `, tokens=${tokens}` : ''}`);
    },
    sessionCreated: (sessionId: string) => {
      logger.info(`New chat session created: ${sessionId}`);
    },
    error: (sessionId: string, error: any) => {
      logger.error(`Chat error for session ${sessionId}: ${error.message}`);
    }
  },
  
  // API specific logging
  api: {
    request: (method: string, path: string, ip: string, userAgent?: string) => {
      logger.http(`${method} ${path} from ${ip}${userAgent ? ` (${userAgent})` : ''}`);
    },
    response: (method: string, path: string, statusCode: number, responseTime: number) => {
      const level = statusCode >= 400 ? 'warn' : 'info';
      logger.log(level, `${method} ${path} ${statusCode} - ${responseTime}ms`);
    },
    rateLimited: (ip: string, path: string) => {
      logger.warn(`Rate limited: ${ip} on ${path}`);
    }
  },
  
  // Service specific logging
  service: {
    startup: (serviceName: string, port?: number) => {
      logger.info(`${serviceName} started${port ? ` on port ${port}` : ''}`);
    },
    shutdown: (serviceName: string) => {
      logger.info(`${serviceName} shutting down`);
    },
    connected: (serviceName: string, details?: string) => {
      logger.info(`Connected to ${serviceName}${details ? `: ${details}` : ''}`);
    },
    disconnected: (serviceName: string, reason?: string) => {
      logger.warn(`Disconnected from ${serviceName}${reason ? `: ${reason}` : ''}`);
    },
    error: (serviceName: string, error: any) => {
      logger.error(`${serviceName} error: ${error.message}`, { stack: error.stack });
    }
  },
  
  // Security logging
  security: {
    authSuccess: (userId: string, ip: string) => {
      logger.info(`Authentication success: user=${userId}, ip=${ip}`);
    },
    authFailure: (attempt: string, ip: string, reason?: string) => {
      logger.warn(`Authentication failure: attempt=${attempt}, ip=${ip}${reason ? `, reason=${reason}` : ''}`);
    },
    suspiciousActivity: (activity: string, ip: string, details?: any) => {
      logger.warn(`Suspicious activity: ${activity} from ${ip}`, details);
    }
  },
  
  // Performance logging
  performance: {
    slowQuery: (operation: string, duration: number, threshold: number) => {
      logger.warn(`Slow operation: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);
    },
    memoryUsage: (usage: NodeJS.MemoryUsage) => {
      const mb = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;
      logger.debug(`Memory usage: RSS=${mb(usage.rss)}MB, Heap=${mb(usage.heapUsed)}/${mb(usage.heapTotal)}MB`);
    }
  }
};

// Error handling for uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      format: fileFormat
    })
  );

  logger.rejections.handle(
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      format: fileFormat
    })
  );
}

export default logger;