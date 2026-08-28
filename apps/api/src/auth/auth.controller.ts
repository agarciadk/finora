import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService, IssuedSession } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from './cookie.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './public.decorator';
import type { AuthenticatedRequest } from './auth.types';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../generated/prisma/client';
import { getClientIp } from '../audit-log/get-client-ip.util';

// Stricter than the global default to slow down brute-force/credential-stuffing attempts.
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };
// Even stricter: these endpoints send an email and accept a token, both
// prime targets for abuse (spam and token brute-forcing).
const PASSWORD_RESET_THROTTLE = { default: { limit: 3, ttl: 60_000 } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Throttle(PASSWORD_RESET_THROTTLE)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle(PASSWORD_RESET_THROTTLE)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ipAddress = getClientIp(request);
    const session = await this.authService.login(
      dto,
      ipAddress,
      request.headers['user-agent'],
    );
    this.setSessionCookies(response, session);

    await this.auditLogService.record({
      userId: session.user.id,
      action: AuditAction.LOGIN,
      entityName: 'AUTH',
      ipAddress,
    });

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

  private setSessionCookies(response: Response, session: IssuedSession) {
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
