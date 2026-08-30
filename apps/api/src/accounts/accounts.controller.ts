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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated user's accounts" })
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Get a single account plus its 30-day average balance and, for interest-bearing accounts, the projected next net interest payment and payment date',
  })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Post()
  @AuditLog('ACCOUNT')
  @ApiOperation({
    summary:
      'Create an account, optionally marking it as interest-bearing (interestRate/taxRate/interestPaymentDay)',
  })
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Patch(':id')
  @AuditLog('ACCOUNT')
  @ApiOperation({ summary: 'Update an account' })
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(id, dto);
  }

  @Delete(':id')
  @AuditLog('ACCOUNT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an account' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
