import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

type MockUser = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
};

type MockRefreshToken = {
  id: string;
  userId: string;
  tokenHash: string;
  rememberMe: boolean;
  expiresAt: Date;
  revokedAt: Date | null;
};

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: {
    user: {
      findUnique: jest.Mock<Promise<MockUser | null>, [unknown]>;
      findUniqueOrThrow: jest.Mock<Promise<MockUser>, [unknown]>;
      create: jest.Mock<Promise<MockUser>, [unknown]>;
    };
    refreshToken: {
      create: jest.Mock<Promise<MockRefreshToken>, [unknown]>;
      findUnique: jest.Mock<Promise<MockRefreshToken | null>, [unknown]>;
      update: jest.Mock<Promise<MockRefreshToken>, [unknown]>;
      updateMany: jest.Mock<Promise<{ count: number }>, [unknown]>;
    };
  };

  beforeAll(() => {
    process.env['REFRESH_TOKEN_HASH_SECRET'] = 'test-refresh-secret';
  });

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn<Promise<MockUser | null>, [unknown]>(),
        findUniqueOrThrow: jest.fn<Promise<MockUser>, [unknown]>(),
        create: jest.fn<Promise<MockUser>, [unknown]>(),
      },
      refreshToken: {
        create: jest.fn<Promise<MockRefreshToken>, [unknown]>(),
        findUnique: jest.fn<Promise<MockRefreshToken | null>, [unknown]>(),
        update: jest.fn<Promise<MockRefreshToken>, [unknown]>(),
        updateMany: jest.fn<Promise<{ count: number }>, [unknown]>(),
      },
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed.jwt') },
        },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates the user and issues a session', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'irrelevant',
      });
      prismaService.refreshToken.create.mockResolvedValue(
        {} as MockRefreshToken,
      );

      const session = await authService.register({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'supersecret',
      });

      expect(session.accessToken).toBe('signed.jwt');
      expect(session.refreshToken).toHaveLength(128);
      expect(session.rememberMe).toBe(false);
      expect(session.user).toEqual({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
      });
    });

    it('throws a conflict when the email is already registered', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'existing',
        email: 'ada@example.com',
        name: null,
        passwordHash: 'hash',
      });

      await expect(
        authService.register({
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'supersecret',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('issues a session when the password matches', async () => {
      const passwordHash = await bcrypt.hash('supersecret', 4);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash,
      });
      prismaService.refreshToken.create.mockResolvedValue(
        {} as MockRefreshToken,
      );

      const session = await authService.login({
        email: 'ada@example.com',
        password: 'supersecret',
        rememberMe: true,
      });

      expect(session.rememberMe).toBe(true);
      expect(session.user.id).toBe('user-1');
    });

    it('rejects an unknown email', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nope@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('supersecret', 4);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash,
      });

      await expect(
        authService.login({ email: 'ada@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rotates a valid refresh token and issues a new session', async () => {
      const existing: MockRefreshToken = {
        id: 'token-1',
        userId: 'user-1',
        tokenHash: 'hash',
        rememberMe: true,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(existing);
      prismaService.refreshToken.update.mockResolvedValue(existing);
      prismaService.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'irrelevant',
      });
      prismaService.refreshToken.create.mockResolvedValue(existing);

      const session = await authService.refresh('raw-token');

      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-1' },
        data: { revokedAt: expect.any(Date) as Date },
      });
      expect(session.rememberMe).toBe(true);
      expect(session.user.id).toBe('user-1');
    });

    it('throws when no token is provided', async () => {
      await expect(authService.refresh(undefined)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws when the token is unknown', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refresh('raw-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('revokes every session for the user on refresh token reuse', async () => {
      const reused: MockRefreshToken = {
        id: 'token-1',
        userId: 'user-1',
        tokenHash: 'hash',
        rememberMe: false,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(reused);

      await expect(authService.refresh('raw-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
    });
  });

  describe('logout', () => {
    it('revokes the matching refresh token', async () => {
      await authService.logout('raw-token');

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: expect.any(String) as string, revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
    });

    it('does nothing when no token is provided', async () => {
      await authService.logout(undefined);

      expect(prismaService.refreshToken.updateMany).not.toHaveBeenCalled();
    });
  });
});
