type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Get minimum log level from environment (default to INFO in production, DEBUG in development)
const getMinLogLevel = (): LogLevel => {
  const env = process.env.LOG_LEVEL?.toUpperCase() as LogLevel | undefined;
  if (env && LOG_LEVELS[env] !== undefined) {
    return env;
  }
  return process.env.NODE_ENV === "production" ? "INFO" : "DEBUG";
};

const minLevel = getMinLogLevel();

const formatMessage = (
  level: LogLevel,
  message: string,
  meta?: unknown,
): string => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
};

export const logger = {
  debug: (message: string, meta?: unknown): void => {
    if (shouldLog("DEBUG")) {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },

  info: (message: string, meta?: unknown): void => {
    if (shouldLog("INFO")) {
      console.info(formatMessage("INFO", message, meta));
    }
  },

  warn: (message: string, meta?: unknown): void => {
    if (shouldLog("WARN")) {
      console.warn(formatMessage("WARN", message, meta));
    }
  },

  error: (message: string, meta?: unknown): void => {
    if (shouldLog("ERROR")) {
      console.error(formatMessage("ERROR", message, meta));
    }
  },
};

export default logger;
