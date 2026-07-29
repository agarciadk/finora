import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  @Get()
  findAll() {
    return this.notificationPreferencesService.findAll();
  }

  @Patch(':type')
  update(
    @Param('type') type: string,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationPreferencesService.update(type, dto);
  }
}
