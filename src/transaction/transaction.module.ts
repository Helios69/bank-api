import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { UserModule } from 'src/user/user.module';
import { TransactionsConsumer } from './transaction.consumer';
import { TransactionController } from './transaction.controller';
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BullModule.registerQueue({
      name: 'transactions',
    }),
    AccountModule,
    UserModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionsConsumer],
})
export class TransactionModule {}
