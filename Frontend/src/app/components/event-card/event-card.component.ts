// Frontend/src/app/components/event-card/event-card.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportEvent } from '../../models/event.model';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass rounded-2xl overflow-hidden card-hover cursor-pointer"
         [class.w-72]="size === 'small'"
         [class.flex-shrink-0]="size === 'small'"
         (click)="onCardClick()">
      
      <!-- Header con gradiente -->
      <div class="relative p-4"
           [class.h-32]="size === 'small'"
           [class.h-40]="size !== 'small'"
           [ngClass]="event.status === 'live' ? 'bg-gradient-to-br from-red-600/30 to-orange-600/30' : 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30'">
        
        <!-- Badge -->
        <div class="absolute top-3 left-3">
          <ng-container *ngIf="event.status === 'live'">
            <div class="flex items-center gap-2 bg-red-600/80 px-2 py-1 rounded-full text-xs">
              <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>{{ event.minute }}'</span>
            </div>
          </ng-container>
          <ng-container *ngIf="event.status === 'scheduled'">
            <div class="bg-indigo-600/80 px-2 py-1 rounded-full text-xs">
              {{ formatTime(event.startTime) }}
            </div>
          </ng-container>
        </div>

        <!-- Liga y Deporte -->
        <div class="absolute top-3 right-3 flex items-center gap-2">
          <span class="text-xs text-gray-300">{{ event.league }}</span>
        </div>

        <!-- Teams con layout fijo -->
        <div class="flex items-center justify-between mt-8" [class.mt-8]="size === 'small'" [class.mt-10]="size !== 'small'">
          <!-- Equipo 1 -->
          <div class="text-center flex-1 min-w-0">
            <div class="w-10 h-7 mx-auto mb-1 flex items-center justify-center" [class.w-12]="size !== 'small'" [class.h-8]="size !== 'small'">
              <img [src]="getTeamImage(event.team1, event.flag1)" 
                   class="max-w-full max-h-full object-contain rounded"
                   [alt]="event.team1"
                   (error)="onImageError($event, event.flag1)">
            </div>
            <p class="font-medium truncate px-1" [class.text-sm]="size === 'small'">{{ getShortName(event.team1) }}</p>
          </div>
          
          <!-- Marcador con ancho fijo -->
          <div class="text-center px-2 min-w-[80px]" [class.min-w-[100px]]="size !== 'small'">
            <ng-container *ngIf="event.status === 'live'">
              <p class="font-bold tabular-nums" [class.text-xl]="size === 'small'" [class.text-2xl]="size !== 'small'">
                {{ formatScore(event.score1) }} - {{ formatScore(event.score2) }}
              </p>
              <p class="text-xs text-gray-400 mt-1" *ngIf="event.period">{{ event.period }}</p>
            </ng-container>
            <ng-container *ngIf="event.status === 'scheduled'">
              <p class="font-bold text-gray-400" [class.text-lg]="size === 'small'" [class.text-xl]="size !== 'small'">VS</p>
            </ng-container>
          </div>
          
          <!-- Equipo 2 -->
          <div class="text-center flex-1 min-w-0">
            <div class="w-10 h-7 mx-auto mb-1 flex items-center justify-center" [class.w-12]="size !== 'small'" [class.h-8]="size !== 'small'">
              <img [src]="getTeamImage(event.team2, event.flag2)" 
                   class="max-w-full max-h-full object-contain rounded"
                   [alt]="event.team2"
                   (error)="onImageError($event, event.flag2)">
            </div>
            <p class="font-medium truncate px-1" [class.text-sm]="size === 'small'">{{ getShortName(event.team2) }}</p>
          </div>
        </div>
      </div>

      <!-- Cuotas -->
      <div class="p-3 flex gap-2">
        <button class="odds-btn flex-1 bg-gray-800 py-2 rounded-lg text-center min-w-0"
                [class.selected]="isSelected('home')"
                (click)="addToSlip('home', event.odds.home, $event)">
          <span class="text-xs text-gray-400 block">1</span>
          <span class="font-bold tabular-nums" [class.text-green-400]="event.status === 'live'">
            {{ event.odds.home.toFixed(2) }}
          </span>
        </button>
        
        <button *ngIf="event.odds.draw !== undefined"
                class="odds-btn flex-1 bg-gray-800 py-2 rounded-lg text-center min-w-0"
                [class.selected]="isSelected('draw')"
                (click)="addToSlip('draw', event.odds.draw!, $event)">
          <span class="text-xs text-gray-400 block">X</span>
          <span class="font-bold tabular-nums" [class.text-green-400]="event.status === 'live'">
            {{ event.odds.draw!.toFixed(2) }}
          </span>
        </button>
        
        <button class="odds-btn flex-1 bg-gray-800 py-2 rounded-lg text-center min-w-0"
                [class.selected]="isSelected('away')"
                (click)="addToSlip('away', event.odds.away, $event)">
          <span class="text-xs text-gray-400 block">2</span>
          <span class="font-bold tabular-nums" [class.text-green-400]="event.status === 'live'">
            {{ event.odds.away.toFixed(2) }}
          </span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }
  `]
})
export class EventCardComponent {
  @Input() event!: SportEvent;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() cardClick = new EventEmitter<SportEvent>();

  private betService = inject(BetService);

  // Mapeo de equipos a imágenes/logos
  private teamLogos: Record<string, string> = {
    'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    'LA Lakers': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
    'Golden State Warriors': 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
  };

  onCardClick(): void {
    this.cardClick.emit(this.event);
  }

  addToSlip(pick: 'home' | 'draw' | 'away', odds: number, e: Event): void {
    e.stopPropagation();
    this.betService.addToSlip(this.event, pick, odds);
  }

  isSelected(pick: string): boolean {
    return this.betService.isSelected(this.event.id, pick);
  }

  getTeamImage(teamName: string, flagCode: string): string {
    // Intentar obtener logo del equipo, si no existe usar bandera
    if (this.teamLogos[teamName]) {
      return this.teamLogos[teamName];
    }
    return `https://flagcdn.com/w40/${flagCode}.png`;
  }

  onImageError(event: Event, flagCode: string): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://flagcdn.com/w40/${flagCode}.png`;
  }

  getShortName(name: string): string {
    // Acortar nombres largos
    const shortNames: Record<string, string> = {
      'Manchester United': 'Man United',
      'Golden State Warriors': 'Warriors',
      'LA Lakers': 'Lakers',
      'Rafael Nadal': 'Nadal',
      'Novak Djokovic': 'Djokovic',
      'Bayern Munich': 'Bayern',
      'Canelo Alvarez': 'Canelo',
      'Dmitry Bivol': 'Bivol',
    };
    return shortNames[name] || name;
  }

  formatScore(score: number | string | undefined): string {
    if (score === undefined) return '0';
    return String(score).padStart(1, '0');
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Hoy ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    }
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
  }
}