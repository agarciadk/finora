import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../../auth/auth.types';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ): void {
    const startedAt = Date.now();

    // Listening on `finish` (rather than logging synchronously here) guarantees
    // the final status code is known, including for errors handled downstream
    // by Nest's exception filters. Only metadata is logged — never request or
    // response bodies — so no route (including auth/*) risks leaking secrets.
    response.on('finish', () => {
      const duration = Date.now() - startedAt;
      const userId = request.user?.id;
      const parts = [
        request.method,
        request.originalUrl,
        String(response.statusCode),
        `${duration}ms`,
      ];

      if (userId) {
        parts.push(`userId=${userId}`);
      }

      this.logger.log(parts.join(' '));
    });

    next();
  }
}
