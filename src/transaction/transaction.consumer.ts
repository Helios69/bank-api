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
  async onProcess(job: Job, result: any) {
    // await this.transactionService.completeTransaction(job.data.transactionId);
    console.log('process', job.data);
    return job;
  }

  @OnQueueActive()
  async onActive(job: Job) {
    console.log('active', job.data);

    // await this.transactionService.changeStatus(
    //   job.data.tansactionId,
    //   TransactionStatuses.IN_REVIEW,
    // );
    return job;
  }

  @OnQueueCompleted()
  async onComplete(job: Job) {
    console.log('completed', job.data);

    // await this.transactionService.changeStatus(
    //   job.data.tansactionId,
    //   TransactionStatuses.IN_REVIEW,
    // );
    return job;
  }
}
