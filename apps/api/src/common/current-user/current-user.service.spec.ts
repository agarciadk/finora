import { UnauthorizedException } from '@nestjs/common';
import { CurrentUserService } from './current-user.service';
import type { AuthenticatedRequest } from '../../auth/auth.types';

describe('CurrentUserService', () => {
  it('returns the authenticated user id', async () => {
    const request = {
      user: { id: 'user-1', email: 'ada@example.com' },
    } as unknown as AuthenticatedRequest;
    const service = new CurrentUserService(request);

    await expect(service.getUserId()).resolves.toBe('user-1');
  });

  it('throws when the request has no authenticated user', async () => {
    const request = {} as unknown as AuthenticatedRequest;
    const service = new CurrentUserService(request);

    await expect(service.getUserId()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("derives the access token's expiry from the JWT exp claim", async () => {
    const exp = Math.floor(Date.now() / 1000) + 300;
    const request = {
      user: { id: 'user-1', email: 'ada@example.com', exp },
    } as unknown as AuthenticatedRequest;
    const service = new CurrentUserService(request);

    await expect(service.getAccessTokenExpiresAt()).resolves.toEqual(
      new Date(exp * 1000),
    );
  });
});
