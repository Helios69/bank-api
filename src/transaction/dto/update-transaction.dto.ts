import { ApiProperty } from '@nestjs/swagger';
import { Currency, TransactionStatuses } from 'src/common/enums';

export class UpdateTransactionDto {
  @ApiProperty()
  amount?: number;

  @ApiProperty()
  currency?: Currency;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  destinationAccount?: string;

  @ApiProperty()
  jobId?: string;

  @ApiProperty()
  status?: TransactionStatuses;
}
