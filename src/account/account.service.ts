import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Account } from './account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async getAccountByNumber(accountNumber: string) {
    const account = this.accountRepository.findOne({
      where: { accountNumber },
    });

    if (!account) throw new NotFoundException('Account not found!');
    return account;
  }

  async modifyAccountBalance(account: Account, amount: number) {
    try {
      return await this.accountRepository.save({
        ...account,
        amount,
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
