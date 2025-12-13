import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BetService } from '../../services/bet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bet-slip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toggle Button - Siempre visible cuando hay selecciones -->
    <button 
      *ngIf="slipCount > 0"
      (click)="toggleSlip()"
      class="fixed bottom-20 md:bottom-8 right-4 z-40 bg-indigo-600 hover:bg-indigo-700 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform"
      [class.scale-110]="isOpen">
      <i [class]="isOpen ? 'fas fa-times' : 'fas fa-receipt'" class="text-xl text-white"></i>
      <span class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold text-white">
        {{ slipCount }}
      </span>
    </button>

    <!-- Bet Slip Panel - Solo visible cuando isOpen es true -->
    <div 
      *ngIf="isOpen && slipCount > 0"
      class="fixed z-50 right-0 top-0 h-full w-full max-w-sm md:right-4 md:top-20 md:h-auto md:max-h-[calc(100vh-6rem)] md:rounded-2xl glass shadow-2xl flex flex-col animate-slide-in">
      
      <!-- Header -->
      <div class="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 class="font-bold text-lg flex items-center gap-2 text-white">
          <i class="fas fa-receipt text-indigo-400"></i>
          Cupón de Apuesta
          <span class="text-sm text-gray-400">({{ slipCount }})</span>
        </h3>
        <button (click)="isOpen = false" class="text-gray-400 hover:text-white transition">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Selections -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <ng-container *ngIf="betSlip$ | async as selections">
          <div *ngFor="let sel of selections" class="bg-gray-800/50 rounded-lg p-3">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <p class="text-sm text-gray-400">{{ sel.event.league }}</p>
                <p class="font-medium text-sm text-white">{{ sel.event.team1 }} vs {{ sel.event.team2 }}</p>
              </div>
              <button (click)="removeSelection(sel.eventId)" class="text-gray-500 hover:text-red-400 transition">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-indigo-400 text-sm">{{ sel.pickLabel }}</span>
              <span class="font-bold text-lg text-white">{{ sel.odds | number:'1.2-2' }}</span>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700 space-y-4">
        
        <!-- Stake Input -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Monto a apostar</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input 
              type="number" 
              [(ngModel)]="stake"
              min="1"
              [max]="maxStake"
              class="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-lg font-bold focus:border-indigo-500 outline-none"
              placeholder="0">
          </div>
          <div class="flex gap-2 mt-2">
            <button *ngFor="let amount of quickAmounts"
                    (click)="stake = amount"
                    [disabled]="amount > maxStake"
                    class="flex-1 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm transition disabled:opacity-50 text-white">
              \${{ amount }}
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Cuota total</span>
            <span class="font-bold text-indigo-400">{{ totalOdds | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-lg pt-2 border-t border-gray-700">
            <span class="text-gray-300">Retorno potencial</span>
            <span class="font-bold text-green-400">\${{ potentialWin | number:'1.0-0' }}</span>
          </div>
        </div>

        <!-- Messages -->
        <div *ngIf="error" class="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm text-center">
          <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
        </div>
        <div *ngIf="success" class="p-3 rounded-lg bg-green-500/20 text-green-400 text-sm text-center">
          <i class="fas fa-check-circle mr-2"></i>¡Apuesta realizada!
        </div>

        <!-- Buttons -->
        <button 
          (click)="placeBet()"
          [disabled]="!canPlaceBet || loading"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 font-bold text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <span *ngIf="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Procesando...' : 'Confirmar Apuesta' }}
        </button>

        <button 
          (click)="clearSlip()"
          [disabled]="loading"
          class="w-full py-2 text-gray-400 hover:text-white transition text-sm">
          <i class="fas fa-trash-alt mr-1"></i> Limpiar cupón
        </button>
      </div>
    </div>

    <!-- Backdrop for mobile -->
    <div *ngIf="isOpen && slipCount > 0" 
         (click)="isOpen = false"
         class="fixed inset-0 bg-black/50 z-40 md:hidden">
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class BetSlipComponent {
  private betService = inject(BetService);
  private authService = inject(AuthService);

  betSlip$ = this.betService.betSlip$;
  
  isOpen = false;
  stake = 100;
  loading = false;
  error = '';
  success = false;

  quickAmounts = [50, 100, 500, 1000];

  get slipCount(): number {
    return this.betService.slipCount;
  }

  get totalOdds(): number {
    return this.betService.totalOdds;
  }

  get potentialWin(): number {
    return Math.round(this.stake * this.totalOdds * 100) / 100;
  }

  get maxStake(): number {
    return this.authService.currentUser?.saldo || 0;
  }

  get canPlaceBet(): boolean {
    return this.stake > 0 && 
           this.stake <= this.maxStake && 
           this.slipCount > 0 &&
           this.authService.isLoggedIn &&
           !this.loading;
  }

  toggleSlip(): void {
    this.isOpen = !this.isOpen;
  }

  removeSelection(eventId: string): void {
    this.betService.removeFromSlip(eventId);
    if (this.slipCount === 0) {
      this.isOpen = false;
    }
  }

  clearSlip(): void {
    this.betService.clearSlip();
    this.isOpen = false;
    this.error = '';
    this.success = false;
  }

  placeBet(): void {
    if (!this.canPlaceBet) {
      if (!this.authService.isLoggedIn) {
        this.error = 'Debes iniciar sesión';
      } else if (this.stake > this.maxStake) {
        this.error = 'Saldo insuficiente';
      }
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    this.betService.placeBet(this.stake).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.stake = 100;
        
        setTimeout(() => {
          this.success = false;
          this.isOpen = false;
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al apostar';
      }
    });
  }
}