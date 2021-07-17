import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwtAuthentication.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  getMyTransactions(@Req() request: RequestWithUser) {
    const { user } = request;
    return this.transactionService.getAllUserTransactions(
      user.account.accountNumber,
    );
  }

  @Get(':transactionId')
  @UseGuards(JwtAuthenticationGuard)
  getTransactionById(@Req() request: RequestWithUser) {
    const { user, params } = request;

    return this.transactionService.getTransaction(
      user.account.accountNumber,
      Number(params.transactionId),
    );
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  createTransaction(@Req() request: RequestWithUser) {
    const { user, body } = request;

    return this.transactionService.createTransaction(
      user.account.accountNumber,
      body,
    );
  }
}
