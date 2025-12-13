import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BetsService } from './bets.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('bets')
export class BetsController {
  constructor(private betsService: BetsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() body: any) {
    return this.betsService.create(req.user.userId, body);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findMyBets(@Request() req) {
    return this.betsService.findByUser(req.user.userId);
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'))
  async findPending(@Request() req) {
    return this.betsService.findPendingByUser(req.user.userId);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Request() req) {
    return this.betsService.getStats(req.user.userId);
  }

  @Post(':id/simulate')
  @UseGuards(AuthGuard('jwt'))
  async simulate(@Param('id') id: string) {
    return this.betsService.simulateResult(id);
  }
}