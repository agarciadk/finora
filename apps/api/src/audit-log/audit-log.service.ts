import { Injectable } from '@nestjs/common';
import { Prisma, AuditAction } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type RecordAuditLogInput = {
  userId: string;
  action: AuditAction;
  entityName: string;
  entityId?: string;
  ipAddress?: string;
  details?: Prisma.InputJsonValue;
};

export type FindAuditLogsForUserInput = {
  userId: string;
  page: number;
  limit: number;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditLogInput) {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityName: input.entityName,
        entityId: input.entityId,
        ipAddress: input.ipAddress,
        details: input.details,
      },
    });
  }

  async findAllForUser({ userId, page, limit }: FindAuditLogsForUserInput) {
    const where: Prisma.AuditLogWhereInput = { userId };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
