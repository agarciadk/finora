import { Module } from '@nestjs/common';
import { CurrentUserModule } from '../common/current-user/current-user.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [CurrentUserModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
