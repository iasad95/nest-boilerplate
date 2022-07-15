import { ConsoleLogger, Injectable } from '@nestjs/common';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

@Injectable()
export class StructuredLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context ?? 'Application');
  }

  override log(message: unknown, context?: string) {
    process.stdout.write(this.format('log', message, undefined, context) + '\n');
  }

  override error(message: unknown, trace?: string, context?: string) {
    process.stderr.write(this.format('error', message, trace, context) + '\n');
  }

  override warn(message: unknown, context?: string) {
    process.stdout.write(this.format('warn', message, undefined, context) + '\n');
  }

  override debug(message: unknown, context?: string) {
    process.stdout.write(this.format('debug', message, undefined, context) + '\n');
  }

  override verbose(message: unknown, context?: string) {
    process.stdout.write(this.format('verbose', message, undefined, context) + '\n');
  }

  private format(
    level: LogLevel,
    message: unknown,
    trace?: string,
    context?: string,
  ) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context: context || this.context || 'Application',
      message: this.normalizeMessage(message),
      ...(trace ? { trace } : {}),
    };

    return JSON.stringify(payload);
  }

  private normalizeMessage(message: unknown) {
    if (message instanceof Error) {
      return message.message;
    }
    if (typeof message === 'string') {
      return message;
    }
    return JSON.stringify(message);
  }
}
