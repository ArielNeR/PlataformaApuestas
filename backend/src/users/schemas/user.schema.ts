import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: [String], default: ['USER'] })
  roles: string[];

  @Prop({ default: 0 })
  saldo: number;

  @Prop({ default: false })
  esDemo: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);