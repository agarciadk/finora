import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../../generated/prisma/enums';
import { SanitizeHtml } from '../../common/sanitize-html.decorator';
import { CATEGORY_COLORS } from '../category-colors';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentación' })
  @SanitizeHtml()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: TransactionType })
  @IsIn(Object.values(TransactionType))
  type!: TransactionType;

  @ApiPropertyOptional({ enum: CATEGORY_COLORS })
  @IsOptional()
  @IsIn(CATEGORY_COLORS)
  color?: string;
}
