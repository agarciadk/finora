import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.transaction.findMany({
      where: { userId },
      include: { account: true, category: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(dto: CreateTransactionDto) {
    const userId = await this.currentUser.getUserId();
    await this.ensureRelationsBelongToUser(
      userId,
      dto.accountId,
      dto.categoryId,
    );

    return this.prisma.transaction.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        type: dto.type,
        date: new Date(dto.date),
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        userId,
      },
      include: { account: true, category: true },
    });
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const userId = await this.ensureOwnership(id);

    if (dto.accountId || dto.categoryId) {
      await this.ensureRelationsBelongToUser(
        userId,
        dto.accountId,
        dto.categoryId,
      );
    }

    const data: Prisma.TransactionUpdateInput = {
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.date !== undefined && { date: new Date(dto.date) }),
      ...(dto.accountId !== undefined && {
        account: { connect: { id: dto.accountId } },
      }),
      ...(dto.categoryId !== undefined && {
        category: { connect: { id: dto.categoryId } },
      }),
    };

    return this.prisma.transaction.update({
      where: { id },
      data,
      include: { account: true, category: true },
    });
  }

  async remove(id: string) {
    await this.ensureOwnership(id);

    await this.prisma.transaction.delete({ where: { id } });
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
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException('Transaction not found');
    }

    return userId;
  }
}
