import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, createHmac } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../common/default-user-data';
import { PrismaService } from '../prisma/prisma.service';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_MS } from './cookie.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const PASSWORD_SALT_ROUNDS = 12;

export type Session = {
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
  user: { id: string; email: string; name: string | null };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Session> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('That email is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        categories: { create: DEFAULT_CATEGORIES },
        notificationPreferences: { create: DEFAULT_NOTIFICATION_PREFERENCES },
      },
    });

    return this.issueSession(user.id, user.email, user.name, false);
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

    return this.issueSession(
      user.id,
      user.email,
      user.name,
      dto.rememberMe ?? false,
    );
  }

  async refresh(rawToken: string | undefined): Promise<Session> {
    if (!rawToken) {
      throw new UnauthorizedException();
    }

    const tokenHash = this.hashToken(rawToken);
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
      where: { tokenHash: this.hashToken(rawToken), revokedAt: null },
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
        tokenHash: this.hashToken(refreshToken),
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

  private hashToken(rawToken: string): string {
    const secret = process.env['REFRESH_TOKEN_HASH_SECRET'];

    if (!secret) {
      throw new Error('REFRESH_TOKEN_HASH_SECRET is not set');
    }

    return createHmac('sha256', secret).update(rawToken).digest('hex');
  }
}
