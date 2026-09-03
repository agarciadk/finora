import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

type MockUser = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  emailVerified?: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
};

type MockRefreshToken = {
  id: string;
  userId: string;
  sessionId: string;
  tokenHash: string;
  rememberMe: boolean;
  expiresAt: Date;
  revokedAt: Date | null;
};

type MockSession = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
};

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: {
    user: {
      findUnique: jest.Mock<Promise<MockUser | null>, [unknown]>;
      findUniqueOrThrow: jest.Mock<Promise<MockUser>, [unknown]>;
      create: jest.Mock<Promise<MockUser>, [unknown]>;
      update: jest.Mock<Promise<MockUser>, [unknown]>;
    };
    refreshToken: {
      create: jest.Mock<Promise<MockRefreshToken>, [unknown]>;
      findUnique: jest.Mock<Promise<MockRefreshToken | null>, [unknown]>;
      update: jest.Mock<Promise<MockRefreshToken>, [unknown]>;
      updateMany: jest.Mock<Promise<{ count: number }>, [unknown]>;
    };
    session: {
      create: jest.Mock<Promise<MockSession>, [unknown]>;
      update: jest.Mock<Promise<MockSession>, [unknown]>;
      deleteMany: jest.Mock<Promise<{ count: number }>, [unknown]>;
    };
  };
  let mailService: {
    sendVerificationEmail: jest.Mock<Promise<void>, [string, string]>;
    sendPasswordResetEmail: jest.Mock<Promise<void>, [string, string]>;
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
        update: jest.fn<Promise<MockUser>, [unknown]>(),
      },
      refreshToken: {
        create: jest.fn<Promise<MockRefreshToken>, [unknown]>(),
        findUnique: jest.fn<Promise<MockRefreshToken | null>, [unknown]>(),
        update: jest.fn<Promise<MockRefreshToken>, [unknown]>(),
        updateMany: jest.fn<Promise<{ count: number }>, [unknown]>(),
      },
      session: {
        create: jest.fn<Promise<MockSession>, [unknown]>(),
        update: jest.fn<Promise<MockSession>, [unknown]>(),
        deleteMany: jest.fn<Promise<{ count: number }>, [unknown]>(),
      },
    };
    mailService = {
      sendVerificationEmail: jest
        .fn<Promise<void>, [string, string]>()
        .mockResolvedValue(undefined),
      sendPasswordResetEmail: jest
        .fn<Promise<void>, [string, string]>()
        .mockResolvedValue(undefined),
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed.jwt'),
            // The service reads the access token's own `exp` claim back
            // (instead of a separately hardcoded TTL) to report expiresAt.
            decode: jest
              .fn()
              .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 300 }),
          },
        },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates an unverified user and emails a verification token', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'irrelevant',
      });

      const result = await authService.register({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'supersecret',
      });

      expect(result.message).toBeDefined();
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        'ada@example.com',
        expect.any(String),
      );
      // NODE_ENV=test (set by Jest) surfaces the token so Playwright can
      // verify without a real mailbox.
      expect(result.verificationToken).toEqual(expect.any(String));
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

  describe('verifyEmail', () => {
    it('marks the user as verified and clears the token', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'irrelevant',
      });
      prismaService.user.update.mockResolvedValue({} as MockUser);

      await authService.verifyEmail({ token: 'raw-token' });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { emailVerified: true, verificationToken: null },
      });
    });

    it('throws when the token is unknown', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.verifyEmail({ token: 'bad-token' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('login', () => {
    it('issues a session when the password matches and the email is verified', async () => {
      const passwordHash = await bcrypt.hash('supersecret', 4);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash,
        emailVerified: true,
      });
      prismaService.session.create.mockResolvedValue({
        id: 'session-1',
      } as MockSession);
      prismaService.refreshToken.create.mockResolvedValue(
        {} as MockRefreshToken,
      );

      const session = await authService.login(
        {
          email: 'ada@example.com',
          password: 'supersecret',
          rememberMe: true,
        },
        '203.0.113.5',
        'Mozilla/5.0',
      );

      expect(session.rememberMe).toBe(true);
      expect(session.user.id).toBe('user-1');
      expect(session.accessTokenExpiresAt).toBeInstanceOf(Date);
    });

    it('creates a Session row capturing the IP and user agent', async () => {
      const passwordHash = await bcrypt.hash('supersecret', 4);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash,
        emailVerified: true,
      });
      prismaService.session.create.mockResolvedValue({
        id: 'session-1',
      } as MockSession);
      prismaService.refreshToken.create.mockResolvedValue(
        {} as MockRefreshToken,
      );

      await authService.login(
        { email: 'ada@example.com', password: 'supersecret' },
        '203.0.113.5',
        'Mozilla/5.0',
      );

      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          refreshTokenHash: expect.any(String) as string,
          ipAddress: '203.0.113.5',
          userAgent: 'Mozilla/5.0',
          expiresAt: expect.any(Date) as Date,
        },
      });
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          sessionId: 'session-1',
          tokenHash: expect.any(String) as string,
          rememberMe: false,
          expiresAt: expect.any(Date) as Date,
        },
      });
    });

    it('rejects an unknown email', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login(
          { email: 'nope@example.com', password: 'x' },
          undefined,
          undefined,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('supersecret', 4);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash,
        emailVerified: true,
      });

      await expect(
        authService.login(
          { email: 'ada@example.com', password: 'wrong' },
          undefined,
          undefined,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an unverified email even with the correct password', async () => {
      const passwordHash = await bcrypt.hash('supersecret', 4);
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash,
        emailVerified: false,
      });

      await expect(
        authService.login(
          { email: 'ada@example.com', password: 'supersecret' },
          undefined,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('forgotPassword', () => {
    it('stores a hashed reset token with an expiry and emails it', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'irrelevant',
      });
      prismaService.user.update.mockResolvedValue({} as MockUser);

      const result = await authService.forgotPassword({
        email: 'ada@example.com',
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          resetPasswordToken: expect.any(String) as string,
          resetPasswordExpires: expect.any(Date) as Date,
        },
      });
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'ada@example.com',
        expect.any(String),
      );
      expect(result.resetToken).toEqual(expect.any(String));
    });

    it('returns the same generic message when the email is unknown', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await authService.forgotPassword({
        email: 'nope@example.com',
      });

      expect(result.resetToken).toBeUndefined();
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('updates the password and revokes existing sessions', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'old-hash',
        resetPasswordToken: 'hashed-token',
        resetPasswordExpires: new Date(Date.now() + 60_000),
      });
      prismaService.user.update.mockResolvedValue({} as MockUser);

      await authService.resetPassword({
        token: 'raw-token',
        password: 'newsupersecret',
      });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          passwordHash: expect.any(String) as string,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('throws when the token is expired', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'old-hash',
        resetPasswordToken: 'hashed-token',
        resetPasswordExpires: new Date(Date.now() - 60_000),
      });

      await expect(
        authService.resetPassword({ token: 'raw-token', password: 'x' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('throws when the token is unknown', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.resetPassword({ token: 'raw-token', password: 'x' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('refresh', () => {
    it('rotates a valid refresh token and issues a new session', async () => {
      const existing: MockRefreshToken = {
        id: 'token-1',
        userId: 'user-1',
        sessionId: 'session-1',
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
      prismaService.session.update.mockResolvedValue({} as MockSession);

      const session = await authService.refresh('raw-token');

      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-1' },
        data: { revokedAt: expect.any(Date) as Date },
      });
      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          refreshTokenHash: expect.any(String) as string,
          lastActive: expect.any(Date) as Date,
          expiresAt: expect.any(Date) as Date,
        },
      });
      expect(session.rememberMe).toBe(true);
      expect(session.user.id).toBe('user-1');
      expect(session.accessTokenExpiresAt).toBeInstanceOf(Date);
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

    it('deletes every session for the user on refresh token reuse', async () => {
      const reused: MockRefreshToken = {
        id: 'token-1',
        userId: 'user-1',
        sessionId: 'session-1',
        tokenHash: 'hash',
        rememberMe: false,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(reused);

      await expect(authService.refresh('raw-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('logout', () => {
    it('deletes the session tied to the refresh token', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        sessionId: 'session-1',
        tokenHash: 'hash',
        rememberMe: false,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
      });

      await authService.logout('raw-token');

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
    });

    it('does nothing when no token is provided', async () => {
      await authService.logout(undefined);

      expect(prismaService.refreshToken.findUnique).not.toHaveBeenCalled();
      expect(prismaService.session.deleteMany).not.toHaveBeenCalled();
    });

    it('does nothing when the refresh token is unknown', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      await authService.logout('raw-token');

      expect(prismaService.session.deleteMany).not.toHaveBeenCalled();
    });
  });
});
