import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto {
  @ApiProperty({ description: 'User id' })
  id!: string;

  @ApiProperty({ description: 'User email' })
  email!: string;

  @ApiProperty({ description: 'User display name', nullable: true })
  name!: string | null;

  @ApiProperty({ description: 'Account creation timestamp (ISO8601)' })
  createdAt!: Date;

  @ApiProperty({
    description:
      'Main income source label, used by the Smart Assistant to project expected income',
    nullable: true,
  })
  mainIncomeSource!: string | null;

  @ApiProperty({
    description: 'Day of the month (1-31) the user gets paid',
    nullable: true,
  })
  payday!: number | null;

  @ApiProperty({
    description:
      'Actual monthly amount of the main income (e.g. salary), used to compute the "Margen Vital" KPI. Serialized as a string like other Decimal fields (e.g. Account.balance).',
    nullable: true,
  })
  mainIncomeAmount!: string | null;

  @ApiProperty({
    description:
      "ISO8601 timestamp of when the current access token (and its HttpOnly cookie) expires. The frontend uses this to schedule a silent refresh shortly before it, instead of hardcoding the backend's token lifespan.",
    example: '2026-08-30T12:05:00.000Z',
  })
  expiresAt!: string;
}
