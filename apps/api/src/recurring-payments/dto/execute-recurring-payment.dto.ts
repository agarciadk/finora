import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ExecuteRecurringPaymentDto {
  @ApiPropertyOptional({
    description:
      'Date to record the generated transaction with. Defaults to the current date.',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
