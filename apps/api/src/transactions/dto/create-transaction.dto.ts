import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../../generated/prisma/enums';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsIn(Object.values(TransactionType))
  type!: TransactionType;

  @IsDateString()
  date!: string;

  @IsUUID()
  accountId!: string;

  @IsUUID()
  categoryId!: string;
}
