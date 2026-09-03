import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseDurationToMs } from './duration.util';

const DEFAULT_ACCESS_TOKEN_EXPIRATION = '5m';
const DEFAULT_REFRESH_TOKEN_EXPIRATION = '7d';

// Single source of truth for the JWT/session lifespans, driven by
// JWT_ACCESS_EXPIRATION/JWT_REFRESH_EXPIRATION so they can be tuned per
// environment (e.g. shortened for manual/e2e testing) without touching code.
@Injectable()
export class AuthConfigService {
  /** Raw duration string (e.g. "5m") - kept for logging/Swagger docs. */
  readonly accessTokenExpiresIn: string;
  /** Same value in milliseconds, for the access token cookie's maxAge. */
  readonly accessTokenTtlMs: number;
  // jsonwebtoken's `expiresIn` only type-accepts a plain number of seconds or
  // its own branded `ms`-style string literal union, not an arbitrary
  // `string` - so JwtService.signAsync uses this instead of the raw string.
  readonly accessTokenTtlSeconds: number;
  /** Raw duration string (e.g. "7d") - documents the refresh token's lifespan. */
  readonly refreshTokenExpiresIn: string;
  /** Same value in milliseconds, for the refresh token row/cookie maxAge. */
  readonly refreshTokenTtlMs: number;

  constructor(configService: ConfigService) {
    this.accessTokenExpiresIn = configService.get<string>(
      'JWT_ACCESS_EXPIRATION',
      DEFAULT_ACCESS_TOKEN_EXPIRATION,
    );
    this.refreshTokenExpiresIn = configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      DEFAULT_REFRESH_TOKEN_EXPIRATION,
    );
    this.accessTokenTtlMs = parseDurationToMs(this.accessTokenExpiresIn);
    this.accessTokenTtlSeconds = Math.floor(this.accessTokenTtlMs / 1000);
    this.refreshTokenTtlMs = parseDurationToMs(this.refreshTokenExpiresIn);
  }
}
