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
         class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div class="text-center animate-slide-up" [class.scale-100]="show">
        <div class="text-8xl mb-4">{{ won ? '🎉' : '😢' }}</div>
        <div class="text-4xl font-bold" [class.text-green-400]="won" [class.text-red-400]="!won">
          {{ won ? '¡GANASTE!' : 'Perdiste' }}
        </div>
        <div class="text-2xl mt-2" [class.text-green-400]="won" [class.text-red-400]="!won">
          {{ won ? '+' : '-' }}${{ amount.toFixed(2) }}
        </div>
      </div>
    </div>
    
    <!-- Confetti -->
    <div *ngIf="show && won" class="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <div *ngFor="let i of confettiPieces" 
           class="confetti-piece"
           [style.left.vw]="i.x"
           [style.background-color]="i.color"
           [style.animation-delay.s]="i.delay">
      </div>
    </div>
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