import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditAction } from '../generated/prisma/client';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_ENTITY_KEY } from './audit-log.decorator';
import { getClientIp } from './get-client-ip.util';

const ACTION_BY_METHOD: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  PATCH: AuditAction.UPDATE,
  PUT: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const entityName = this.reflector.get<string | undefined>(
      AUDIT_LOG_ENTITY_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const action = ACTION_BY_METHOD[request.method];

    if (!entityName || !action) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody: unknown) => {
        const userId = request.user?.id;

        if (!userId) {
          return;
        }

        const requestBody = request.body as Record<string, unknown> | undefined;
        const bulkTransactionIds = Array.isArray(requestBody?.transactionIds)
          ? (requestBody.transactionIds as unknown[]).filter(
              (value): value is string => typeof value === 'string',
            )
          : undefined;

        const entityId =
          (request.params as Record<string, string> | undefined)?.['id'] ??
          (bulkTransactionIds ? undefined : this.extractId(responseBody));

        // Fire-and-forget: auditing must never slow down or break the
        // actual response.
        this.auditLogService
          .record({
            userId,
            action,
            entityName,
            entityId,
            ipAddress: getClientIp(request),
            ...(bulkTransactionIds && {
              details: { transactionIds: bulkTransactionIds },
            }),
          })
          .catch((error: unknown) => {
            this.logger.error('Failed to record audit log', error);
          });
      }),
    );
  }

  private extractId(body: unknown): string | undefined {
    if (body && typeof body === 'object' && 'id' in body) {
      const { id } = body;
      return typeof id === 'string' ? id : undefined;
    }

    return undefined;
  }
}
