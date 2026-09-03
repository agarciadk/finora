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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService, IssuedSession } from './auth.service';
import { AuthConfigService } from './auth-config.service';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from './cookie.util';
import { AuthSessionResponseDto } from './dto/auth-session-response.dto';
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
    private readonly authConfig: AuthConfigService,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  @ApiOperation({
    summary: 'Register a new account',
    description:
      'Does not authenticate: the backend requires a verified email before /auth/login succeeds, so no access/refresh token is issued and there is no expiresAt to report here.',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an account using its emailed token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Throttle(PASSWORD_RESET_THROTTLE)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Request a password reset email (always returns the same generic message)',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle(PASSWORD_RESET_THROTTLE)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset the password using an emailed token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Log in and open a session (access/refresh tokens set as HttpOnly cookies)',
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
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

    return this.toSessionResponse(session);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Rotate the refresh token, slide the session and mint a new access token',
    description:
      "Also slides the underlying Session row's expiresAt. The response's expiresAt reflects the NEW access token, letting the frontend reschedule its next silent refresh without hardcoding the token lifespan.",
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.refresh(
      this.getCookie(request, REFRESH_TOKEN_COOKIE),
    );
    this.setSessionCookies(response, session);
    return this.toSessionResponse(session);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out and close the current session' })
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(
      this.getCookie(request, REFRESH_TOKEN_COOKIE),
    );
    this.clearSessionCookies(response);
  }

  private toSessionResponse(session: IssuedSession): AuthSessionResponseDto {
    return {
      ...session.user,
      expiresAt: session.accessTokenExpiresAt.toISOString(),
    };
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
      accessTokenCookieOptions(this.authConfig.accessTokenTtlMs),
    );
    response.cookie(
      REFRESH_TOKEN_COOKIE,
      session.refreshToken,
      refreshTokenCookieOptions(
        session.rememberMe,
        this.authConfig.refreshTokenTtlMs,
      ),
    );
  }

  private clearSessionCookies(response: Response) {
    response.clearCookie(
      ACCESS_TOKEN_COOKIE,
      accessTokenCookieOptions(this.authConfig.accessTokenTtlMs),
    );
    response.clearCookie(
      REFRESH_TOKEN_COOKIE,
      refreshTokenCookieOptions(true, this.authConfig.refreshTokenTtlMs),
    );
  }
}
