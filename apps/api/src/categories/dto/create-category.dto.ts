import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { TransactionType } from '../../generated/prisma/enums';
import { SanitizeHtml } from '../../common/sanitize-html.decorator';

export class CreateCategoryDto {
  @SanitizeHtml()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(Object.values(TransactionType))
  type!: TransactionType;
}
