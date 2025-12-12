import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of, retry } from 'rxjs';
import { SportEvent } from '../models/event.model';
import { WebSocketService, EventUpdate } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API_URL = 'http://localhost:3000';
  private http = inject(HttpClient);
  private wsService = inject(WebSocketService);

  private eventsSubject = new BehaviorSubject<SportEvent[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private errorSubject = new BehaviorSubject<string | null>(null);

  events$ = this.eventsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor() {
    this.loadEvents();
    this.listenToUpdates();
  }

  private loadEvents(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<any[]>(`${this.API_URL}/events`).pipe(
      retry(2),
      catchError(err => {
        console.error('Error cargando eventos:', err);
        this.errorSubject.next('Error al cargar eventos. Verifica que el backend esté corriendo.');
        return of([]);
      })
    ).subscribe({
      next: (events) => {
        const mapped = events.map(e => this.mapEvent(e));
        this.eventsSubject.next(mapped);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
      }
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
              odds: update.odds ?? event.odds
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
      id: e._id || e.id,
      sport: e.sport || 'football',
      sportIcon: this.getSportIcon(e.sport),
      league: e.league || 'Liga',
      team1: e.team1 || 'Equipo 1',
      team2: e.team2 || 'Equipo 2',
      flag1: e.flag1 || '🏠',
      flag2: e.flag2 || '✈️',
      startTime: new Date(e.startTime),
      status: e.status || 'scheduled',
      score1: e.score1,
      score2: e.score2,
      minute: e.minute,
      period: e.period,
      odds: e.odds || { home: 1.5, draw: 3.5, away: 2.5 },
      imageUrl: e.imageUrl,
      featured: e.featured || false,
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

  // ✅ CORREGIDO - Usa operador map de RxJS
  getLiveEvents(): Observable<SportEvent[]> {
    return this.events$.pipe(
      map(events => events.filter(e => e.status === 'live'))
    );
  }

  // ✅ CORREGIDO
  getUpcomingEvents(): Observable<SportEvent[]> {
    return this.events$.pipe(
      map(events => events.filter(e => e.status === 'scheduled'))
    );
  }

  // ✅ CORREGIDO
  getFeaturedEvents(): Observable<SportEvent[]> {
    return this.events$.pipe(
      map(events => events.filter(e => e.featured))
    );
  }

  // ✅ CORREGIDO
  getAllEvents(): Observable<SportEvent[]> {
    return this.events$;
  }

  // ✅ CORREGIDO
  getEventById(id: string): Observable<SportEvent | undefined> {
    return this.events$.pipe(
      map(events => events.find(e => e.id === id))
    );
  }

  // ✅ NUEVO - Filtrar por deporte
  getEventsBySport(sport: string): Observable<SportEvent[]> {
    return this.events$.pipe(
      map(events => sport === 'all' ? events : events.filter(e => e.sport === sport))
    );
  }

  refreshEvents(): void {
    this.loadEvents();
  }
}