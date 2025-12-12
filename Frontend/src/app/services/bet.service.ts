// Frontend/src/app/services/bet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError } from 'rxjs';
import { BetSelection } from '../models/bet.model';
import { SportEvent } from '../models/event.model';
import { AuthService } from './auth.service';
import { ResultOverlayService } from './result-overlay.service';

@Injectable({ providedIn: 'root' })
export class BetService {
  private readonly API_URL = 'http://localhost:3000';
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private resultService = inject(ResultOverlayService);

  private betSlipSubject = new BehaviorSubject<BetSelection[]>([]);
  betSlip$ = this.betSlipSubject.asObservable();

  private statsSubject = new BehaviorSubject<any>({
    totalBets: 0,
    won: 0,
    lost: 0,
    pending: 0,
    profit: 0,
    totalStaked: 0,
    winRate: 0,
    roi: '0'
  });
  stats$ = this.statsSubject.asObservable();

  constructor() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadStats();
      } else {
        this.statsSubject.next({
          totalBets: 0, won: 0, lost: 0, pending: 0,
          profit: 0, totalStaked: 0, winRate: 0, roi: '0'
        });
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private loadStats(): void {
    if (!this.authService.isLoggedIn) return;

    this.http.get(`${this.API_URL}/bets/stats`, { headers: this.getHeaders() })
      .pipe(catchError(() => of({
        totalBets: 0, won: 0, lost: 0, pending: 0,
        profit: 0, totalStaked: 0, winRate: 0, roi: '0'
      })))
      .subscribe(stats => this.statsSubject.next(stats));
  }

  addToSlip(event: SportEvent, pick: 'home' | 'draw' | 'away', odds: number): void {
    const current = this.betSlipSubject.value;
    const existingIndex = current.findIndex(s => s.eventId === event.id);
    
    const pickLabel = pick === 'home' ? event.team1 : pick === 'away' ? event.team2 : 'Empate';
    const selection: BetSelection = { eventId: event.id, event, pick, odds, pickLabel };

    if (existingIndex >= 0) {
      if (current[existingIndex].pick === pick) {
        current.splice(existingIndex, 1);
      } else {
        current[existingIndex] = selection;
      }
    } else {
      current.push(selection);
    }

    this.betSlipSubject.next([...current]);
  }

  removeFromSlip(eventId: string): void {
    const filtered = this.betSlipSubject.value.filter(s => s.eventId !== eventId);
    this.betSlipSubject.next(filtered);
  }

  clearSlip(): void {
    this.betSlipSubject.next([]);
  }

  get slipCount(): number {
    return this.betSlipSubject.value.length;
  }

  get totalOdds(): number {
    const odds = this.betSlipSubject.value.reduce((acc, s) => acc * s.odds, 1);
    return Math.round(odds * 100) / 100;
  }

  isSelected(eventId: string, pick: string): boolean {
    const selection = this.betSlipSubject.value.find(s => s.eventId === eventId);
    return selection?.pick === pick;
  }

  placeBet(stake: number): Observable<any> {
    const selections = this.betSlipSubject.value;
    const totalOdds = this.totalOdds;
    const potentialWin = stake * totalOdds;

    const body = {
      selections: selections.map(s => ({
        eventId: s.eventId,
        eventName: `${s.event.team1} vs ${s.event.team2}`,
        market: 'Resultado Final',
        pick: s.pick,
        pickLabel: s.pickLabel,
        odds: s.odds,
      })),
      stake,
      totalOdds,
      potentialWin,
    };

    return this.http.post(`${this.API_URL}/bets`, body, { headers: this.getHeaders() }).pipe(
      tap((response: any) => {
        this.clearSlip();
        this.authService.updateBalance(response.newBalance);
        this.loadStats();
        
        // Simular resultado después de 5 segundos
        setTimeout(() => {
          this.simulateBetResult(response.bet._id, stake, potentialWin);
        }, 5000);
      }),
      catchError(err => {
        console.error('Error al realizar apuesta:', err);
        throw err;
      })
    );
  }

  private simulateBetResult(betId: string, stake: number, potentialWin: number): void {
    this.http.post<any>(`${this.API_URL}/bets/${betId}/simulate`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: (result) => {
          // Mostrar resultado
          if (result.won) {
            this.resultService.showWin(potentialWin - stake);
          } else {
            this.resultService.showLoss(stake);
          }
          
          // Refrescar datos del usuario
          this.refreshUserData();
          this.loadStats();
        },
        error: (err) => console.error('Error simulando resultado:', err)
      });
  }

  private refreshUserData(): void {
    this.http.get<any>(`${this.API_URL}/auth/me`, { headers: this.getHeaders() })
      .subscribe({
        next: (userData) => {
          if (userData) {
            this.authService.updateBalance(userData.saldo);
          }
        },
        error: (err) => console.error('Error refrescando usuario:', err)
      });
  }

  getBetHistory(): Observable<any[]> {
    if (!this.authService.isLoggedIn) {
      return of([]);
    }
    return this.http.get<any[]>(`${this.API_URL}/bets`, { headers: this.getHeaders() }).pipe(
      catchError(() => of([]))
    );
  }

  getStats(): any {
    return this.statsSubject.value;
  }

  refreshStats(): void {
    this.loadStats();
  }
}