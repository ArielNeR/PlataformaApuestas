// Frontend/src/app/components/simulation-modal/simulation-modal.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        
        <div class="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 class="text-xl font-bold flex items-center gap-3">
            <i class="fas fa-clock-rotate-left text-green-400"></i>
            Simulación de Apuestas
          </h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-white transition">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="p-6">
          <div class="mb-6">
            <p class="text-gray-400 mb-4">Simula cómo habrían resultado tus apuestas en partidos históricos</p>
            
            <div class="flex gap-4 mb-6">
              <button *ngFor="let s of speeds"
                      (click)="setSpeed(s)"
                      class="px-4 py-2 rounded-lg text-sm transition"
                      [class.bg-indigo-600]="speed === s"
                      [class.bg-gray-700]="speed !== s">
                {{ s }}x
              </button>
            </div>
          </div>

          <div class="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <img src="https://flagcdn.com/w40/es.png" class="w-8 h-6 object-cover rounded" alt="España">
                <span>Real Madrid</span>
              </div>
              <span class="text-3xl font-bold">{{ score1 }}</span>
            </div>
            
            <div class="h-2 bg-gray-700 rounded-full mb-4">
              <div class="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                   [style.width.%]="progress"></div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img src="https://flagcdn.com/w40/es.png" class="w-8 h-6 object-cover rounded" alt="España">
                <span>Barcelona</span>
              </div>
              <span class="text-3xl font-bold">{{ score2 }}</span>
            </div>
          </div>

          <div class="text-center">
            <p class="text-gray-400 mb-2">Tu apuesta: <span class="text-white font-bold">Real Madrid &#64; 2.10</span></p>
            <p class="text-gray-400 mb-4">Monto: <span class="text-white font-bold">&#36;50</span></p>
            
            <div *ngIf="result" class="text-2xl font-bold"
                 [class.text-green-400]="result === 'won'"
                 [class.text-red-400]="result === 'lost'">
              {{ result === 'won' ? '¡Tu apuesta GANÓ! +$55' : 'Tu apuesta perdió -$50' }}
            </div>
          </div>

          <button (click)="startSimulation()"
                  [disabled]="isRunning"
                  class="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-4 rounded-xl font-bold mt-6 hover:opacity-90 transition disabled:opacity-50">
            <i class="fas fa-play mr-2"></i> 
            {{ isRunning ? 'Simulando...' : 'Iniciar Simulación' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class SimulationModalComponent {
  @Output() close = new EventEmitter<void>();

  speed = 2;
  progress = 0;
  score1 = 0;
  score2 = 0;
  isRunning = false;
  result: 'won' | 'lost' | null = null;

  speeds = [1, 2, 5];

  setSpeed(s: number): void {
    this.speed = s;
  }

  startSimulation(): void {
    this.isRunning = true;
    this.progress = 0;
    this.score1 = 0;
    this.score2 = 0;
    this.result = null;

    const interval = setInterval(() => {
      this.progress += this.speed;

      if (Math.random() < 0.05 * this.speed) {
        if (Math.random() > 0.5) {
          this.score1++;
        } else {
          this.score2++;
        }
      }

      if (this.progress >= 100) {
        clearInterval(interval);
        this.isRunning = false;
        this.result = this.score1 > this.score2 ? 'won' : 'lost';
      }
    }, 100);
  }

  closeModal(): void {
    this.close.emit();
  }
}