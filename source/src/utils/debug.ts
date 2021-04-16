const debug = require('debug');

const debugTable = debug(`InfiniteTable`);

export interface LogFn {
  (...args: any[]): LogFn;
  extend: (channelName: string) => LogFn;
}
export const dbg = (channelName: string): LogFn => {
  return debugTable.extend(channelName);
};

export const err = (channelName: string): LogFn => {
  const result = debugTable.extend(`${channelName}:error`);

  result.bind = console.error.bind(console);

  return result;
};

const emptyLogFn = () => emptyLogFn;
emptyLogFn.extend = () => emptyLogFn;

export class Logger {
  debug: LogFn;
  error: LogFn;

  constructor(channelName: string) {
    this.debug = emptyLogFn;
    this.error = emptyLogFn;
    if (process.env.NODE_ENV === 'development') {
      this.debug = dbg(channelName);
      this.error = err(channelName);
    }
  }
}
