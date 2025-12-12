// backend/src/bets/bets.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bet } from './schemas/bet.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class BetsService {
  constructor(
    @InjectModel(Bet.name) private betModel: Model<Bet>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, data: {
    selections: any[];
    stake: number;
    totalOdds: number;
    potentialWin: number;
  }) {
    // Verificar saldo
    const user = await this.usersService.findOne(userId);
    if (!user || user.saldo < data.stake) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // Descontar saldo
    await this.usersService.updateBalance(userId, user.saldo - data.stake);

    // Crear apuesta
    const bet = await this.betModel.create({
      userId: new Types.ObjectId(userId),
      selections: data.selections,
      type: data.selections.length === 1 ? 'simple' : 'multiple',
      stake: data.stake,
      totalOdds: data.totalOdds,
      potentialWin: data.potentialWin,
      status: 'pending',
    });

    return {
      bet,
      newBalance: user.saldo - data.stake,
    };
  }

  async findByUser(userId: string) {
    return this.betModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingByUser(userId: string) {
    return this.betModel
      .find({ userId: new Types.ObjectId(userId), status: 'pending' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStats(userId: string) {
    const bets = await this.betModel.find({ userId: new Types.ObjectId(userId) }).exec();
    
    const won = bets.filter(b => b.status === 'won');
    const lost = bets.filter(b => b.status === 'lost');
    const pending = bets.filter(b => b.status === 'pending');
    
    const totalProfit = bets.reduce((acc, b) => acc + (b.profit || 0), 0);
    const totalStaked = bets.reduce((acc, b) => acc + b.stake, 0);

    return {
      totalBets: bets.length,
      won: won.length,
      lost: lost.length,
      pending: pending.length,
      profit: totalProfit,
      totalStaked,
      winRate: bets.length > 0 ? Math.round((won.length / bets.length) * 100) : 0,
      roi: totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(1) : '0',
    };
  }

  async settleBet(betId: string, won: boolean) {
    const bet = await this.betModel.findById(betId).exec();
    if (!bet || bet.status !== 'pending') {
      throw new BadRequestException('Apuesta no válida');
    }

    const profit = won ? bet.potentialWin - bet.stake : -bet.stake;
    
    await this.betModel.findByIdAndUpdate(betId, {
      status: won ? 'won' : 'lost',
      profit,
      settledAt: new Date(),
    });

    if (won) {
      const user = await this.usersService.findOne(bet.userId.toString());
      if (user) {
        await this.usersService.updateBalance(bet.userId.toString(), user.saldo + bet.potentialWin);
      }
    }

    return { settled: true, won, profit };
  }

  // Simular resultado aleatorio para demo
  async simulateResult(betId: string) {
    const won = Math.random() > 0.4; // 60% de ganar para demo
    return this.settleBet(betId, won);
  }
}