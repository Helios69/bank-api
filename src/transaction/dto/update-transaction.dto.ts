import { Currency, TransactionStatuses } from 'src/common/enums';

export class UpdateTransactionDto {
  amount?: number;
  currency?: Currency;
  description?: string;
  destinationAccount?: string;
  jobId?: string;
  status?: TransactionStatuses;
}
