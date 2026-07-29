import { Module } from '@nestjs/common';
import { CurrentUserModule } from '../common/current-user/current-user.module';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferencesService } from './notification-preferences.service';

@Module({
  imports: [CurrentUserModule],
  controllers: [NotificationPreferencesController],
  providers: [NotificationPreferencesService],
})
export class NotificationPreferencesModule {}
