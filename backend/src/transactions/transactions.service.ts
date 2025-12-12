// backend/src/transactions/transactions.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private usersService: UsersService,
  ) {}

  async deposit(userId: string, data: {
    amount: number;
    cardNumber: string;
    cardName: string;
    cardExpiry: string;
    cardCvv: string;
  }) {
    // Simular validación de tarjeta
    const cardLast4 = data.cardNumber.slice(-4);
    const cardBrand = this.detectCardBrand(data.cardNumber);

    // Crear transacción
    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      type: 'deposit',
      amount: data.amount,
      status: 'completed', // En producción sería 'pending' hasta confirmar
      method: 'credit_card',
      details: {
        cardLast4,
        cardBrand,
        reference: `DEP-${Date.now()}`,
      },
      description: `Depósito con tarjeta ${cardBrand} ****${cardLast4}`,
    });

    // Actualizar saldo
    const user = await this.usersService.findOne(userId);
    if (user) {
      await this.usersService.updateBalance(userId, user.saldo + data.amount);
    }

    return {
      transaction,
      newBalance: (user?.saldo || 0) + data.amount,
    };
  }

  async withdraw(userId: string, amount: number) {
    const user = await this.usersService.findOne(userId);
    if (!user || user.saldo < amount) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      type: 'withdrawal',
      amount,
      status: 'pending',
      description: 'Solicitud de retiro',
    });

    await this.usersService.updateBalance(userId, user.saldo - amount);

    return {
      transaction,
      newBalance: user.saldo - amount,
    };
  }

  async findByUser(userId: string) {
    return this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  private detectCardBrand(cardNumber: string): string {
    const num = cardNumber.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    if (/^6(?:011|5)/.test(num)) return 'Discover';
    return 'Card';
  }
}