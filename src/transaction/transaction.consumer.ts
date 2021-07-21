import {
  OnQueueActive,
  OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { TransactionStatuses } from 'src/common/enums';
import { TransactionService } from './transaction.service';

@Processor('transactions')
export class TransactionsConsumer {
  constructor(private readonly transactionService: TransactionService) {}

  @Process()
  async onProcess(job: Job) {
    await this.transactionService.moveToCompleted(job.data.transactionId);
    job.moveToCompleted('completed', true);
  }

  @OnQueueActive()
  async onActive(job: Job) {
    console.log(job.data);

    await this.transactionService.moveToReview(job.data.transactionId);
  }
}
