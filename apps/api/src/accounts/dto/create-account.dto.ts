import {
  IsIBAN,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    description:
      "IBAN of the account, used by the Smart Assistant to recognize transfers between the user's own accounts",
    example: 'ES9121000418450200051332',
  })
  @IsOptional()
  @IsIBAN()
  iban?: string;

  @ApiPropertyOptional({
    description:
      'Annual percentage yield (TAE) for interest-bearing accounts, e.g. 3.5 for 3.5%',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @ApiPropertyOptional({
    description:
      'Tax rate applied to the earned interest, e.g. 19 for 19% (Spanish savings tax)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Day of the month (1-31) the interest is paid',
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  interestPaymentDay?: number;
}
