import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';

type MockSession = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActive: Date;
  createdAt: Date;
};

describe('SessionsService', () => {
  let sessionsService: SessionsService;
  let prismaService: {
    session: {
      findMany: jest.Mock<Promise<MockSession[]>, [unknown]>;
      deleteMany: jest.Mock<Promise<{ count: number }>, [unknown]>;
    };
  };

  beforeEach(async () => {
    prismaService = {
      session: {
        findMany: jest.fn<Promise<MockSession[]>, [unknown]>(),
        deleteMany: jest.fn<Promise<{ count: number }>, [unknown]>(),
      },
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    sessionsService = app.get<SessionsService>(SessionsService);
  });

  describe('findAllForUser', () => {
    it('marks the session matching the current sessionId as current', async () => {
      const lastActive = new Date();
      const createdAt = new Date();
      prismaService.session.findMany.mockResolvedValue([
        {
          id: 'session-1',
          ipAddress: '203.0.113.5',
          userAgent: 'Mozilla/5.0',
          lastActive,
          createdAt,
        },
        {
          id: 'session-2',
          ipAddress: '198.51.100.7',
          userAgent: 'curl/8.0',
          lastActive,
          createdAt,
        },
      ]);

      const sessions = await sessionsService.findAllForUser(
        'user-1',
        'session-2',
      );

      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { lastActive: 'desc' },
      });
      expect(sessions).toEqual([
        expect.objectContaining({ id: 'session-1', isCurrent: false }),
        expect.objectContaining({ id: 'session-2', isCurrent: true }),
      ]);
    });
  });

  describe('revoke', () => {
    it('deletes a session owned by the user', async () => {
      prismaService.session.deleteMany.mockResolvedValue({ count: 1 });

      await sessionsService.revoke('user-1', 'session-1');

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { id: 'session-1', userId: 'user-1' },
      });
    });

    it('throws when the session does not exist or belongs to another user', async () => {
      prismaService.session.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        sessionsService.revoke('user-1', 'session-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('revokeAllExceptCurrent', () => {
    it('deletes every session for the user except the current one', async () => {
      prismaService.session.deleteMany.mockResolvedValue({ count: 3 });

      await sessionsService.revokeAllExceptCurrent('user-1', 'session-1');

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', id: { not: 'session-1' } },
      });
    });
  });
});
