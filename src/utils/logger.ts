import { createLogger, format, transports, Logger } from 'winston';
const { combine, printf, timestamp } = format;

const consoleTransport = new transports.Console({
  // silence logging when the yarn command contains "test" as a substring
  silent: (process.env.npm_lifecycle_event || '').indexOf('test') >= 0,
});
export function setDebugLevel(newLevel: string): void {
  consoleTransport.level = newLevel;
}

const myFormat = printf((info: any) => {
  const msg = typeof info.message === 'string' ? info.message : JSON.stringify(info.message);
  return `${info.timestamp} [${info.level}] ${msg}`;
});

const winstonLogger = createLogger({
  transports: [consoleTransport],
  format: combine(timestamp(), myFormat),
});

class SafeLogger {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public debug(message: any) {
    return this.logger.debug(message);
  }

  public info(message: any) {
    return this.logger.info(message);
  }

  public warn(message: any) {
    return this.logger.warn(message);
  }

  public error(message: any) {
    return this.logger.error(message);
  }
}

export default new SafeLogger(winstonLogger);
