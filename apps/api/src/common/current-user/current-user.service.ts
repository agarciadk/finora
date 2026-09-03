import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { AuthenticatedRequest } from '../../auth/auth.types';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserService {
  constructor(
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  // Stays `async` (no `await` needed) so callers get a rejected promise
  // instead of a synchronous throw.
  // eslint-disable-next-line @typescript-eslint/require-await
  async getUserId(): Promise<string> {
    if (!this.request.user) {
      throw new UnauthorizedException();
    }

    return this.request.user.id;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getSessionId(): Promise<string> {
    if (!this.request.user) {
      throw new UnauthorizedException();
    }

    return this.request.user.sessionId;
  }

  // Read from the JWT's own `exp` claim (set by JwtAuthGuard), not a
  // separately hardcoded TTL, so it can never drift from what actually
  // governs the cookie's validity.
  // eslint-disable-next-line @typescript-eslint/require-await
  async getAccessTokenExpiresAt(): Promise<Date> {
    if (!this.request.user) {
      throw new UnauthorizedException();
    }

    return new Date(this.request.user.exp * 1000);
  }
}
