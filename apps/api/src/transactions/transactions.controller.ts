import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: FindTransactionsQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Post()
  @AuditLog('TRANSACTION')
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Patch(':id/category')
  @AuditLog('TRANSACTION')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionCategoryDto,
  ) {
    return this.transactionsService.updateCategory(id, dto);
  }

  @Patch(':id')
  @AuditLog('TRANSACTION')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Delete(':id')
  @AuditLog('TRANSACTION')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
