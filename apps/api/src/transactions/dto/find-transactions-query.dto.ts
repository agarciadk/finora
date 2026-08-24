import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export const MAX_TRANSACTIONS_LIMIT = 50;
const DEFAULT_TRANSACTIONS_LIMIT = 10;

export class FindTransactionsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_TRANSACTIONS_LIMIT)
  limit: number = DEFAULT_TRANSACTIONS_LIMIT;
}
