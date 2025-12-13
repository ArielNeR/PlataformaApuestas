import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bet } from './schemas/bet.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class BetsService {
  constructor(
    @InjectModel(Bet.name) private betModel: Model<Bet>,
    private usersService: UsersService
  ) {}

  async create(userId: string, data: any) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.saldo < data.stake) throw new BadRequestException('Saldo insuficiente');

    const newBalance = user.saldo - data.stake;
    await this.usersService.updateBalance(userId, newBalance);

    const bet = await this.betModel.create({
      userId: new Types.ObjectId(userId),
      selections: data.selections,
      type: data.selections.length === 1 ? 'simple' : 'multiple',
      stake: data.stake,
      totalOdds: data.totalOdds,
      potentialWin: data.potentialWin,
      status: 'pending'
    });

    console.log(`📝 Apuesta creada: ${bet._id}, Stake: ${data.stake}, Nuevo saldo: ${newBalance}`);

    return { bet, newBalance };
  }

  async findByUser(userId: string) {
    return this.betModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ✅ MÉTODO AÑADIDO
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
    
    const totalProfit = bets.reduce((acc, b) => {
      if (b.status === 'won') {
        return acc + (b.potentialWin - b.stake);
      } else if (b.status === 'lost') {
        return acc - b.stake;
      }
      return acc;
    }, 0);
    
    const totalStaked = bets.reduce((acc, b) => acc + b.stake, 0);
    const settledBets = won.length + lost.length;
    
    return {
      totalBets: bets.length,
      won: won.length,
      lost: lost.length,
      pending: pending.length,
      profit: Math.round(totalProfit * 100) / 100,
      totalStaked: Math.round(totalStaked * 100) / 100,
      winRate: settledBets > 0 ? Math.round((won.length / settledBets) * 100) : 0,
      roi: totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(1) : '0'
    };
  }

  async settleBet(betId: string, won: boolean) {
    const bet = await this.betModel.findById(betId).exec();
    if (!bet) throw new BadRequestException('Apuesta no encontrada');
    if (bet.status !== 'pending') throw new BadRequestException('Apuesta ya resuelta');

    const profit = won ? (bet.potentialWin - bet.stake) : -bet.stake;
    
    await this.betModel.findByIdAndUpdate(betId, {
      status: won ? 'won' : 'lost',
      profit,
      settledAt: new Date()
    });

    if (won) {
      const user = await this.usersService.findOne(bet.userId.toString());
      if (user) {
        const newBalance = user.saldo + bet.potentialWin;
        await this.usersService.updateBalance(bet.userId.toString(), newBalance);
        console.log(`💰 Ganador! Saldo: ${user.saldo} + ${bet.potentialWin} = ${newBalance}`);
      }
    }

    return { settled: true, won, profit };
  }

  async simulateResult(betId: string) {
    const won = Math.random() > 0.5;
    console.log(`🎲 Simulando: ${betId} -> ${won ? 'GANÓ' : 'PERDIÓ'}`);
    return this.settleBet(betId, won);
  }
}