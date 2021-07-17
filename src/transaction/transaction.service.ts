import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private userService: UserService,
  ) {}

  async getAllUserTransactions(accountNumber: string): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: [
        { sourceAccount: accountNumber },
        { destinationAccount: accountNumber },
      ],
    });
  }

  async getTransaction(accountNumber: string, transactionId: number) {
    const transaction = await this.transactionsRepository.findOne(
      transactionId,
    );

    if (
      !transaction ||
      (transaction.sourceAccount !== accountNumber &&
        transaction.destinationAccount !== accountNumber)
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
      return await this.transactionsRepository.save({
        sourceAccount,
        ...createTransactionDto,
      });
    } catch (error) {
      console.log(error);

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
