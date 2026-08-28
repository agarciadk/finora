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
import { BulkUpdateTransactionsCategoryDto } from './dto/bulk-update-transactions-category.dto';
import { BulkUpdateTransactionsAccountDto } from './dto/bulk-update-transactions-account.dto';
import { BulkDeleteTransactionsDto } from './dto/bulk-delete-transactions.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List the authenticated user transactions, with date/search/account filtering and pagination',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Case-insensitive search within the description',
  })
  @ApiQuery({
    name: 'accountIds',
    required: false,
    type: [String],
    description: 'Filter by one or more account ids',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: FindTransactionsQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Post()
  @AuditLog('TRANSACTION')
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Patch('bulk/category')
  @AuditLog('TRANSACTION')
  @ApiOperation({
    summary: 'Bulk-reassign the category of multiple transactions',
  })
  bulkUpdateCategory(@Body() dto: BulkUpdateTransactionsCategoryDto) {
    return this.transactionsService.bulkUpdateCategory(dto);
  }

  @Patch('bulk/account')
  @AuditLog('TRANSACTION')
  @ApiOperation({
    summary: 'Bulk-reassign the account of multiple transactions',
  })
  bulkUpdateAccount(@Body() dto: BulkUpdateTransactionsAccountDto) {
    return this.transactionsService.bulkUpdateAccount(dto);
  }

  @Delete('bulk')
  @AuditLog('TRANSACTION')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete multiple transactions at once' })
  bulkRemove(@Body() dto: BulkDeleteTransactionsDto) {
    return this.transactionsService.bulkRemove(dto);
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
