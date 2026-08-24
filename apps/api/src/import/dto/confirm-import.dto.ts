import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

// Signed decimal string with exactly 2 decimals, e.g. "-25.50" or "1234.56".
// Kept as a string end-to-end (never a float) to avoid rounding issues.
const AMOUNT_PATTERN = /^-?\d+\.\d{2}$/;

export class ImportTransactionInputDto {
  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Matches(AMOUNT_PATTERN, {
    message: 'amount must be a signed decimal string with 2 decimals',
  })
  amount!: string;

  @IsOptional()
  @Matches(AMOUNT_PATTERN, {
    message: 'balance must be a signed decimal string with 2 decimals',
  })
  balance?: string;

  @IsUUID()
  categoryId!: string;
}

export class ConfirmImportDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5000)
  @ValidateNested({ each: true })
  @Type(() => ImportTransactionInputDto)
  transactions!: ImportTransactionInputDto[];
}
