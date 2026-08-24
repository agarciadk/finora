import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
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
}
