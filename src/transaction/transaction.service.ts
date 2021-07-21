import { InjectQueue } from '@nestjs/bull';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { TransactionStatuses } from 'src/common/enums';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectQueue('transactions') private transactionsQueue: Queue,
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
        {
          transactionId: newTransaction.id,
        },
        { delay: 10000 },
      );

      return newTransaction;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeStatus(transactionId: number, status: TransactionStatuses) {
    const transaction = await this.getTransactionById(transactionId);
    console.log(transaction);
    // const modifiedTransaction = await this.transactionsRepository.preload({
    //   id: +transaction.id,
    //   ...transaction,
    //   status,
    // });
    return transaction;
  }

  async completeTransaction(transactionId: number) {
    await this.changeStatus(transactionId, TransactionStatuses.COMPLETE);
  }
}
