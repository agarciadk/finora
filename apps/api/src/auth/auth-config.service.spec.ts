import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from './auth-config.service';

describe('AuthConfigService', () => {
  it('falls back to 5m/7d when the env vars are unset', () => {
    const configService = {
      get: (_key: string, fallback: string) => fallback,
    } as unknown as ConfigService;
    const service = new AuthConfigService(configService);

    expect(service.accessTokenExpiresIn).toBe('5m');
    expect(service.accessTokenTtlMs).toBe(5 * 60 * 1000);
    expect(service.accessTokenTtlSeconds).toBe(5 * 60);
    expect(service.refreshTokenExpiresIn).toBe('7d');
    expect(service.refreshTokenTtlMs).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('reads and parses JWT_ACCESS_EXPIRATION/JWT_REFRESH_EXPIRATION when set', () => {
    const values: Record<string, string> = {
      JWT_ACCESS_EXPIRATION: '30s',
      JWT_REFRESH_EXPIRATION: '1h',
    };
    const configService = {
      get: (key: string, fallback: string) => values[key] ?? fallback,
    } as unknown as ConfigService;
    const service = new AuthConfigService(configService);

    expect(service.accessTokenExpiresIn).toBe('30s');
    expect(service.accessTokenTtlMs).toBe(30 * 1000);
    expect(service.accessTokenTtlSeconds).toBe(30);
    expect(service.refreshTokenExpiresIn).toBe('1h');
    expect(service.refreshTokenTtlMs).toBe(60 * 60 * 1000);
  });
});
