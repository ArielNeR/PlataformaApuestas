// backend/src/transactions/transactions.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('deposit')
  @UseGuards(AuthGuard('jwt'))
  async deposit(@Request() req, @Body() body: {
    amount: number;
    cardNumber: string;
    cardName: string;
    cardExpiry: string;
    cardCvv: string;
  }) {
    return this.transactionsService.deposit(req.user.userId, body);
  }

  @Post('withdraw')
  @UseGuards(AuthGuard('jwt'))
  async withdraw(@Request() req, @Body() body: { amount: number }) {
    return this.transactionsService.withdraw(req.user.userId, body.amount);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findMyTransactions(@Request() req) {
    return this.transactionsService.findByUser(req.user.userId);
  }
}