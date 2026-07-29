import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService, Session } from './auth.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './cookie.util';
import type { AuthenticatedRequest } from './auth.types';

function createMockResponse() {
  const cookie = jest.fn();
  const clearCookie = jest.fn();
  const response = { cookie, clearCookie } as unknown as Response;

  return { response, cookie, clearCookie };
}

const session: Session = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  rememberMe: false,
  user: { id: 'user-1', email: 'ada@example.com', name: 'Ada Lovelace' },
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('creates the session and sets the auth cookies', async () => {
      const dto = {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'supersecret',
      };
      authService.register.mockResolvedValue(session);
      const { response, cookie } = createMockResponse();

      await expect(authController.register(dto, response)).resolves.toEqual(
        session.user,
      );
      expect(cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        'access-token',
        expect.objectContaining({ httpOnly: true, secure: true }),
      );
      expect(cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        'refresh-token',
        expect.objectContaining({ httpOnly: true, secure: true }),
      );
    });
  });

  describe('login', () => {
    it('delegates to the auth service and sets cookies', async () => {
      const dto = { email: 'ada@example.com', password: 'supersecret' };
      authService.login.mockResolvedValue(session);
      const { response } = createMockResponse();

      await expect(authController.login(dto, response)).resolves.toEqual(
        session.user,
      );
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('reads the refresh cookie and issues a new session', async () => {
      authService.refresh.mockResolvedValue(session);
      const { response } = createMockResponse();
      const request = {
        cookies: { [REFRESH_TOKEN_COOKIE]: 'raw-refresh-token' },
      } as unknown as AuthenticatedRequest;

      await expect(authController.refresh(request, response)).resolves.toEqual(
        session.user,
      );
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
