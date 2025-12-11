// Frontend/src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { SportEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private liveEvents: SportEvent[] = [
    {
      id: '1',
      sport: 'football',
      sportIcon: 'fas fa-futbol',
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
      id: '2',
      sport: 'football',
      sportIcon: 'fas fa-futbol',
      league: 'Premier League',
      team1: 'Man United',
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
      id: '3',
      sport: 'basketball',
      sportIcon: 'fas fa-basketball',
      league: 'NBA',
      team1: 'Lakers',
      team2: 'Warriors',
      flag1: 'us',
      flag2: 'us',
      startTime: new Date(),
      status: 'live',
      score1: 87,
      score2: 92,
      minute: 'Q3',
      odds: { home: 1.90, away: 1.90 },
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      featured: false
    },
    {
      id: '4',
      sport: 'tennis',
      sportIcon: 'fas fa-table-tennis-paddle-ball',
      league: 'ATP Finals',
      team1: 'Nadal',
      team2: 'Djokovic',
      flag1: 'es',
      flag2: 'rs',
      startTime: new Date(),
      status: 'live',
      score1: '6-4',
      score2: '5-5',
      minute: 'Set 2',
      odds: { home: 2.10, away: 1.75 },
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
      featured: false
    }
  ];

  private upcomingEvents: SportEvent[] = [
    {
      id: '5',
      sport: 'football',
      sportIcon: 'fas fa-futbol',
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
      id: '6',
      sport: 'football',
      sportIcon: 'fas fa-futbol',
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
      id: '7',
      sport: 'esports',
      sportIcon: 'fas fa-gamepad',
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
      id: '8',
      sport: 'boxing',
      sportIcon: 'fas fa-hand-fist',
      league: 'WBC',
      team1: 'Canelo',
      team2: 'Bivol',
      flag1: 'mx',
      flag2: 'ru',
      startTime: new Date(Date.now() + 259200000),
      status: 'scheduled',
      odds: { home: 1.40, away: 3.00 },
      imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
      featured: false
    }
  ];

  private eventsSubject = new BehaviorSubject<SportEvent[]>([...this.liveEvents, ...this.upcomingEvents]);

  constructor() {
    // Simular actualizaciones de cuotas en tiempo real
    this.startOddsUpdates();
  }

  private startOddsUpdates(): void {
    interval(5000).subscribe(() => {
      this.liveEvents = this.liveEvents.map(event => {
        const change = (Math.random() - 0.5) * 0.1;
        return {
          ...event,
          odds: {
            home: Math.max(1.01, +(event.odds.home + change).toFixed(2)),
            draw: event.odds.draw ? Math.max(1.01, +(event.odds.draw + (Math.random() - 0.5) * 0.05).toFixed(2)) : undefined,
            away: Math.max(1.01, +(event.odds.away - change).toFixed(2))
          }
        };
      });
      this.eventsSubject.next([...this.liveEvents, ...this.upcomingEvents]);
    });
  }

  getLiveEvents(): Observable<SportEvent[]> {
    return this.eventsSubject.pipe(
      map(events => events.filter(e => e.status === 'live'))
    );
  }

  getUpcomingEvents(): Observable<SportEvent[]> {
    return this.eventsSubject.pipe(
      map(events => events.filter(e => e.status === 'scheduled'))
    );
  }

  getFeaturedEvents(): Observable<SportEvent[]> {
    return this.eventsSubject.pipe(
      map(events => events.filter(e => e.featured))
    );
  }

  getAllEvents(): Observable<SportEvent[]> {
    return this.eventsSubject.asObservable();
  }

  getEventById(id: string): Observable<SportEvent | undefined> {
    return this.eventsSubject.pipe(
      map(events => events.find(e => e.id === id))
    );
  }

  getEventsBySport(sport: string): Observable<SportEvent[]> {
    if (sport === 'all') return this.eventsSubject.asObservable();
    return this.eventsSubject.pipe(
      map(events => events.filter(e => e.sport === sport))
    );
  }
}