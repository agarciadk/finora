import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { TransactionType } from '../../generated/prisma/enums';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(Object.values(TransactionType))
  type!: TransactionType;
}
