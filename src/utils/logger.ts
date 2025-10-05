/**
 * Logger Utility
 *
 * Environment-aware logging system that only shows debug logs in development.
 * Prevents console pollution in production while maintaining error visibility.
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * logger.debug('Component mounted', { props });
 * logger.info('User action completed');
 * logger.warn('Deprecated feature used');
 * logger.error('Operation failed', error);
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enabled?: boolean;
  level?: LogLevel;
  prefix?: string;
}

class Logger {
  private enabled: boolean;
  private level: LogLevel;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.enabled = options.enabled ?? import.meta.env.DEV;
    this.level = options.level ?? 'debug';
    this.prefix = options.prefix ?? '';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const requestedLevelIndex = levels.indexOf(level);
    return this.enabled && requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  /**
   * Debug logs - only shown in development
   * Use for verbose logging during development
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      logger.debug(`[DEBUG] ${this.formatMessage(message)}`, ...args);
    }
  }

  /**
   * Info logs - shown in all environments
   * Use for important application events
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      logger.info(`[INFO] ${this.formatMessage(message)}`, ...args);
    }
  }

  /**
   * Warning logs - shown in all environments
   * Use for recoverable errors or deprecated features
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      logger.warn(`[WARN] ${this.formatMessage(message)}`, ...args);
    }
  }

  /**
   * Error logs - always shown
   * Use for critical errors that need attention
   */
  error(message: string, ...args: any[]): void {
    logger.error(`[ERROR] ${this.formatMessage(message)}`, ...args);
  }

  /**
   * Create a child logger with a prefix
   * Useful for component-specific logging
   */
  child(prefix: string): Logger {
    return new Logger({
      enabled: this.enabled,
      level: this.level,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
    });
  }
}

// Default logger instance
export const logger = new Logger();

// Create specialized loggers for different parts of the app
export const mapLogger = logger.child('Map');
export const gameLogger = logger.child('Game');
export const studyLogger = logger.child('Study');
export const soundLogger = logger.child('Sound');
export const storageLogger = logger.child('Storage');
export const achievementLogger = logger.child('Achievement');

export default logger;
