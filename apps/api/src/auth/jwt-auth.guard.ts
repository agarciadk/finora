import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ACCESS_TOKEN_COOKIE } from './cookie.util';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AuthenticatedRequest } from './auth.types';

type AccessTokenPayload = {
  sub: string;
  email: string;
  sessionId: string;
  exp: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token: unknown = request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException();
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        sessionId: payload.sessionId,
        exp: payload.exp,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
