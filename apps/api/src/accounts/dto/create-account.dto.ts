import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountType } from '../../generated/prisma/enums';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  bank!: string;

  @IsIn(Object.values(AccountType))
  type!: AccountType;

  @IsNumber()
  balance!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;
}
