import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { SanitizeHtml } from '../../common/sanitize-html.decorator';

export class UpdateUserDto {
  @SanitizeHtml()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @SanitizeHtml()
  @IsOptional()
  @IsString()
  @MinLength(1)
  mainIncomeSource?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  payday?: number;
}
