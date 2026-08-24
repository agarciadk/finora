import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const MAX_AUDIT_LOGS_LIMIT = 50;
const DEFAULT_AUDIT_LOGS_LIMIT = 20;

export class FindAuditLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_AUDIT_LOGS_LIMIT)
  limit: number = DEFAULT_AUDIT_LOGS_LIMIT;
}
