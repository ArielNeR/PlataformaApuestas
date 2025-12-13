import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  // Mapa de equipos a banderas/iconos
  private teamFlags: Record<string, string> = {
    // Fútbol - España
    'Real Madrid': '⚪🟣',
    'Barcelona': '🔵🔴',
    'Atletico Madrid': '🔴⚪',
    'Sevilla': '⚪🔴',
    'Valencia': '🦇',
    
    // Fútbol - Inglaterra
    'Manchester City': '🔵',
    'Liverpool': '🔴',
    'Chelsea': '🔵⚪',
    'Arsenal': '🔴⚪',
    'Manchester United': '🔴⚫',
    'Tottenham': '⚪',
    
    // Fútbol - Alemania
    'Bayern Munich': '🔴⚪',
    'Borussia Dortmund': '💛🖤',
    
    // Fútbol - Italia
    'Juventus': '⚪⚫',
    'AC Milan': '🔴⚫',
    'Inter Milan': '🔵⚫',
    'Napoli': '🔵',
    
    // Fútbol - Francia
    'PSG': '🔵🔴',
    'Marseille': '⚪🔵',
    
    // NBA
    'LA Lakers': '💜💛',
    'Boston Celtics': '☘️',
    'Golden State': '💙💛',
    'Miami Heat': '🔥',
    'Brooklyn Nets': '⚫⚪',
    'Chicago Bulls': '🐂',
    'Phoenix Suns': '☀️',
    'Dallas Mavericks': '🐴',
    
    // Tennis
    'Djokovic': '🇷🇸',
    'Alcaraz': '🇪🇸',
    'Sinner': '🇮🇹',
    'Medvedev': '🇷🇺',
    'Swiatek': '🇵🇱',
    'Sabalenka': '🇧🇾',
    'Nadal': '🇪🇸',
    'Federer': '🇨🇭',
    
    // eSports
    'G2 Esports': '🎮',
    'Fnatic': '🟠',
    'T1': '🔴',
    'Cloud9': '☁️',
    'Team Liquid': '🔵',
    
    // Boxing
    'Tyson Fury': '🇬🇧',
    'Usyk': '🇺🇦',
    'Canelo': '🇲🇽',
    'Joshua': '🇬🇧',
  };

  getTeamFlag(teamName: string): string {
    return this.teamFlags[teamName] || '🏆';
  }

  async onModuleInit() {
    // Siempre regenerar eventos para tener datos frescos
    await this.eventModel.deleteMany({});
    await this.seedEvents();
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
        flag1: this.getTeamFlag('Real Madrid'),
        flag2: this.getTeamFlag('Barcelona'),
        startTime: new Date(now.getTime() - 35 * 60000),
        status: 'live',
        score1: 1,
        score2: 2,
        minute: 35,
        period: '1T',
        odds: { home: 2.40, draw: 3.25, away: 2.50 },
        featured: true
      },
      {
        sport: 'football',
        league: 'Premier League',
        team1: 'Manchester City',
        team2: 'Liverpool',
        flag1: this.getTeamFlag('Manchester City'),
        flag2: this.getTeamFlag('Liverpool'),
        startTime: new Date(now.getTime() - 55 * 60000),
        status: 'live',
        score1: 2,
        score2: 1,
        minute: 55,
        period: '2T',
        odds: { home: 1.45, draw: 4.50, away: 5.00 },
        featured: true
      },
      {
        sport: 'football',
        league: 'Serie A',
        team1: 'Juventus',
        team2: 'AC Milan',
        flag1: this.getTeamFlag('Juventus'),
        flag2: this.getTeamFlag('AC Milan'),
        startTime: new Date(now.getTime() - 20 * 60000),
        status: 'live',
        score1: 0,
        score2: 0,
        minute: 20,
        period: '1T',
        odds: { home: 2.10, draw: 3.30, away: 3.20 },
        featured: false
      },
      // BASKETBALL - En vivo
      {
        sport: 'basketball',
        league: 'NBA',
        team1: 'LA Lakers',
        team2: 'Boston Celtics',
        flag1: this.getTeamFlag('LA Lakers'),
        flag2: this.getTeamFlag('Boston Celtics'),
        startTime: new Date(now.getTime() - 20 * 60000),
        status: 'live',
        score1: 48,
        score2: 52,
        minute: 20,
        period: 'Q2',
        odds: { home: 1.85, away: 1.95 },
        featured: true
      },
      {
        sport: 'basketball',
        league: 'NBA',
        team1: 'Golden State',
        team2: 'Miami Heat',
        flag1: this.getTeamFlag('Golden State'),
        flag2: this.getTeamFlag('Miami Heat'),
        startTime: new Date(now.getTime() - 30 * 60000),
        status: 'live',
        score1: 67,
        score2: 71,
        minute: 30,
        period: 'Q3',
        odds: { home: 2.10, away: 1.75 },
        featured: false
      },
      // TENNIS - En vivo
      {
        sport: 'tennis',
        league: 'ATP Masters 1000',
        team1: 'Djokovic',
        team2: 'Alcaraz',
        flag1: this.getTeamFlag('Djokovic'),
        flag2: this.getTeamFlag('Alcaraz'),
        startTime: new Date(now.getTime() - 60 * 60000),
        status: 'live',
        score1: 2,
        score2: 1,
        minute: 0,
        period: 'Set 4',
        odds: { home: 1.65, away: 2.20 },
        featured: true
      },
      // ESPORTS - En vivo
      {
        sport: 'esports',
        league: 'LEC Summer',
        team1: 'G2 Esports',
        team2: 'Fnatic',
        flag1: this.getTeamFlag('G2 Esports'),
        flag2: this.getTeamFlag('Fnatic'),
        startTime: new Date(now.getTime() - 25 * 60000),
        status: 'live',
        score1: 1,
        score2: 1,
        minute: 28,
        period: 'Mapa 3',
        odds: { home: 1.55, away: 2.35 },
        featured: false
      },
      // PROGRAMADOS
      {
        sport: 'football',
        league: 'Champions League',
        team1: 'Bayern Munich',
        team2: 'PSG',
        flag1: this.getTeamFlag('Bayern Munich'),
        flag2: this.getTeamFlag('PSG'),
        startTime: new Date(now.getTime() + 3 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 1.90, draw: 3.60, away: 3.80 },
        featured: true
      },
      {
        sport: 'football',
        league: 'Premier League',
        team1: 'Arsenal',
        team2: 'Chelsea',
        flag1: this.getTeamFlag('Arsenal'),
        flag2: this.getTeamFlag('Chelsea'),
        startTime: new Date(now.getTime() + 5 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 2.20, draw: 3.40, away: 3.00 },
        featured: false
      },
      {
        sport: 'basketball',
        league: 'NBA',
        team1: 'Brooklyn Nets',
        team2: 'Chicago Bulls',
        flag1: this.getTeamFlag('Brooklyn Nets'),
        flag2: this.getTeamFlag('Chicago Bulls'),
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
        flag1: this.getTeamFlag('Swiatek'),
        flag2: this.getTeamFlag('Sabalenka'),
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
        flag1: this.getTeamFlag('Tyson Fury'),
        flag2: this.getTeamFlag('Usyk'),
        startTime: new Date(now.getTime() + 24 * 3600000),
        status: 'scheduled',
        score1: 0,
        score2: 0,
        odds: { home: 1.70, away: 2.15 },
        featured: true
      }
    ];

    await this.eventModel.insertMany(events);
    console.log('✅ Eventos creados con banderas correctas');
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
    return this.eventModel.find({ featured: true }).sort({ startTime: 1 }).exec();
  }

  async findBySport(sport: string) {
    return this.eventModel.find({ sport }).sort({ startTime: 1 }).exec();
  }

  async findOne(id: string) {
    return this.eventModel.findById(id).exec();
  }

  async updateEvent(id: string, data: Partial<Event>) {
    return this.eventModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}