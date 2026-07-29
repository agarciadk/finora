import { Module } from '@nestjs/common';
import { CurrentUserModule } from '../common/current-user/current-user.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [CurrentUserModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
