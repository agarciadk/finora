import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, Session } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from './cookie.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import type { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.register(dto);
    this.setSessionCookies(response, session);
    return session.user;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(dto);
    this.setSessionCookies(response, session);
    return session.user;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.refresh(
      this.getCookie(request, REFRESH_TOKEN_COOKIE),
    );
    this.setSessionCookies(response, session);
    return session.user;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(
      this.getCookie(request, REFRESH_TOKEN_COOKIE),
    );
    this.clearSessionCookies(response);
  }

  private getCookie(
    request: AuthenticatedRequest,
    name: string,
  ): string | undefined {
    const value: unknown = request.cookies?.[name];
    return typeof value === 'string' ? value : undefined;
  }

  private setSessionCookies(response: Response, session: Session) {
    response.cookie(
      ACCESS_TOKEN_COOKIE,
      session.accessToken,
      accessTokenCookieOptions(),
    );
    response.cookie(
      REFRESH_TOKEN_COOKIE,
      session.refreshToken,
      refreshTokenCookieOptions(session.rememberMe),
    );
  }

  private clearSessionCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions());
    response.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions(true));
  }
}
