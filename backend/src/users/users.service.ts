// backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data: any) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  async updateBalance(id: string, newBalance: number) {
    return this.userModel.findByIdAndUpdate(
      id,
      { saldo: newBalance },
      { new: true }
    ).exec();
  }

  async addBalance(id: string, amount: number) {
    return this.userModel.findByIdAndUpdate(
      id,
      { $inc: { saldo: amount } },
      { new: true }
    ).exec();
  }
}