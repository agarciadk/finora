import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '../generated/prisma/client';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AuditLogService);
  });

  describe('record', () => {
    it('creates an audit log row with the given fields', async () => {
      await service.record({
        userId: 'user-1',
        action: AuditAction.DELETE,
        entityName: 'TRANSACTION',
        entityId: 'transaction-1',
        ipAddress: '203.0.113.5',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          action: AuditAction.DELETE,
          entityName: 'TRANSACTION',
          entityId: 'transaction-1',
          ipAddress: '203.0.113.5',
          details: undefined,
        },
      });
    });
  });

  describe('findAllForUser', () => {
    it('paginates and scopes results to the given user', async () => {
      prisma.auditLog.count.mockResolvedValue(45);

      const result = await service.findAllForUser({
        userId: 'user-1',
        page: 2,
        limit: 20,
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          skip: 20,
          take: 20,
        }),
      );
      expect(result.meta).toEqual({
        total: 45,
        page: 2,
        limit: 20,
        totalPages: 3,
      });
    });
  });
});
