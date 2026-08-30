import { ApiProperty } from '@nestjs/swagger';

export class AccountStatsDto {
  @ApiProperty({
    description:
      'Average of the account end-of-day balance over the last 30 days, reconstructed from the current balance and the transactions in that window',
  })
  averageBalanceLast30Days!: number;

  @ApiProperty({
    description:
      'Projected next net interest payment (after tax), based on the 30-day average balance. `null` when the account has no interestRate configured.',
    nullable: true,
  })
  projectedNextInterestPayment!: number | null;

  @ApiProperty({
    description:
      'ISO date (YYYY-MM-DD) of the next scheduled interest payment. `null` when the account has no interestPaymentDay configured.',
    nullable: true,
  })
  nextInterestPaymentDate!: string | null;
}
