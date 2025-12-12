// Frontend/src/app/services/event.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SportEvent } from '../models/event.model';
import { WebSocketService, EventUpdate } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API_URL = 'http://localhost:3000';
  private http = inject(HttpClient);
  private wsService = inject(WebSocketService);

  private eventsSubject = new BehaviorSubject<SportEvent[]>([]);
  events$ = this.eventsSubject.asObservable();

  constructor() {
    this.loadEvents();
    this.listenToUpdates();
  }

  private loadEvents(): void {
    this.http.get<any[]>(`${this.API_URL}/events`).subscribe({
      next: (events) => {
        const mapped = events.map(e => this.mapEvent(e));
        this.eventsSubject.next(mapped);
      },
      error: (err) => console.error('Error cargando eventos:', err)
    });
  }

  private listenToUpdates(): void {
    this.wsService.getEventUpdates().subscribe(update => {
      if (update) {
        const events = this.eventsSubject.value.map(event => {
          if (event.id === update.eventId) {
            return {
              ...event,
              minute: update.minute ?? event.minute,
              score1: update.score1 ?? event.score1,
              score2: update.score2 ?? event.score2,
              odds: update.odds ?? event.odds,
            };
          }
          return event;
        });
        this.eventsSubject.next(events);
      }
    });
  }

  private mapEvent(e: any): SportEvent {
    return {
      id: e._id,
      sport: e.sport,
      sportIcon: this.getSportIcon(e.sport),
      league: e.league,
      team1: e.team1,
      team2: e.team2,
      flag1: e.flag1,
      flag2: e.flag2,
      startTime: new Date(e.startTime),
      status: e.status,
      score1: e.score1,
      score2: e.score2,
      minute: e.minute,
      period: e.period,
      odds: e.odds,
      imageUrl: e.imageUrl,
      featured: e.featured,
    };
  }

  private getSportIcon(sport: string): string {
    const icons: Record<string, string> = {
      football: 'fas fa-futbol',
      basketball: 'fas fa-basketball',
      tennis: 'fas fa-table-tennis-paddle-ball',
      esports: 'fas fa-gamepad',
      boxing: 'fas fa-hand-fist',
    };
    return icons[sport] || 'fas fa-trophy';
  }

  getLiveEvents(): Observable<SportEvent[]> {
    return new Observable(observer => {
      this.events$.subscribe(events => {
        observer.next(events.filter(e => e.status === 'live'));
      });
    });
  }

  getUpcomingEvents(): Observable<SportEvent[]> {
    return new Observable(observer => {
      this.events$.subscribe(events => {
        observer.next(events.filter(e => e.status === 'scheduled'));
      });
    });
  }

  getFeaturedEvents(): Observable<SportEvent[]> {
    return new Observable(observer => {
      this.events$.subscribe(events => {
        observer.next(events.filter(e => e.featured));
      });
    });
  }

  getAllEvents(): Observable<SportEvent[]> {
    return this.events$;
  }

  getEventById(id: string): Observable<SportEvent | undefined> {
    return new Observable(observer => {
      this.events$.subscribe(events => {
        observer.next(events.find(e => e.id === id));
      });
    });
  }

  refreshEvents(): void {
    this.loadEvents();
  }
}