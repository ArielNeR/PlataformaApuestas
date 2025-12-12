// backend/src/bets/bets.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from './schemas/bet.schema';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }]),
    UsersModule,
  ],
  providers: [BetsService],
  controllers: [BetsController],
  exports: [BetsService],
})
export class BetsModule {}