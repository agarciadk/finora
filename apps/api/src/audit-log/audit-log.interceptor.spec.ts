import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogService } from './audit-log.service';
import { AuditAction } from '../generated/prisma/client';

function createContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}

function createHandler(response: unknown): CallHandler {
  return { handle: () => of(response) };
}

describe('AuditLogInterceptor', () => {
  let reflector: { get: jest.Mock };
  let auditLogService: { record: jest.Mock };
  let interceptor: AuditLogInterceptor;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    auditLogService = { record: jest.fn().mockResolvedValue(undefined) };
    interceptor = new AuditLogInterceptor(
      reflector as unknown as Reflector,
      auditLogService as unknown as AuditLogService,
    );
  });

  it('skips handlers without the @AuditLog decorator', (done) => {
    reflector.get.mockReturnValue(undefined);
    const request = { method: 'POST', user: { id: 'user-1' } };

    interceptor
      .intercept(createContext(request), createHandler({ id: 'x' }))
      .subscribe(() => {
        expect(auditLogService.record).not.toHaveBeenCalled();
        done();
      });
  });

  it('records a CREATE entry using the id from the response body', (done) => {
    reflector.get.mockReturnValue('ACCOUNT');
    const request = {
      method: 'POST',
      user: { id: 'user-1' },
      ip: '203.0.113.5',
    };

    interceptor
      .intercept(createContext(request), createHandler({ id: 'account-1' }))
      .subscribe(() => {
        setImmediate(() => {
          expect(auditLogService.record).toHaveBeenCalledWith({
            userId: 'user-1',
            action: AuditAction.CREATE,
            entityName: 'ACCOUNT',
            entityId: 'account-1',
            ipAddress: '203.0.113.5',
          });
          done();
        });
      });
  });

  it('records a DELETE entry using the id route param', (done) => {
    reflector.get.mockReturnValue('TRANSACTION');
    const request = {
      method: 'DELETE',
      user: { id: 'user-1' },
      params: { id: 'transaction-1' },
      ip: '203.0.113.5',
    };

    interceptor
      .intercept(createContext(request), createHandler(undefined))
      .subscribe(() => {
        setImmediate(() => {
          expect(auditLogService.record).toHaveBeenCalledWith(
            expect.objectContaining({
              action: AuditAction.DELETE,
              entityId: 'transaction-1',
            }),
          );
          done();
        });
      });
  });

  it('does not record anything when there is no authenticated user', (done) => {
    reflector.get.mockReturnValue('ACCOUNT');
    const request = { method: 'POST' };

    interceptor
      .intercept(createContext(request), createHandler({ id: 'account-1' }))
      .subscribe(() => {
        setImmediate(() => {
          expect(auditLogService.record).not.toHaveBeenCalled();
          done();
        });
      });
  });
});
