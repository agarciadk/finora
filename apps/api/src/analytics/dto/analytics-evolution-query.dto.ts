import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const MAX_EVOLUTION_MONTHS = 12;
export const DEFAULT_EVOLUTION_MONTHS = 6;

export class AnalyticsEvolutionQueryDto {
  @ApiPropertyOptional({
    description:
      'How many months of history to return, ending in the current month',
    default: DEFAULT_EVOLUTION_MONTHS,
    minimum: 1,
    maximum: MAX_EVOLUTION_MONTHS,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_EVOLUTION_MONTHS)
  months: number = DEFAULT_EVOLUTION_MONTHS;
}
