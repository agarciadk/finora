import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { UpdateRecurringPaymentDto } from './dto/update-recurring-payment.dto';
import { ExecuteRecurringPaymentDto } from './dto/execute-recurring-payment.dto';
import { getNextOccurrence } from './date-frequency.util';

const INCLUDE_RELATIONS = { account: true, category: true } as const;

@Injectable()
export class RecurringPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.recurringPayment.findMany({
      where: { userId },
      include: INCLUDE_RELATIONS,
      orderBy: { nextPaymentDate: 'asc' },
    });
  }

  async create(dto: CreateRecurringPaymentDto) {
    const userId = await this.currentUser.getUserId();
    await this.ensureRelationsBelongToUser(
      userId,
      dto.accountId,
      dto.categoryId,
    );

    return this.prisma.recurringPayment.create({
      data: {
        userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        name: dto.name,
        amount: dto.amount,
        type: dto.type,
        frequency: dto.frequency,
        startDate: new Date(dto.startDate),
        // The first occurrence is due on `startDate` itself; `execute()`
        // is what advances it from there on.
        nextPaymentDate: new Date(dto.startDate),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: INCLUDE_RELATIONS,
    });
  }

  async update(id: string, dto: UpdateRecurringPaymentDto) {
    const userId = await this.ensureOwnership(id);

    if (dto.accountId || dto.categoryId) {
      await this.ensureRelationsBelongToUser(
        userId,
        dto.accountId,
        dto.categoryId,
      );
    }

    const { startDate, ...rest } = dto;

    return this.prisma.recurringPayment.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
      },
      include: INCLUDE_RELATIONS,
    });
  }

  async remove(id: string) {
    await this.ensureOwnership(id);

    await this.prisma.recurringPayment.delete({ where: { id } });
  }

  // Creates the corresponding Transaction and advances `nextPaymentDate`
  // atomically: either both happen, or neither does.
  async execute(id: string, dto: ExecuteRecurringPaymentDto) {
    const userId = await this.currentUser.getUserId();

    return this.prisma.runInTransaction(async (tx) => {
      const recurringPayment = await tx.recurringPayment.findUnique({
        where: { id },
      });

      if (!recurringPayment || recurringPayment.userId !== userId) {
        throw new NotFoundException('Recurring payment not found');
      }

      if (!recurringPayment.isActive) {
        throw new BadRequestException('Recurring payment is not active');
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: recurringPayment.accountId,
          categoryId: recurringPayment.categoryId,
          description: recurringPayment.name,
          amount: recurringPayment.amount,
          type: recurringPayment.type,
          date: dto.date ? new Date(dto.date) : new Date(),
        },
        include: INCLUDE_RELATIONS,
      });

      const nextPaymentDate = getNextOccurrence(
        recurringPayment.frequency,
        recurringPayment.nextPaymentDate,
        recurringPayment.startDate,
      );

      const updatedRecurringPayment = await tx.recurringPayment.update({
        where: { id },
        data: { nextPaymentDate },
        include: INCLUDE_RELATIONS,
      });

      return { transaction, recurringPayment: updatedRecurringPayment };
    });
  }

  private async ensureRelationsBelongToUser(
    userId: string,
    accountId?: string,
    categoryId?: string,
  ) {
    if (accountId) {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account || account.userId !== userId) {
        throw new BadRequestException('Invalid accountId');
      }
    }

    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category || category.userId !== userId) {
        throw new BadRequestException('Invalid categoryId');
      }
    }
  }

  private async ensureOwnership(id: string) {
    const userId = await this.currentUser.getUserId();
    const recurringPayment = await this.prisma.recurringPayment.findUnique({
      where: { id },
    });

    if (!recurringPayment || recurringPayment.userId !== userId) {
      throw new NotFoundException('Recurring payment not found');
    }

    return userId;
  }
}
