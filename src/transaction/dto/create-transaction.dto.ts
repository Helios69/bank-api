import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/common/enums';

export class CreateTransactionDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: Currency;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  destinationAccount: string;
}
