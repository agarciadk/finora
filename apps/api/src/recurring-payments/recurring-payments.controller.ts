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
import { RecurringPaymentsService } from './recurring-payments.service';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { UpdateRecurringPaymentDto } from './dto/update-recurring-payment.dto';
import { ExecuteRecurringPaymentDto } from './dto/execute-recurring-payment.dto';
import { AuditLog } from '../audit-log/audit-log.decorator';

@ApiTags('Recurring Payments')
@Controller('recurring-payments')
export class RecurringPaymentsController {
  constructor(
    private readonly recurringPaymentsService: RecurringPaymentsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      "List the authenticated user's recurring payments/subscriptions, ordered by next payment date",
  })
  findAll() {
    return this.recurringPaymentsService.findAll();
  }

  @Post()
  @AuditLog('RECURRING_PAYMENT')
  @ApiOperation({ summary: 'Create a recurring payment/subscription' })
  create(@Body() dto: CreateRecurringPaymentDto) {
    return this.recurringPaymentsService.create(dto);
  }

  @Patch(':id')
  @AuditLog('RECURRING_PAYMENT')
  @ApiOperation({
    summary: 'Update a recurring payment (including pausing/resuming it)',
  })
  update(@Param('id') id: string, @Body() dto: UpdateRecurringPaymentDto) {
    return this.recurringPaymentsService.update(id, dto);
  }

  @Delete(':id')
  @AuditLog('RECURRING_PAYMENT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a recurring payment' })
  remove(@Param('id') id: string) {
    return this.recurringPaymentsService.remove(id);
  }

  @Post(':id/execute')
  @AuditLog('RECURRING_PAYMENT')
  @ApiOperation({
    summary:
      'Mark a recurring payment as paid: creates the corresponding transaction and advances its next payment date, atomically',
  })
  execute(@Param('id') id: string, @Body() dto: ExecuteRecurringPaymentDto) {
    return this.recurringPaymentsService.execute(id, dto);
  }
}
