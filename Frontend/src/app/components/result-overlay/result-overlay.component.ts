import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultOverlayService } from '../../services/result-overlay.service';

@Component({
  selector: 'app-result-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="resultService.state$ | async as state">
      <div *ngIf="state.show" 
           class="fixed inset-0 z-[100] flex items-center justify-center p-4"
           (click)="resultService.hide()">
        
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <!-- Content -->
        <div class="relative z-10" (click)="$event.stopPropagation()">
          
          <!-- Win State -->
          <div *ngIf="state.won" class="text-center">
            <div class="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
              <i class="fas fa-trophy text-5xl text-white"></i>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold text-green-400 mb-4">¡GANASTE!</h2>
            <div class="bg-green-500/20 border border-green-500/50 rounded-2xl px-8 py-4 mb-6">
              <p class="text-sm text-green-300 mb-1">Ganancia neta</p>
              <p class="text-4xl font-bold text-green-400">+$<span>{{ formatAmount(state.amount) }}</span></p>
            </div>
            <div class="flex justify-center gap-2 text-3xl">
              🎉🎊🏆🎊🎉
            </div>
          </div>

          <!-- Loss State -->
          <div *ngIf="!state.won" class="text-center">
            <div class="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50">
              <i class="fas fa-times text-5xl text-white"></i>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold text-red-400 mb-4">PERDISTE</h2>
            <div class="bg-red-500/20 border border-red-500/50 rounded-2xl px-8 py-4 mb-6">
              <p class="text-sm text-red-300 mb-1">Pérdida</p>
              <p class="text-4xl font-bold text-red-400">-$<span>{{ formatAmount(state.amount) }}</span></p>
            </div>
            <p class="text-gray-400">¡Mejor suerte la próxima!</p>
          </div>

          <!-- Close -->
          <p class="text-center text-gray-500 text-sm mt-6">Toca para cerrar</p>
        </div>
      </div>
    </ng-container>
  `
})
export class ResultOverlayComponent {
  resultService = inject(ResultOverlayService);

  formatAmount(amount: number | undefined | null): string {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0';
    }
    return Math.abs(amount).toFixed(0);
  }
}