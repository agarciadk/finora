import {
  NotificationPreferenceType,
  TransactionType,
} from '../generated/prisma/enums';

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: TransactionType;
}> = [
  { name: 'Ingresos', type: TransactionType.INCOME },
  { name: 'Otros ingresos', type: TransactionType.INCOME },
  { name: 'Alimentación', type: TransactionType.EXPENSE },
  { name: 'Transporte', type: TransactionType.EXPENSE },
  { name: 'Ocio', type: TransactionType.EXPENSE },
  { name: 'Vivienda', type: TransactionType.EXPENSE },
  { name: 'Salud', type: TransactionType.EXPENSE },
  { name: 'Ahorro', type: TransactionType.EXPENSE },
];

export const DEFAULT_NOTIFICATION_PREFERENCES: Array<{
  type: NotificationPreferenceType;
  enabled: boolean;
}> = [
  { type: NotificationPreferenceType.BUDGET_ALERTS, enabled: true },
  { type: NotificationPreferenceType.WEEKLY_SUMMARY, enabled: true },
  { type: NotificationPreferenceType.PRODUCT_NEWS, enabled: false },
];
