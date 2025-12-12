// backend/src/events/events.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async onModuleInit() {
    // Sembrar eventos iniciales si no existen
    const count = await this.eventModel.countDocuments();
    if (count === 0) {
      await this.seedEvents();
    }
  }

  private async seedEvents() {
    const events = [
      {
        sport: 'football',
        league: 'La Liga',
        team1: 'Real Madrid',
        team2: 'Barcelona',
        flag1: 'es',
        flag2: 'es',
        startTime: new Date(),
        status: 'live',
        score1: 2,
        score2: 1,
        minute: 67,
        odds: { home: 1.45, draw: 4.20, away: 5.50 },
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
        featured: true
      },
      {
        sport: 'football',
        league: 'Premier League',
        team1: 'Manchester United',
        team2: 'Liverpool',
        flag1: 'gb-eng',
        flag2: 'gb-eng',
        startTime: new Date(),
        status: 'live',
        score1: 1,
        score2: 1,
        minute: 45,
        odds: { home: 2.80, draw: 3.10, away: 2.40 },
        imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
        featured: true
      },
      {
        sport: 'basketball',
        league: 'NBA',
        team1: 'LA Lakers',
        team2: 'Golden State Warriors',
        flag1: 'us',
        flag2: 'us',
        startTime: new Date(),
        status: 'live',
        score1: 87,
        score2: 92,
        minute: 0,
        period: 'Q3',
        odds: { home: 1.90, away: 1.90 },
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        featured: false
      },
      {
        sport: 'tennis',
        league: 'ATP Finals',
        team1: 'Rafael Nadal',
        team2: 'Novak Djokovic',
        flag1: 'es',
        flag2: 'rs',
        startTime: new Date(),
        status: 'live',
        score1: 6,
        score2: 4,
        period: 'Set 2',
        odds: { home: 2.10, away: 1.75 },
        imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
        featured: false
      },
      {
        sport: 'football',
        league: 'Champions League',
        team1: 'PSG',
        team2: 'Bayern Munich',
        flag1: 'fr',
        flag2: 'de',
        startTime: new Date(Date.now() + 3600000),
        status: 'scheduled',
        odds: { home: 2.60, draw: 3.40, away: 2.50 },
        imageUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
        featured: true
      },
      {
        sport: 'football',
        league: 'Serie A',
        team1: 'Juventus',
        team2: 'AC Milan',
        flag1: 'it',
        flag2: 'it',
        startTime: new Date(Date.now() + 86400000),
        status: 'scheduled',
        odds: { home: 2.10, draw: 3.20, away: 3.40 },
        imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
        featured: false
      },
      {
        sport: 'esports',
        league: 'LoL Worlds',
        team1: 'T1',
        team2: 'Gen.G',
        flag1: 'kr',
        flag2: 'kr',
        startTime: new Date(Date.now() + 172800000),
        status: 'scheduled',
        odds: { home: 1.55, away: 2.40 },
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        featured: true
      },
      {
        sport: 'boxing',
        league: 'WBC Heavyweight',
        team1: 'Canelo Alvarez',
        team2: 'Dmitry Bivol',
        flag1: 'mx',
        flag2: 'ru',
        startTime: new Date(Date.now() + 259200000),
        status: 'scheduled',
        odds: { home: 1.40, away: 3.00 },
        imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
        featured: false
      }
    ];

    await this.eventModel.insertMany(events);
    console.log('✅ Eventos sembrados correctamente');
  }

  async findAll() {
    return this.eventModel.find().sort({ startTime: 1 }).exec();
  }

  async findLive() {
    return this.eventModel.find({ status: 'live' }).exec();
  }

  async findUpcoming() {
    return this.eventModel.find({ status: 'scheduled' }).sort({ startTime: 1 }).exec();
  }

  async findFeatured() {
    return this.eventModel.find({ featured: true }).exec();
  }

  async findOne(id: string) {
    return this.eventModel.findById(id).exec();
  }

  async findBySport(sport: string) {
    return this.eventModel.find({ sport }).exec();
  }

  async updateEvent(id: string, data: Partial<Event>) {
    return this.eventModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateOdds(id: string, odds: { home: number; draw?: number; away: number }) {
    return this.eventModel.findByIdAndUpdate(id, { odds }, { new: true }).exec();
  }

  async updateScore(id: string, score1: number, score2: number, minute: number) {
    return this.eventModel.findByIdAndUpdate(
      id,
      { score1, score2, minute },
      { new: true }
    ).exec();
  }

  async finishEvent(id: string, score1: number, score2: number) {
    return this.eventModel.findByIdAndUpdate(
      id,
      { status: 'finished', score1, score2 },
      { new: true }
    ).exec();
  }
}