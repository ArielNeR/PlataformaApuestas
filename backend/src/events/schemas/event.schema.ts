import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true }) sport: string;
  @Prop({ required: true }) league: string;
  @Prop({ required: true }) team1: string;
  @Prop({ required: true }) team2: string;
  @Prop() flag1: string;  // URL del logo
  @Prop() flag2: string;  // URL del logo
  @Prop() country1: string; // URL bandera país
  @Prop() country2: string; // URL bandera país
  @Prop({ required: true }) startTime: Date;
  @Prop({ default: 'scheduled' }) status: string;
  @Prop({ default: 0 }) score1: number;
  @Prop({ default: 0 }) score2: number;
  @Prop({ default: 0 }) minute: number;
  @Prop() period: string;
  @Prop({ type: Object }) odds: { home: number; draw?: number; away: number };
  @Prop({ default: false }) featured: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);