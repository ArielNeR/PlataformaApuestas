// backend/src/bets/schemas/bet.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Bet extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  selections: {
    eventId: string;
    eventName: string;
    market: string;
    pick: string;
    pickLabel: string;
    odds: number;
  }[];

  @Prop({ enum: ['simple', 'multiple'], default: 'simple' })
  type: string;

  @Prop({ required: true })
  stake: number;

  @Prop({ required: true })
  totalOdds: number;

  @Prop({ required: true })
  potentialWin: number;

  @Prop({ enum: ['pending', 'won', 'lost', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ default: 0 })
  profit: number;

  @Prop()
  settledAt: Date;
}

export const BetSchema = SchemaFactory.createForClass(Bet);