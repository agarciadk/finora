import { Module } from '@nestjs/common';
import { CurrentUserModule } from '../common/current-user/current-user.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [CurrentUserModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
