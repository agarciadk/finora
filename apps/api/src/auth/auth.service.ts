import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../common/default-user-data';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_MS } from './cookie.util';
import { generateRawToken, hashToken, isTestEnv } from './token.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const PASSWORD_SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
// Always the same regardless of whether the email exists, to avoid leaking
// which addresses are registered (user enumeration).
const FORGOT_PASSWORD_GENERIC_MESSAGE =
  'If that email is registered, we just sent a password reset link to it.';

export type IssuedSession = {
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
  user: { id: string; email: string; name: string | null };
};

export type RegisterResult = {
  message: string;
  // Only present when NODE_ENV=test, so Playwright can verify the email
  // without a real mailbox. Never populated outside of tests.
  verificationToken?: string;
};

export type ForgotPasswordResult = {
  message: string;
  resetToken?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('That email is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const rawVerificationToken = generateRawToken();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        verificationToken: hashToken(rawVerificationToken),
        categories: { create: DEFAULT_CATEGORIES },
        notificationPreferences: { create: DEFAULT_NOTIFICATION_PREFERENCES },
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      rawVerificationToken,
    );

    return {
      message: 'Check your email to verify your account before logging in.',
      ...(isTestEnv() ? { verificationToken: rawVerificationToken } : {}),
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: hashToken(dto.token) },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return { message: 'Email verified successfully' };
  }

  async login(
    dto: LoginDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<IssuedSession> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordMatches = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException('EMAIL_NOT_VERIFIED');
    }

    const rememberMe = dto.rememberMe ?? false;
    const { sessionId, rawRefreshToken } = await this.createSession(
      user.id,
      ipAddress,
      userAgent,
      rememberMe,
    );
    const accessToken = await this.signAccessToken(
      user.id,
      user.email,
      sessionId,
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      rememberMe,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: FORGOT_PASSWORD_GENERIC_MESSAGE };
    }

    const rawResetToken = generateRawToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashToken(rawResetToken),
        resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, rawResetToken);

    return {
      message: FORGOT_PASSWORD_GENERIC_MESSAGE,
      ...(isTestEnv() ? { resetToken: rawResetToken } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { resetPasswordToken: hashToken(dto.token) },
    });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // A changed password invalidates every existing session, same as a
    // detected refresh-token theft does (deleting the Session cascades to
    // its RefreshToken rows).
    await this.prisma.session.deleteMany({ where: { userId: user.id } });

    return { message: 'Password reset successfully' };
  }

  async refresh(rawToken: string | undefined): Promise<IssuedSession> {
    if (!rawToken) {
      throw new UnauthorizedException();
    }

    const tokenHash = hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!existing) {
      throw new UnauthorizedException();
    }

    if (existing.revokedAt || existing.expiresAt < new Date()) {
      // A rotated-away (or expired) refresh token was reused: treat this as
      // a possible theft and kill every active session for that user
      // (deleting the Sessions cascades to all of their RefreshToken rows).
      await this.prisma.session.deleteMany({
        where: { userId: existing.userId },
      });
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: existing.userId },
    });

    const rawRefreshToken = await this.rotateSession(
      existing.sessionId,
      user.id,
      existing.rememberMe,
    );
    const accessToken = await this.signAccessToken(
      user.id,
      user.email,
      existing.sessionId,
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      rememberMe: existing.rememberMe,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) {
      return;
    }

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });

    if (!existing) {
      return;
    }

    // Cascades to every RefreshToken row (current + rotation history) tied
    // to this session.
    await this.prisma.session.deleteMany({ where: { id: existing.sessionId } });
  }

  private async signAccessToken(
    userId: string,
    email: string,
    sessionId: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email, sessionId },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
  }

  // Creates the stable Session row (one per logged-in device/browser) plus
  // its first RefreshToken. Used only at login.
  private async createSession(
    userId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    rememberMe: boolean,
  ): Promise<{ sessionId: string; rawRefreshToken: string }> {
    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: tokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    await this.prisma.refreshToken.create({
      data: { userId, sessionId: session.id, tokenHash, rememberMe, expiresAt },
    });

    return { sessionId: session.id, rawRefreshToken };
  }

  // Rotates the refresh token of an EXISTING session: new RefreshToken row
  // (the old one was already marked revoked by the caller) and the Session's
  // refreshTokenHash/lastActive/expiresAt are refreshed to match it.
  private async rotateSession(
    sessionId: string,
    userId: string,
    rememberMe: boolean,
  ): Promise<string> {
    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.prisma.refreshToken.create({
      data: { userId, sessionId, tokenHash, rememberMe, expiresAt },
    });

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { refreshTokenHash: tokenHash, lastActive: new Date(), expiresAt },
    });

    return rawRefreshToken;
  }
}
