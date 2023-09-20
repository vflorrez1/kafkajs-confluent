export enum LogLevel {
  NOTHING = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 4,
  DEBUG = 5,
}

export interface LogEntry {
  namespace: string;
  level: LogLevel;
  label: string;
  log: LoggerEntryContent;
}

export interface LoggerEntryContent {
  readonly timestamp: string;
  readonly message: string;
  [key: string]: any;
}
