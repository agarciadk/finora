import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_ENTITY_KEY = 'auditLogEntity';

// Tags a handler so `AuditLogInterceptor` knows which entity name to log
// (e.g. 'ACCOUNT', 'TRANSACTION') — the action (CREATE/UPDATE/DELETE) is
// derived from the HTTP method.
export const AuditLog = (entityName: string) =>
  SetMetadata(AUDIT_LOG_ENTITY_KEY, entityName);
