import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsUUID } from 'class-validator';

export class BulkDeleteTransactionsDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
    description:
      'Ids of the transactions to soft-delete, must belong to the authenticated user',
  })
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  transactionIds!: string[];
}
