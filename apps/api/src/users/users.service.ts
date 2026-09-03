import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async me() {
    const userId = await this.currentUser.getUserId();
    const expiresAt = await this.currentUser.getAccessTokenExpiresAt();

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        mainIncomeSource: true,
        payday: true,
        mainIncomeAmount: true,
      },
    });

    // Lets the frontend schedule its own silent refresh without hardcoding
    // the backend's access token lifespan (see CurrentUserService).
    return { ...user, expiresAt: expiresAt.toISOString() };
  }

  async updateMe(dto: UpdateUserDto) {
    const userId = await this.currentUser.getUserId();

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          mainIncomeSource: true,
          payday: true,
          mainIncomeAmount: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('That email is already in use');
      }

      throw error;
    }
  }
}
