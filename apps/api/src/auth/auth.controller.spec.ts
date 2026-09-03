import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService, IssuedSession } from './auth.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './cookie.util';
import type { AuthenticatedRequest } from './auth.types';
import { AuditLogService } from '../audit-log/audit-log.service';

function createMockResponse() {
  const cookie = jest.fn();
  const clearCookie = jest.fn();
  const response = { cookie, clearCookie } as unknown as Response;

  return { response, cookie, clearCookie };
}

const session: IssuedSession = {
  accessToken: 'access-token',
  accessTokenExpiresAt: new Date('2026-08-30T12:05:00.000Z'),
  refreshToken: 'refresh-token',
  rememberMe: false,
  user: { id: 'user-1', email: 'ada@example.com', name: 'Ada Lovelace' },
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: {
    register: jest.Mock;
    verifyEmail: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
    login: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
  };
  let auditLogService: { record: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };
    auditLogService = { record: jest.fn().mockResolvedValue(undefined) };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('delegates to the auth service without setting any cookie', async () => {
      const dto = {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'supersecret',
      };
      const result = { message: 'Check your email to verify your account' };
      authService.register.mockResolvedValue(result);

      await expect(authController.register(dto)).resolves.toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifyEmail', () => {
    it('delegates to the auth service', async () => {
      const result = { message: 'Email verified successfully' };
      authService.verifyEmail.mockResolvedValue(result);

      await expect(
        authController.verifyEmail({ token: 'raw-token' }),
      ).resolves.toEqual(result);
      expect(authService.verifyEmail).toHaveBeenCalledWith({
        token: 'raw-token',
      });
    });
  });

  describe('forgotPassword', () => {
    it('delegates to the auth service', async () => {
      const result = { message: 'generic message' };
      authService.forgotPassword.mockResolvedValue(result);

      await expect(
        authController.forgotPassword({ email: 'ada@example.com' }),
      ).resolves.toEqual(result);
      expect(authService.forgotPassword).toHaveBeenCalledWith({
        email: 'ada@example.com',
      });
    });
  });

  describe('resetPassword', () => {
    it('delegates to the auth service', async () => {
      const result = { message: 'Password reset successfully' };
      authService.resetPassword.mockResolvedValue(result);
      const dto = { token: 'raw-token', password: 'newsupersecret' };

      await expect(authController.resetPassword(dto)).resolves.toEqual(result);
      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('delegates to the auth service, sets cookies and records an audit log', async () => {
      const dto = { email: 'ada@example.com', password: 'supersecret' };
      authService.login.mockResolvedValue(session);
      const { response } = createMockResponse();
      const request = {
        ip: '203.0.113.5',
        headers: { 'user-agent': 'Mozilla/5.0' },
      } as unknown as AuthenticatedRequest;

      await expect(
        authController.login(dto, request, response),
      ).resolves.toEqual({
        ...session.user,
        expiresAt: session.accessTokenExpiresAt.toISOString(),
      });
      expect(authService.login).toHaveBeenCalledWith(
        dto,
        '203.0.113.5',
        'Mozilla/5.0',
      );
      expect(auditLogService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: session.user.id,
          entityName: 'AUTH',
          ipAddress: '203.0.113.5',
        }),
      );
    });
  });

  describe('refresh', () => {
    it('reads the refresh cookie and issues a new session', async () => {
      authService.refresh.mockResolvedValue(session);
      const { response } = createMockResponse();
      const request = {
        cookies: { [REFRESH_TOKEN_COOKIE]: 'raw-refresh-token' },
      } as unknown as AuthenticatedRequest;

      await expect(authController.refresh(request, response)).resolves.toEqual({
        ...session.user,
        expiresAt: session.accessTokenExpiresAt.toISOString(),
      });
      expect(authService.refresh).toHaveBeenCalledWith('raw-refresh-token');
    });
  });

  describe('logout', () => {
    it('revokes the session and clears the cookies', async () => {
      const { response, clearCookie } = createMockResponse();
      const request = {
        cookies: { [REFRESH_TOKEN_COOKIE]: 'raw-refresh-token' },
      } as unknown as AuthenticatedRequest;

      await authController.logout(request, response);

      expect(authService.logout).toHaveBeenCalledWith('raw-refresh-token');
      expect(clearCookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        expect.any(Object),
      );
      expect(clearCookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        expect.any(Object),
      );
    });
  });
});
