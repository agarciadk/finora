import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { RecurringPaymentsModule } from './recurring-payments/recurring-payments.module';
import { UsersModule } from './users/users.module';
import { NotificationPreferencesModule } from './notification-preferences/notification-preferences.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { ImportModule } from './import/import.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      // Disabled in tests (Jest sets NODE_ENV=test automatically) so
      // unit/e2e suites aren't rate-limited by repeated login/register calls.
      skipIf: () => process.env.NODE_ENV === 'test',
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    HealthModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    RecurringPaymentsModule,
    UsersModule,
    NotificationPreferencesModule,
    AnalyticsModule,
    AuthModule,
    ImportModule,
    AuditLogModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
