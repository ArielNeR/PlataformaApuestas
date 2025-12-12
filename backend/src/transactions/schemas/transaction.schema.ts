// backend/src/transactions/schemas/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: ['deposit', 'withdrawal', 'bet', 'win'], required: true })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop()
  method: string; // 'credit_card', 'paypal', 'crypto', etc.

  @Prop({ type: Object })
  details: {
    cardLast4?: string;
    cardBrand?: string;
    reference?: string;
  };

  @Prop()
  description: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);