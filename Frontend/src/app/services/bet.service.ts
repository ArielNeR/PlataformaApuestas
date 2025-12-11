// Frontend/src/app/services/bet.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { BetSelection, Bet, BetHistoryItem } from '../models/bet.model';
import { SportEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class BetService {
  private betSlipSubject = new BehaviorSubject<BetSelection[]>([]);
  betSlip$ = this.betSlipSubject.asObservable();

  private betHistorySubject = new BehaviorSubject<Bet[]>([]);
  betHistory$ = this.betHistorySubject.asObservable();

  // Mock historial
  private mockHistory: BetHistoryItem[] = [
    { event: 'Real Madrid vs Atlético', pick: 'Real Madrid', odds: 1.85, amount: 50, result: 'won', profit: 42.50 },
    { event: 'Lakers vs Celtics', pick: 'Lakers', odds: 2.10, amount: 30, result: 'lost', profit: -30 },
    { event: 'Nadal vs Alcaraz', pick: 'Nadal', odds: 2.30, amount: 25, result: 'won', profit: 32.50 },
    { event: 'Man City vs Arsenal', pick: 'Empate', odds: 3.50, amount: 20, result: 'lost', profit: -20 },
    { event: 'Barcelona vs Sevilla', pick: 'Barcelona', odds: 1.55, amount: 100, result: 'won', profit: 55 },
  ];

  constructor() {}

  addToSlip(event: SportEvent, pick: 'home' | 'draw' | 'away', odds: number): void {
    const current = this.betSlipSubject.value;
    const existingIndex = current.findIndex(s => s.eventId === event.id);
    
    const pickLabel = pick === 'home' ? event.team1 : pick === 'away' ? event.team2 : 'Empate';
    const selection: BetSelection = { eventId: event.id, event, pick, odds, pickLabel };

    if (existingIndex >= 0) {
      if (current[existingIndex].pick === pick) {
        // Remover si es la misma selección
        current.splice(existingIndex, 1);
      } else {
        // Reemplazar con nueva selección
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
    return this.betSlipSubject.value.reduce((acc, s) => acc * s.odds, 1);
  }

  isSelected(eventId: string, pick: string): boolean {
    const selection = this.betSlipSubject.value.find(s => s.eventId === eventId);
    return selection?.pick === pick;
  }

  placeBet(stake: number): Observable<{ won: boolean; amount: number }> {
    const selections = this.betSlipSubject.value;
    const totalOdds = this.totalOdds;
    const potentialWin = stake * totalOdds;
    
    // Simular resultado (40% probabilidad de ganar)
    const won = Math.random() > 0.4;
    const amount = won ? potentialWin - stake : stake;

    // Agregar al historial
    if (selections.length > 0) {
      const historyItem: BetHistoryItem = {
        event: selections.map(s => `${s.event.team1} vs ${s.event.team2}`).join(', '),
        pick: selections.map(s => s.pickLabel).join(', '),
        odds: totalOdds,
        amount: stake,
        result: won ? 'won' : 'lost',
        profit: won ? potentialWin - stake : -stake
      };
      this.mockHistory.unshift(historyItem);
    }

    this.clearSlip();
    return of({ won, amount }).pipe(delay(2000));
  }

  getBetHistory(): BetHistoryItem[] {
    return this.mockHistory;
  }

  getStats() {
    const history = this.mockHistory;
    const won = history.filter(b => b.result === 'won');
    const lost = history.filter(b => b.result === 'lost');
    const totalProfit = history.reduce((acc, b) => acc + b.profit, 0);
    const totalStaked = history.reduce((acc, b) => acc + b.amount, 0);

    return {
      totalBets: history.length,
      won: won.length,
      lost: lost.length,
      pending: 0,
      profit: totalProfit,
      totalStaked,
      winRate: history.length > 0 ? Math.round((won.length / history.length) * 100) : 0,
      roi: totalStaked > 0 ? ((totalProfit / totalStaked) * 100).toFixed(1) : '0'
    };
  }
}