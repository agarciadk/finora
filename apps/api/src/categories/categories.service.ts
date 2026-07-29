import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto) {
    const userId = await this.currentUser.getUserId();

    await this.ensureNameIsAvailable(userId, dto.name);

    return this.prisma.category.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const userId = await this.ensureOwnership(id);

    if (dto.name) {
      await this.ensureNameIsAvailable(userId, dto.name, id);
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureOwnership(id);

    await this.prisma.category.delete({ where: { id } });
  }

  private async ensureNameIsAvailable(
    userId: string,
    name: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.category.findFirst({
      where: { userId, name, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });

    if (existing) {
      throw new ConflictException('A category with that name already exists');
    }
  }

  private async ensureOwnership(id: string) {
    const userId = await this.currentUser.getUserId();
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return userId;
  }
}
