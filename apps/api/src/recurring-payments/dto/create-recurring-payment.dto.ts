import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RecurringFrequency,
  TransactionType,
} from '../../generated/prisma/enums';
import { SanitizeHtml } from '../../common/sanitize-html.decorator';

export class CreateRecurringPaymentDto {
  @ApiProperty({ description: 'Id of the account the payment is drawn from' })
  @IsUUID()
  accountId!: string;

  @ApiProperty({ description: 'Id of the category to tag the payment with' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: 'Display name, e.g. "Netflix" or "Nómina"' })
  @SanitizeHtml()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Amount charged/received on every occurrence' })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: TransactionType })
  @IsIn(Object.values(TransactionType))
  type!: TransactionType;

  @ApiProperty({ enum: RecurringFrequency })
  @IsIn(Object.values(RecurringFrequency))
  frequency!: RecurringFrequency;

  @ApiProperty({
    description:
      'Date of the first occurrence. Its day-of-month (and month, for yearly payments) is used as the anchor for every future occurrence.',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Whether the payment is active on creation. Defaults to true.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
