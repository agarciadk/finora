import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { SanitizeHtml } from '../../common/sanitize-html.decorator';

export class RegisterDto {
  @SanitizeHtml()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;
}
