import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import { getTeamLogo, getTeamCountry } from '../common/team-logos';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async onModuleInit() {
    await this.eventModel.deleteMany({});
    await this.seedEvents();
  }

  private async seedEvents() {
    const now = new Date();
    
    const eventsData = [
      // FÚTBOL - En vivo
      { sport: 'football', league: 'La Liga', team1: 'Real Madrid', team2: 'Barcelona', status: 'live', score1: 1, score2: 2, minute: 35, period: '1T', odds: { home: 2.40, draw: 3.25, away: 2.50 }, featured: true, timeOffset: -35 },
      { sport: 'football', league: 'Premier League', team1: 'Manchester City', team2: 'Liverpool', status: 'live', score1: 2, score2: 1, minute: 55, period: '2T', odds: { home: 1.45, draw: 4.50, away: 5.00 }, featured: true, timeOffset: -55 },
      { sport: 'football', league: 'Serie A', team1: 'Juventus', team2: 'AC Milan', status: 'live', score1: 0, score2: 1, minute: 20, period: '1T', odds: { home: 2.10, draw: 3.30, away: 3.20 }, featured: false, timeOffset: -20 },
      
      // BASKETBALL
      { sport: 'basketball', league: 'NBA', team1: 'LA Lakers', team2: 'Boston Celtics', status: 'live', score1: 48, score2: 52, minute: 20, period: 'Q2', odds: { home: 1.85, away: 1.95 }, featured: true, timeOffset: -20 },
      { sport: 'basketball', league: 'NBA', team1: 'Golden State', team2: 'Miami Heat', status: 'live', score1: 67, score2: 71, minute: 30, period: 'Q3', odds: { home: 2.10, away: 1.75 }, featured: false, timeOffset: -30 },
      
      // TENNIS
      { sport: 'tennis', league: 'ATP Masters 1000', team1: 'Djokovic', team2: 'Alcaraz', status: 'live', score1: 2, score2: 1, minute: 0, period: 'Set 4', odds: { home: 1.65, away: 2.20 }, featured: true, timeOffset: -60 },
      
      // ESPORTS
      { sport: 'esports', league: 'LEC Summer', team1: 'G2 Esports', team2: 'Fnatic', status: 'live', score1: 1, score2: 1, minute: 28, period: 'Mapa 3', odds: { home: 1.55, away: 2.35 }, featured: false, timeOffset: -25 },
      
      // PROGRAMADOS
      { sport: 'football', league: 'Champions League', team1: 'Bayern Munich', team2: 'PSG', status: 'scheduled', score1: 0, score2: 0, odds: { home: 1.90, draw: 3.60, away: 3.80 }, featured: true, timeOffset: 180 },
      { sport: 'football', league: 'Premier League', team1: 'Arsenal', team2: 'Chelsea', status: 'scheduled', score1: 0, score2: 0, odds: { home: 2.20, draw: 3.40, away: 3.00 }, featured: false, timeOffset: 300 },
      { sport: 'basketball', league: 'NBA', team1: 'Brooklyn Nets', team2: 'Chicago Bulls', status: 'scheduled', score1: 0, score2: 0, odds: { home: 1.75, away: 2.05 }, featured: false, timeOffset: 240 },
      { sport: 'tennis', league: 'WTA Finals', team1: 'Swiatek', team2: 'Sabalenka', status: 'scheduled', score1: 0, score2: 0, odds: { home: 1.80, away: 2.00 }, featured: true, timeOffset: 120 },
      { sport: 'boxing', league: 'WBC Heavyweight', team1: 'Tyson Fury', team2: 'Usyk', status: 'scheduled', score1: 0, score2: 0, odds: { home: 1.70, away: 2.15 }, featured: true, timeOffset: 1440 },
    ];

    const events = eventsData.map(e => ({
      ...e,
      flag1: getTeamLogo(e.team1),
      flag2: getTeamLogo(e.team2),
      country1: getTeamCountry(e.team1),
      country2: getTeamCountry(e.team2),
      startTime: new Date(now.getTime() + e.timeOffset * 60000),
    }));

    await this.eventModel.insertMany(events);
    console.log('✅ Eventos creados con logos reales');
  }

  async findAll() { return this.eventModel.find().sort({ startTime: 1 }).exec(); }
  async findLive() { return this.eventModel.find({ status: 'live' }).exec(); }
  async findUpcoming() { return this.eventModel.find({ status: 'scheduled' }).sort({ startTime: 1 }).exec(); }
  async findFeatured() { return this.eventModel.find({ featured: true }).sort({ startTime: 1 }).exec(); }
  async findBySport(sport: string) { return this.eventModel.find({ sport }).sort({ startTime: 1 }).exec(); }
  async findOne(id: string) { return this.eventModel.findById(id).exec(); }
  async updateEvent(id: string, data: Partial<Event>) { return this.eventModel.findByIdAndUpdate(id, data, { new: true }).exec(); }
}