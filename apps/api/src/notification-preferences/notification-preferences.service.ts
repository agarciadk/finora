import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationPreferenceType } from '../generated/prisma/enums';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  async update(type: string, dto: UpdateNotificationPreferenceDto) {
    if (
      !Object.values(NotificationPreferenceType).includes(
        type as NotificationPreferenceType,
      )
    ) {
      throw new BadRequestException('Invalid notification preference type');
    }

    const userId = await this.currentUser.getUserId();

    return this.prisma.notificationPreference.upsert({
      where: {
        userId_type: {
          userId,
          type: type as NotificationPreferenceType,
        },
      },
      update: { enabled: dto.enabled },
      create: {
        userId,
        type: type as NotificationPreferenceType,
        enabled: dto.enabled,
      },
    });
  }
}
