import { Currency } from 'src/common/enums';

export class CreateTransactionDto {
  amount: number;
  currency: Currency;
  description?: string;
  destinationAccount: string;
}
