import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ResultState {
  show: boolean;
  won: boolean;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class ResultOverlayService {
  private stateSubject = new BehaviorSubject<ResultState>({
    show: false,
    won: false,
    amount: 0
  });
  
  state$ = this.stateSubject.asObservable();

  showWin(amount: number): void {
    console.log('🎉 Overlay: Mostrando GANASTE', amount);
    this.stateSubject.next({
      show: true,
      won: true,
      amount: amount || 0
    });
    setTimeout(() => this.hide(), 5000);
  }

  showLoss(amount: number): void {
    console.log('😢 Overlay: Mostrando PERDISTE', amount);
    this.stateSubject.next({
      show: true,
      won: false,
      amount: amount || 0
    });
    setTimeout(() => this.hide(), 5000);
  }

  hide(): void {
    this.stateSubject.next({
      show: false,
      won: false,
      amount: 0
    });
  }
}