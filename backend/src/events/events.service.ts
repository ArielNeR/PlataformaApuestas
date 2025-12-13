import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async onModuleInit() {
    const count = await this.eventModel.countDocuments();
    if (count === 0) await this.seedEvents();
  }

  private async seedEvents() {
    const now = new Date();
    
    const events = [
      // FÚTBOL - En vivo
      {
        sport: 'football',
        league: 'La Liga',
        team1: 'Real Madrid',
        team2: 'Barcelona',
        flag1: '⚪',
        flag2: '🔵🔴',
        startTime: new Date(now.getTime() - 30 * 60000),
        status: 'live',
        score1: 1,
        score2: 1,
        minute: 32,
        period: '1T',
        odds: { home: 2.10, draw: 3.25, away: 2.85 },
        featured: true
      },
      {
        sport: 'football',
        league: 'Premier League',
        team1: 'Manchester City',
        team2: 'Liverpool',
        flag1: '🔵',
        flag2: '🔴',
        startTime: new Date(now.getTime() - 60 * 60000),
        status: 'live',
        score1: 2,
        score2: 1,
        minute: 67,
        period: '2T',
        odds: { home: 1.45, draw: 4.50, away: 5.00 },
        featured: true
      },
      // BASKETBALL - En vivo
      {
        sport: 'basketball',
        league: 'NBA',
        team1: 'LA Lakers',
        team2: 'Boston Celtics',
        flag1: '💜💛',
        flag2: '☘️',
        startTime: new Date(now.getTime() - 25 * 60000),
        status: 'live',
        score1: 54,
        score2: 51,
        minute: 24,
        period: 'Q2',
        odds: { home: 1.85, away: 1.95 },
        featured: true
      },
      {
        sport: 'basketball',
        league: 'NBA',
        team1: 'Golden State',
        team2: 'Miami Heat',
        flag1: '💙💛',
        flag2: '🔥',
        startTime: new Date(now.getTime() - 35 * 60000),
        status: 'live',
        score1: 78,
        score2: 82,
        minute: 36,
        period: 'Q3',
        odds: { home: 2.10, away: 1.75 },
        featured: false
      },
      // TENNIS - En vivo
      {
        sport: 'tennis',
        league: 'ATP Masters',
        team1: 'Djokovic',
        team2: 'Alcaraz',
        flag1: '🇷🇸',
        flag2: '🇪🇸',
        startTime: new Date(now.getTime() - 45 * 60000),
        status: 'live',
        score1: 2,
        score2: 1,
        minute: 0,
        period: 'Set 4',
        odds: { home: 1.65, away: 2.20 },
        featured: true
      },
      // ESPORTS
      {
        sport: 'esports',
        league: 'LEC',
        team1: 'G2 Esports',
        team2: 'Fnatic',
        flag1: '🎮',
        flag2: '🎮',
        startTime: new Date(now.getTime() - 20 * 60000),
        status: 'live',
        score1: 1,
        score2: 0,
        minute: 25,
        period: 'Mapa 2',
        odds: { home: 1.55, away: 2.35 },
        featured: false
      },
      // PROGRAMADOS
      {
        sport: 'football',
        league: 'Champions League',
        team1: 'Bayern Munich',
        team2: 'PSG',
        flag1: '🔴⚪',
        flag2: '🔵🔴',
        startTime: new Date(now.getTime() + 3 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 1.90, draw: 3.60, away: 3.80 },
        featured: true
      },
      {
        sport: 'football',
        league: 'Serie A',
        team1: 'Juventus',
        team2: 'AC Milan',
        flag1: '⚪⚫',
        flag2: '🔴⚫',
        startTime: new Date(now.getTime() + 5 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 2.30, draw: 3.20, away: 2.90 },
        featured: false
      },
      {
        sport: 'basketball',
        league: 'NBA',
        team1: 'Brooklyn Nets',
        team2: 'Chicago Bulls',
        flag1: '⚫⚪',
        flag2: '🔴⚫',
        startTime: new Date(now.getTime() + 4 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 1.75, away: 2.05 },
        featured: false
      },
      {
        sport: 'tennis',
        league: 'WTA Finals',
        team1: 'Swiatek',
        team2: 'Sabalenka',
        flag1: '🇵🇱',
        flag2: '🇧🇾',
        startTime: new Date(now.getTime() + 2 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 1.80, away: 2.00 },
        featured: true
      },
      {
        sport: 'boxing',
        league: 'WBC Heavyweight',
        team1: 'Tyson Fury',
        team2: 'Usyk',
        flag1: '🇬🇧',
        flag2: '🇺🇦',
        startTime: new Date(now.getTime() + 24 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 1.70, away: 2.15 },
        featured: true
      }
    ];

    await this.eventModel.insertMany(events);
    console.log('✅ Eventos iniciales creados');
  }

  // ✅ Obtener todos los eventos
  async findAll() {
    return this.eventModel.find().sort({ startTime: 1 }).exec();
  }

  // ✅ Obtener eventos en vivo
  async findLive() {
    return this.eventModel.find({ status: 'live' }).exec();
  }

  // ✅ Obtener eventos programados
  async findUpcoming() {
    return this.eventModel.find({ status: 'scheduled' }).sort({ startTime: 1 }).exec();
  }

  // ✅ AÑADIDO: Obtener eventos destacados
  async findFeatured() {
    return this.eventModel.find({ featured: true }).sort({ startTime: 1 }).exec();
  }

  // ✅ AÑADIDO: Obtener eventos por deporte
  async findBySport(sport: string) {
    return this.eventModel.find({ sport }).sort({ startTime: 1 }).exec();
  }

  // ✅ Obtener un evento por ID
  async findOne(id: string) {
    return this.eventModel.findById(id).exec();
  }

  // ✅ Actualizar un evento
  async updateEvent(id: string, data: Partial<Event>) {
    return this.eventModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}