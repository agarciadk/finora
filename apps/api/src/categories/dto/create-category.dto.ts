import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { TransactionType } from '../../generated/prisma/enums';
import { SanitizeHtml } from '../../common/sanitize-html.decorator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentación' })
  @SanitizeHtml()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: TransactionType })
  @IsIn(Object.values(TransactionType))
  type!: TransactionType;
}
