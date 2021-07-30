import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { AccountService } from 'src/account/account.service';
import { CURRENCIES } from 'src/common/constants';
import { Currency, TransactionStatuses } from 'src/common/enums';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectQueue('transactions') private transactionsQueue: Queue,
    private readonly accountService: AccountService,
  ) {}

  async getAllUserTransactions(accountNumber: string): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: [
        { sourceAccount: accountNumber },
        { destinationAccount: accountNumber },
      ],
    });
  }

  async getTransactionById(transactionId: number) {
    let transaction;
    if (!isNaN(transactionId)) {
      transaction = await this.transactionsRepository.findOne(transactionId);
    }

    if (!transaction) {
      throw new NotFoundException('Transaction not found!');
    }

    return transaction;
  }

  async getTransactionByJobId(jobId: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { jobId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found!');
    }

    return transaction;
  }

  async getUserTransaction(accountNumber: string, transactionId: number) {
    const transaction = await this.getTransactionById(transactionId);
    if (
      transaction.sourceAccount !== accountNumber &&
      transaction.destinationAccount !== accountNumber
    ) {
      throw new NotFoundException('Transaction not found!');
    }

    return transaction;
  }

  transformCurrency(amount: number, currency: Currency) {
    return amount * CURRENCIES[currency];
  }

  async updateTransaction(
    transactionId: number,
    payload: UpdateTransactionDto,
  ) {
    const updatedTransaction = await this.transactionsRepository.preload({
      id: +transactionId,
      ...payload,
    });

    if (!updatedTransaction) {
      throw new NotFoundException('Transaction not found!');
    }

    await this.transactionsRepository.save(updatedTransaction);
    return updatedTransaction;
  }

  async createTransaction(
    sourceAccount: string,
    createTransactionDto: CreateTransactionDto,
  ) {
    try {
      const newTransaction = await this.transactionsRepository.save({
        sourceAccount,
        ...createTransactionDto,
      });
      await this.transactionsQueue.add(
        'created',
        {
          transactionId: newTransaction.id,
        },
        { delay: +process.env.REVIEW_DELAY },
      );

      return newTransaction;
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async startReviewing(transactionId: number) {
    const job = await this.transactionsQueue.add(
      'review',
      {
        transactionId,
      },
      { delay: +process.env.TRANSACTION_DELAY },
    );
    await this.updateTransaction(transactionId, {
      status: TransactionStatuses.IN_REVIEW,
      jobId: job.id as string,
    });
  }

  async moveToCanceled(transactionId: number) {
    try {
      const { jobId, status } = await this.transactionsRepository.findOne(
        transactionId,
      );

      if (status !== TransactionStatuses.IN_REVIEW) {
        throw new BadRequestException(
          'Transaction status must be CREATED or IN_REVIEW',
        );
      }
      const job = await this.transactionsQueue.getJob(jobId);
      job.remove();
      await this.updateTransaction(transactionId, {
        status: TransactionStatuses.CANCELED,
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async moveToCompleted(jobId: string) {
    try {
      const transaction = await this.transactionsRepository.findOne({
        where: { jobId },
      });
      const sourceAccount = await this.accountService.getAccountByNumber(
        transaction.sourceAccount,
      );
      const destinationAccount = await this.accountService.getAccountByNumber(
        transaction.destinationAccount,
      );
      const transactionAmount = this.transformCurrency(
        transaction.amount,
        transaction.currency,
      );

      if (sourceAccount.amount < transactionAmount) {
        return await this.updateTransaction(transaction.id, {
          status: TransactionStatuses.DECLINED,
        });
      }

      await this.accountService.modifyAccountBalance(
        sourceAccount,
        Number(sourceAccount.amount) - Number(transactionAmount),
      );

      await this.accountService.modifyAccountBalance(
        destinationAccount,
        Number(destinationAccount.amount) + Number(transactionAmount),
      );

      return await this.updateTransaction(transaction.id, {
        status: TransactionStatuses.COMPLETE,
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
