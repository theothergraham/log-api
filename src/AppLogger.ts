// vim: ts=2:sts=2:sw=2:et:ai

// NOTE could use `winston` or similar but just dumping to console is all we need right now.

export enum LogLevel {
  FATAL,
  ERROR,
  WARN,
  INFO,
  DEBUG,
  TRACE
}

export class AppLogger {
  level : LogLevel;

  constructor() {
    if (process.env.DEBUG) {
      this.level = LogLevel.DEBUG;
    } else {
      this.level = LogLevel.WARN;
    }
  }

  debug(msg : string) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(msg);
    }
  }
}

const logger : AppLogger = new AppLogger();

export { logger }
