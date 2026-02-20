import winston from 'winston';

export interface LoggerConfig {
  enabled: boolean;
  level: string;
}

let loggerConfig: LoggerConfig = {
  enabled: true,
  level: 'info'
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tasty-task' }
});

// Add console transport
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
      const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
      return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
    })
  )
}));

export class Logger {
  static setConfig(config: Partial<LoggerConfig>): void {
    loggerConfig = { ...loggerConfig, ...config };
  }

  static getConfig(): LoggerConfig {
    return loggerConfig;
  }

  static log(message: string, meta?: Record<string, unknown>): void {
    if (loggerConfig.enabled) {
      logger.log('info', message, meta);
    }
  }

  static info(message: string, meta?: Record<string, unknown>): void {
    if (loggerConfig.enabled) {
      logger.info(message, meta);
    }
  }

  static error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    if (loggerConfig.enabled) {
      if (error instanceof Error) {
        logger.error(message, { error: error.message, stack: error.stack, ...meta });
      } else {
        logger.error(message, { error, ...meta });
      }
    }
  }

  static warn(message: string, meta?: Record<string, unknown>): void {
    if (loggerConfig.enabled) {
      logger.warn(message, meta);
    }
  }

  static debug(message: string, meta?: Record<string, unknown>): void {
    if (loggerConfig.enabled) {
      logger.debug(message, meta);
    }
  }
}

export default logger;
