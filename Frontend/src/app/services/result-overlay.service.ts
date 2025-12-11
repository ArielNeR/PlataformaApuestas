// Frontend/src/app/services/result-overlay.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ResultState {
  show: boolean;
  won: boolean;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class ResultOverlayService {
  private stateSubject = new BehaviorSubject<ResultState>({ show: false, won: false, amount: 0 });
  state$ = this.stateSubject.asObservable();

  showWin(amount: number): void {
    this.stateSubject.next({ show: true, won: true, amount });
    setTimeout(() => this.hide(), 3500);
  }

  showLoss(amount: number): void {
    this.stateSubject.next({ show: true, won: false, amount });
    setTimeout(() => this.hide(), 3500);
  }

  private hide(): void {
    this.stateSubject.next({ show: false, won: false, amount: 0 });
  }
}