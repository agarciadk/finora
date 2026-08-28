import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ACCESS_TOKEN_COOKIE } from './auth/cookie.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Needed for `request.ip`/the audit log to see the real client IP instead
  // of the reverse proxy's (Render sits in front of this API in production).
  app.set('trust proxy', 1);

  const corsOrigins = process.env['CORS_ORIGIN']?.split(',') ?? [
    'http://localhost:5173',
  ];
  const isDevelopment = process.env.NODE_ENV === 'development';

  // The SPA itself is served by Vite/Vercel, not by this API, so this CSP
  // only protects the API's own responses (error pages, docs, etc.).
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Swagger UI's bootstrap script is inline; only relaxed in dev, where it's served.
          scriptSrc: isDevelopment ? ["'self'", "'unsafe-inline'"] : ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", ...corsOrigins],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Never exposed outside development: it would leak the full API surface
  // (routes, DTO shapes) publicly once deployed.
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Finora API')
      .setDescription(
        'REST API for Finora, a personal finance manager (accounts, transactions, budgets, analytics). ' +
          'Authentication is session-based via HttpOnly cookies (`access_token`/`refresh_token`) set by ' +
          '`POST /auth/login`; the Bearer scheme below is offered only as a convenience to try requests ' +
          'from this UI by pasting an access token manually.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearer',
      )
      .addCookieAuth(ACCESS_TOKEN_COOKIE, {
        type: 'apiKey',
        in: 'cookie',
        description: 'HttpOnly access token cookie set by POST /auth/login.',
      })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
