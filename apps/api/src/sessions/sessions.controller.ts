import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly currentUser: CurrentUserService,
  ) {}

  @Get()
  async findAll() {
    const userId = await this.currentUser.getUserId();
    const sessionId = await this.currentUser.getSessionId();

    return this.sessionsService.findAllForUser(userId, sessionId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('id') id: string) {
    const userId = await this.currentUser.getUserId();
    await this.sessionsService.revoke(userId, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllExceptCurrent() {
    const userId = await this.currentUser.getUserId();
    const sessionId = await this.currentUser.getSessionId();

    await this.sessionsService.revokeAllExceptCurrent(userId, sessionId);
  }
}
