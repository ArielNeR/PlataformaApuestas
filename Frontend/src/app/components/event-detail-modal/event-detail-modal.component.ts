import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="close.emit()">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <!-- Modal -->
      <div class="relative glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" 
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="relative p-6 border-b border-gray-700">
          <button (click)="close.emit()" 
                  class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <i [class]="event.sportIcon"></i>
            <span>{{ event.league }}</span>
            <span *ngIf="event.status === 'live'" class="flex items-center gap-1 text-red-400 ml-2">
              <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              EN VIVO - {{ event.minute }}'
            </span>
          </div>
          
          <h2 class="text-xl font-bold">{{ event.team1 }} vs {{ event.team2 }}</h2>
        </div>

        <!-- Score (si está en vivo) -->
        <div *ngIf="event.status === 'live'" class="p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-gray-700">
          <div class="flex items-center justify-center gap-8">
            <div class="text-center">
              <div class="text-3xl mb-1">{{ event.flag1 }}</div>
              <p class="font-medium">{{ event.team1 }}</p>
            </div>
            <div class="text-center">
              <div class="text-5xl font-bold">{{ event.score1 }} - {{ event.score2 }}</div>
              <p class="text-sm text-gray-400 mt-1">{{ event.period || 'En juego' }}</p>
            </div>
            <div class="text-center">
              <div class="text-3xl mb-1">{{ event.flag2 }}</div>
              <p class="font-medium">{{ event.team2 }}</p>
            </div>
          </div>
        </div>

        <!-- Cuotas principales -->
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-sm font-semibold text-gray-400 mb-3">RESULTADO FINAL</h3>
          <div class="grid gap-3" [class]="event.odds.draw !== undefined ? 'grid-cols-3' : 'grid-cols-2'">
            <button (click)="onSelectOdd('home')"
                    [class]="isSelectedPick('home') ? 'bg-indigo-600 border-indigo-400' : 'bg-gray-800 border-gray-700 hover:border-indigo-500'"
                    class="p-4 rounded-xl border transition-all text-center">
              <div class="text-sm text-gray-400 mb-1">{{ event.team1 }}</div>
              <div class="text-2xl font-bold">{{ event.odds.home | number:'1.2-2' }}</div>
            </button>
            
            <button *ngIf="event.odds.draw !== undefined"
                    (click)="onSelectOdd('draw')"
                    [class]="isSelectedPick('draw') ? 'bg-indigo-600 border-indigo-400' : 'bg-gray-800 border-gray-700 hover:border-indigo-500'"
                    class="p-4 rounded-xl border transition-all text-center">
              <div class="text-sm text-gray-400 mb-1">Empate</div>
              <div class="text-2xl font-bold">{{ event.odds.draw | number:'1.2-2' }}</div>
            </button>
            
            <button (click)="onSelectOdd('away')"
                    [class]="isSelectedPick('away') ? 'bg-indigo-600 border-indigo-400' : 'bg-gray-800 border-gray-700 hover:border-indigo-500'"
                    class="p-4 rounded-xl border transition-all text-center">
              <div class="text-sm text-gray-400 mb-1">{{ event.team2 }}</div>
              <div class="text-2xl font-bold">{{ event.odds.away | number:'1.2-2' }}</div>
            </button>
          </div>
        </div>

        <!-- Estadísticas simuladas -->
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-sm font-semibold text-gray-400 mb-4">ESTADÍSTICAS</h3>
          
          <div class="space-y-4">
            <!-- Posesión -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>{{ stats.possession1 }}%</span>
                <span class="text-gray-400">Posesión</span>
                <span>{{ stats.possession2 }}%</span>
              </div>
              <div class="h-2 bg-gray-700 rounded-full overflow-hidden flex">
                <div class="bg-indigo-500 h-full" [style.width.%]="stats.possession1"></div>
                <div class="bg-purple-500 h-full" [style.width.%]="stats.possession2"></div>
              </div>
            </div>

            <!-- Tiros -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>{{ stats.shots1 }}</span>
                <span class="text-gray-400">Tiros</span>
                <span>{{ stats.shots2 }}</span>
              </div>
              <div class="h-2 bg-gray-700 rounded-full overflow-hidden flex">
                <div class="bg-indigo-500 h-full" [style.width.%]="getShotPercentage(1)"></div>
                <div class="bg-purple-500 h-full" [style.width.%]="getShotPercentage(2)"></div>
              </div>
            </div>

            <!-- Corners -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>{{ stats.corners1 }}</span>
                <span class="text-gray-400">Corners</span>
                <span>{{ stats.corners2 }}</span>
              </div>
              <div class="h-2 bg-gray-700 rounded-full overflow-hidden flex">
                <div class="bg-indigo-500 h-full" [style.width.%]="getCornerPercentage(1)"></div>
                <div class="bg-purple-500 h-full" [style.width.%]="getCornerPercentage(2)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del partido -->
        <div class="p-6">
          <h3 class="text-sm font-semibold text-gray-400 mb-3">INFORMACIÓN</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Fecha</span>
              <span>{{ event.startTime | date:'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Competición</span>
              <span>{{ event.league }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Estado</span>
              <span [class]="event.status === 'live' ? 'text-red-400' : 'text-green-400'">
                {{ event.status === 'live' ? 'En Vivo' : event.status === 'scheduled' ? 'Programado' : 'Finalizado' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes scale-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `]
})
export class EventDetailModalComponent {
  @Input() event!: SportEvent;
  @Input() isSelected!: (eventId: string, pick: string) => boolean;
  @Output() close = new EventEmitter<void>();
  @Output() selectOdd = new EventEmitter<{ event: SportEvent; pick: 'home' | 'draw' | 'away'; odds: number }>();

  // Estadísticas simuladas
  stats = {
    possession1: Math.floor(Math.random() * 30) + 35,
    possession2: 0,
    shots1: Math.floor(Math.random() * 10) + 5,
    shots2: Math.floor(Math.random() * 10) + 5,
    corners1: Math.floor(Math.random() * 8) + 2,
    corners2: Math.floor(Math.random() * 8) + 2,
  };

  constructor() {
    this.stats.possession2 = 100 - this.stats.possession1;
  }

  isSelectedPick(pick: string): boolean {
    return this.isSelected ? this.isSelected(this.event.id, pick) : false;
  }

  onSelectOdd(pick: 'home' | 'draw' | 'away'): void {
    const odds = pick === 'home' ? this.event.odds.home
               : pick === 'away' ? this.event.odds.away
               : this.event.odds.draw!;
    this.selectOdd.emit({ event: this.event, pick, odds });
  }

  getShotPercentage(team: 1 | 2): number {
    const total = this.stats.shots1 + this.stats.shots2;
    return team === 1 ? (this.stats.shots1 / total) * 100 : (this.stats.shots2 / total) * 100;
  }

  getCornerPercentage(team: 1 | 2): number {
    const total = this.stats.corners1 + this.stats.corners2;
    return team === 1 ? (this.stats.corners1 / total) * 100 : (this.stats.corners2 / total) * 100;
  }
}