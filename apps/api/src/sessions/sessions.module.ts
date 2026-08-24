import { Module } from '@nestjs/common';
import { CurrentUserModule } from '../common/current-user/current-user.module';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [CurrentUserModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
