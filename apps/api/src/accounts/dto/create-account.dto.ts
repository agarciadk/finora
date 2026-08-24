import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountType } from '../../generated/prisma/enums';
import { SanitizeHtml } from '../../common/sanitize-html.decorator';

export class CreateAccountDto {
  @SanitizeHtml()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @SanitizeHtml()
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
