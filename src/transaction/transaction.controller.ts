import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwtAuthentication.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
import { TransactionService } from './transaction.service';
import { Parser } from 'json2csv';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Get all user`s transactions' })
  @UseGuards(JwtAuthenticationGuard)
  getMyTransactions(@Req() request: RequestWithUser) {
    const { user } = request;
    return this.transactionService.getAllUserTransactions(
      user.account.accountNumber,
    );
  }

  @Get('/download')
  @ApiResponse({
    status: 200,
    description: 'Download all user`s transactions in CSV',
  })
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
  @ApiResponse({ status: 200, description: 'Get transaction by id' })
  @UseGuards(JwtAuthenticationGuard)
  getTransactionById(@Req() request: RequestWithUser) {
    const { user, params } = request;

    return this.transactionService.getUserTransaction(
      user.account.accountNumber,
      Number(params.transactionId),
    );
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Create transaction' })
  @UseGuards(JwtAuthenticationGuard)
  createTransaction(
    @Req() request: RequestWithUser,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const { user } = request;

    return this.transactionService.createTransaction(
      user.account.accountNumber,
      createTransactionDto,
    );
  }

  @Get('transaction/:transactionId/cancel')
  @ApiResponse({ status: 200, description: 'Cancel transaction' })
  @UseGuards(JwtAuthenticationGuard)
  cancelTransaction(@Param('transactionId') transactionId: number) {
    return this.transactionService.moveToCanceled(transactionId);
  }
}
