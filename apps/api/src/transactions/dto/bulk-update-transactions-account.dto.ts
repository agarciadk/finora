import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsUUID } from 'class-validator';

export class BulkUpdateTransactionsAccountDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
    description:
      'Ids of the transactions to reassign, must belong to the authenticated user',
  })
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  transactionIds!: string[];

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  accountId!: string;
}
