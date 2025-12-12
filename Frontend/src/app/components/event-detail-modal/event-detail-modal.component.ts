// Frontend/src/app/components/event-detail-modal/event-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportEvent } from '../../models/event.model';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeModal()">
      <div class="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up" (click)="$event.stopPropagation()">
        
        <!-- Header con imagen -->
        <div class="relative h-40 overflow-hidden">
          <img [src]="event.imageUrl" class="w-full h-full object-cover" [alt]="event.team1 + ' vs ' + event.team2">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          
          <button (click)="closeModal()" 
                  class="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition">
            <i class="fas fa-times"></i>
          </button>

          <div class="absolute bottom-4 left-4 right-4">
            <div class="flex items-center gap-2 mb-2">
              <span *ngIf="event.status === 'live'" 
                    class="bg-red-600 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                EN VIVO - {{ event.minute }}'
              </span>
              <span *ngIf="event.status === 'scheduled'" class="bg-indigo-600 px-2 py-1 rounded-full text-xs">
                {{ formatDate(event.startTime) }}
              </span>
              <span class="text-sm text-gray-300">{{ event.league }}</span>
            </div>
          </div>
        </div>

        <div class="p-6">
          <!-- Marcador -->
          <div class="flex items-center justify-between mb-6">
            <div class="text-center flex-1">
              <img [src]="'https://flagcdn.com/w80/' + event.flag1 + '.png'" 
                   class="w-14 h-10 object-cover rounded mx-auto mb-2" [alt]="event.team1">
              <h3 class="text-lg font-bold">{{ event.team1 }}</h3>
            </div>
            
            <div class="text-center px-6">
              <div *ngIf="event.status === 'live'" class="text-4xl font-black tabular-nums">
                {{ event.score1 }} - {{ event.score2 }}
              </div>
              <div *ngIf="event.status === 'scheduled'" class="text-2xl font-bold text-gray-400">
                VS
              </div>
              <div class="text-sm text-gray-400 mt-1">
                <span *ngIf="event.status === 'live'">{{ event.period || 'En juego' }}</span>
              </div>
            </div>
            
            <div class="text-center flex-1">
              <img [src]="'https://flagcdn.com/w80/' + event.flag2 + '.png'" 
                   class="w-14 h-10 object-cover rounded mx-auto mb-2" [alt]="event.team2">
              <h3 class="text-lg font-bold">{{ event.team2 }}</h3>
            </div>
          </div>

          <!-- Info de actualización -->
          <div class="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-3 mb-6 flex items-center gap-2">
            <i class="fas fa-sync-alt text-indigo-400" [class.animate-spin]="event.status === 'live'"></i>
            <span class="text-sm text-indigo-300">
              <span *ngIf="event.status === 'live'">Cuotas en tiempo real • Actualizado hace {{ lastUpdate }}s</span>
              <span *ngIf="event.status === 'scheduled'">Las cuotas pueden variar hasta el inicio del evento</span>
            </span>
          </div>

          <!-- Mercado principal -->
          <div class="mb-6">
            <h4 class="text-sm text-gray-400 mb-3 flex items-center gap-2">
              <i class="fas fa-bullseye"></i>
              RESULTADO FINAL
              <span class="text-xs text-indigo-400">(Click para añadir al cupón)</span>
            </h4>
            <div class="grid gap-3" [class.grid-cols-3]="event.odds.draw" [class.grid-cols-2]="!event.odds.draw">
              <button (click)="addToSlip('home')"
                      class="relative bg-gray-800 p-4 rounded-xl text-center transition-all hover:bg-gray-700 border-2"
                      [class.border-green-500]="isSelected('home')"
                      [class.border-transparent]="!isSelected('home')"
                      [class.bg-green-600/20]="isSelected('home')">
                <div class="absolute top-2 right-2" *ngIf="isSelected('home')">
                  <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="text-sm text-gray-400 mb-1">{{ event.team1 }}</div>
                <div class="text-2xl font-bold tabular-nums" [class.text-green-400]="event.status === 'live'">
                  {{ event.odds.home.toFixed(2) }}
                </div>
              </button>
              
              <button *ngIf="event.odds.draw"
                      (click)="addToSlip('draw')"
                      class="relative bg-gray-800 p-4 rounded-xl text-center transition-all hover:bg-gray-700 border-2"
                      [class.border-green-500]="isSelected('draw')"
                      [class.border-transparent]="!isSelected('draw')"
                      [class.bg-green-600/20]="isSelected('draw')">
                <div class="absolute top-2 right-2" *ngIf="isSelected('draw')">
                  <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="text-sm text-gray-400 mb-1">Empate</div>
                <div class="text-2xl font-bold tabular-nums" [class.text-green-400]="event.status === 'live'">
                  {{ event.odds.draw!.toFixed(2) }}
                </div>
              </button>
              
              <button (click)="addToSlip('away')"
                      class="relative bg-gray-800 p-4 rounded-xl text-center transition-all hover:bg-gray-700 border-2"
                      [class.border-green-500]="isSelected('away')"
                      [class.border-transparent]="!isSelected('away')"
                      [class.bg-green-600/20]="isSelected('away')">
                <div class="absolute top-2 right-2" *ngIf="isSelected('away')">
                  <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="text-sm text-gray-400 mb-1">{{ event.team2 }}</div>
                <div class="text-2xl font-bold tabular-nums" [class.text-green-400]="event.status === 'live'">
                  {{ event.odds.away.toFixed(2) }}
                </div>
              </button>
            </div>
          </div>

          <!-- Mensaje de selección -->
          <div *ngIf="showAddedMessage" 
               class="bg-green-600/20 border border-green-500/30 rounded-xl p-3 mb-4 flex items-center gap-2 animate-pulse">
            <i class="fas fa-check-circle text-green-400"></i>
            <span class="text-green-300">¡Añadido al cupón! Ve al cupón para confirmar tu apuesta.</span>
          </div>

          <!-- Estadísticas simuladas -->
          <div class="mb-4" *ngIf="event.status === 'live'">
            <h4 class="text-sm text-gray-400 mb-3 flex items-center gap-2">
              <i class="fas fa-chart-bar"></i>
              ESTADÍSTICAS DEL PARTIDO
            </h4>
            <div class="space-y-3 bg-gray-800/50 rounded-xl p-4">
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span>{{ stats.possession1 }}%</span>
                  <span class="text-gray-400">Posesión</span>
                  <span>{{ stats.possession2 }}%</span>
                </div>
                <div class="flex h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="bg-indigo-500 transition-all" [style.width.%]="stats.possession1"></div>
                  <div class="bg-purple-500 transition-all" [style.width.%]="stats.possession2"></div>
                </div>
              </div>
              
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span>{{ stats.shots1 }}</span>
                  <span class="text-gray-400">Tiros</span>
                  <span>{{ stats.shots2 }}</span>
                </div>
                <div class="flex h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="bg-green-500 transition-all" [style.width.%]="stats.shots1 * 5"></div>
                  <div class="bg-red-500 transition-all" [style.width.%]="stats.shots2 * 5"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de cerrar -->
          <button (click)="closeModal()" 
                  class="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-medium transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }
    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class EventDetailModalComponent {
  @Input() event!: SportEvent;
  @Output() close = new EventEmitter<void>();

  private betService = inject(BetService);

  lastUpdate = 0;
  showAddedMessage = false;
  stats = {
    possession1: Math.floor(Math.random() * 30) + 35,
    possession2: 0,
    shots1: Math.floor(Math.random() * 10) + 5,
    shots2: Math.floor(Math.random() * 10) + 5,
  };

  private updateInterval: any;

  constructor() {
    this.stats.possession2 = 100 - this.stats.possession1;
  }

  ngOnInit(): void {
    this.updateInterval = setInterval(() => {
      this.lastUpdate++;
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  addToSlip(pick: 'home' | 'draw' | 'away'): void {
    const odds = pick === 'home' ? this.event.odds.home : 
                 pick === 'away' ? this.event.odds.away : 
                 this.event.odds.draw!;
    this.betService.addToSlip(this.event, pick, odds);
    
    // Mostrar mensaje de confirmación
    this.showAddedMessage = true;
    setTimeout(() => {
      this.showAddedMessage = false;
    }, 3000);
  }

  isSelected(pick: string): boolean {
    return this.betService.isSelected(this.event.id, pick);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}