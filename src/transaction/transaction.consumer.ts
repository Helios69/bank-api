import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TransactionService } from './transaction.service';

@Processor('transactions')
export class TransactionsConsumer {
  constructor(private readonly transactionService: TransactionService) {}

  @Process('created')
  async onCreatedActive(job: Job) {
    job.moveToCompleted('completed', true);
    await this.transactionService.startReviewing(job.data.transactionId);
  }

  @Process('review')
  async onReviewActive(job: Job) {
    await job.moveToCompleted('completed', true);
    await this.transactionService.moveToCompleted(job.id as string);
  }
}
