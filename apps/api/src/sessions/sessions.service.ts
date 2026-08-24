import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SessionSummary = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActive: Date;
  createdAt: Date;
  isCurrent: boolean;
};

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionSummary[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
      isCurrent: session.id === currentSessionId,
    }));
  }

  async revoke(userId: string, sessionId: string): Promise<void> {
    const { count } = await this.prisma.session.deleteMany({
      where: { id: sessionId, userId },
    });

    if (count === 0) {
      throw new NotFoundException('Session not found');
    }
  }

  async revokeAllExceptCurrent(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId, id: { not: currentSessionId } },
    });
  }
}
