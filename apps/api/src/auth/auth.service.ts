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

export type Session = {
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

  async login(dto: LoginDto): Promise<Session> {
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

    return this.issueSession(
      user.id,
      user.email,
      user.name,
      dto.rememberMe ?? false,
    );
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
    // detected refresh-token theft does.
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password reset successfully' };
  }

  async refresh(rawToken: string | undefined): Promise<Session> {
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
      // a possible theft and kill every active session for that user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
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

    return this.issueSession(
      user.id,
      user.email,
      user.name,
      existing.rememberMe,
    );
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueSession(
    userId: string,
    email: string,
    name: string | null,
    rememberMe: boolean,
  ): Promise<Session> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );

    const refreshToken = randomBytes(64).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        rememberMe,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      rememberMe,
      user: { id: userId, email, name },
    };
  }
}
