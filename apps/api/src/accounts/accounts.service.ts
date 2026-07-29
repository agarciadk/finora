import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateAccountDto) {
    const userId = await this.currentUser.getUserId();

    return this.prisma.account.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, dto: UpdateAccountDto) {
    await this.ensureOwnership(id);

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureOwnership(id);

    await this.prisma.account.delete({ where: { id } });
  }

  private async ensureOwnership(id: string) {
    const userId = await this.currentUser.getUserId();
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account || account.userId !== userId) {
      throw new NotFoundException('Account not found');
    }
  }
}
