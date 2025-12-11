// Frontend/src/app/components/result-overlay/result-overlay.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultOverlayService } from '../../services/result-overlay.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-result-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" 
         class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/50">
      <div class="text-center animate-slide-up">
        <div class="text-8xl mb-4">{{ won ? '🎉' : '😢' }}</div>
        <div class="text-4xl font-bold" [ngClass]="won ? 'text-green-400' : 'text-red-400'">
          {{ won ? '¡GANASTE!' : 'Perdiste' }}
        </div>
        <div class="text-2xl mt-2" [ngClass]="won ? 'text-green-400' : 'text-red-400'">
          {{ won ? '+' : '-' }}\${{ formattedAmount }}
        </div>
      </div>
    </div>
    
    <ng-container *ngIf="show && won">
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-50">
        <div *ngFor="let piece of confettiPieces" 
             class="confetti-piece"
             [style.left.vw]="piece.x"
             [style.background-color]="piece.color"
             [style.animation-delay.s]="piece.delay">
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class ResultOverlayComponent implements OnInit, OnDestroy {
  private service = inject(ResultOverlayService);
  private sub?: Subscription;

  show = false;
  won = false;
  amount = 0;
  
  confettiPieces: { x: number; color: string; delay: number }[] = [];
  private colors = ['#22c55e', '#f59e0b', '#ec4899', '#818cf8', '#14b8a6'];

  get formattedAmount(): string {
    return this.amount.toFixed(2);
  }

  ngOnInit(): void {
    this.sub = this.service.state$.subscribe(state => {
      this.show = state.show;
      this.won = state.won;
      this.amount = state.amount;
      
      if (state.show && state.won) {
        this.createConfetti();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private createConfetti(): void {
    this.confettiPieces = [];
    for (let i = 0; i < 50; i++) {
      this.confettiPieces.push({
        x: Math.random() * 100,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        delay: Math.random() * 0.5
      });
    }
  }
}