// Logger utility for consistent logging across the application
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Keep last 1000 logs in memory

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatError(error: unknown): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return error;
  }

  private formatData(data: unknown): any {
    if (data instanceof Error) {
      return this.formatError(data);
    }
    if (typeof data === 'object' && data !== null) {
      const formatted: any = {};
      for (const [key, value] of Object.entries(data)) {
        formatted[key] = value instanceof Error ? this.formatError(value) : value;
      }
      return formatted;
    }
    return data;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.formatData(data) : undefined
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Format console output
    const formattedMessage = `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`;
    
    // Log to console with appropriate level
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, entry.data ? JSON.stringify(entry.data, null, 2) : '');
        break;
      case 'info':
        console.info(formattedMessage, entry.data ? JSON.stringify(entry.data, null, 2) : '');
        break;
      case 'warn':
        console.warn(formattedMessage, entry.data ? JSON.stringify(entry.data, null, 2) : '');
        break;
      case 'error':
        console.error(formattedMessage);
        if (entry.data) {
          console.error('Error details:', JSON.stringify(entry.data, null, 2));
        }
        break;
    }

    // In production, you might want to send logs to a service
    if (process.env.NODE_ENV === 'production') {
      this.persistLog(entry);
    }
  }

  private async persistLog(entry: LogEntry) {
    // TODO: Implement log persistence (e.g., send to logging service)
    // This is where you'd integrate with a logging service like:
    // - Sentry
    // - LogRocket
    // - Application Insights
    // - Custom backend logging endpoint
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Get all logs (useful for debugging)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = Logger.getInstance();