import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwtAuthentication.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
import { TransactionService } from './transaction.service';
import { Parser } from 'json2csv';

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

  @Get('/download')
  @UseGuards(JwtAuthenticationGuard)
  async downloadTransactionsCSV(
    @Req() request: RequestWithUser,
    @Res() response,
  ) {
    const { accountNumber } = request.user.account;
    const formattedTodayDate = new Date()
      .toLocaleDateString('en-US')
      .split('/')
      .join('.');
    const fileName = `TRANSACTIONS [${formattedTodayDate}]`;
    const fields = [
      'id',
      'description',
      'amount',
      'currency',
      'sourceAccount',
      'destinationAccount',
      'date',
      'status',
    ];
    const transactions = await this.transactionService.getAllUserTransactions(
      accountNumber,
    );

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(transactions);
    response.header('Content-Type', 'text/csv');
    response.attachment(fileName);
    return response.send(csv);
  }

  @Get('transaction/:transactionId')
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
