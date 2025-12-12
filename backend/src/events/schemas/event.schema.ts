// backend/src/events/schemas/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  sport: string;

  @Prop({ required: true })
  league: string;

  @Prop({ required: true })
  team1: string;

  @Prop({ required: true })
  team2: string;

  @Prop({ default: 'es' })
  flag1: string;

  @Prop({ default: 'es' })
  flag2: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ enum: ['scheduled', 'live', 'finished', 'cancelled'], default: 'scheduled' })
  status: string;

  @Prop({ default: 0 })
  score1: number;

  @Prop({ default: 0 })
  score2: number;

  @Prop({ default: 0 })
  minute: number;

  @Prop({ default: '' })
  period: string;

  @Prop({ type: Object, required: true })
  odds: {
    home: number;
    draw?: number;
    away: number;
  };

  @Prop()
  imageUrl: string;

  @Prop({ default: false })
  featured: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);