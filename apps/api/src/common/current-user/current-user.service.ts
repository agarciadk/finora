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
}
