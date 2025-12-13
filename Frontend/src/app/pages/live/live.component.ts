import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { EventService } from '../../services/event.service';
import { BetService } from '../../services/bet.service';
import { SportEvent } from '../../models/event.model';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { EventDetailModalComponent } from '../../components/event-detail-modal/event-detail-modal.component';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule, EventCardComponent, EventDetailModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold flex items-center gap-3 text-white">
            <span class="relative">
              <i class="fas fa-broadcast-tower text-red-500"></i>
              <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            </span>
            Eventos En Vivo
          </h1>
          <p class="text-gray-400 mt-1">Apuesta en tiempo real</p>
        </div>
        <button (click)="refreshEvents()" class="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl transition text-white">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-400">Cargando eventos en vivo...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-500/20 border border-red-500 rounded-xl p-6 mb-6">
        <div class="flex items-center gap-3">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          <div>
            <h3 class="font-bold text-red-400">Error</h3>
            <p class="text-gray-400 text-sm">{{ error }}</p>
          </div>
          <button (click)="refreshEvents()" class="ml-auto bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition text-white">
            Reintentar
          </button>
        </div>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && !error">
        
        <!-- Sport Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-4 mb-6">
          <button 
            *ngFor="let sport of sports"
            (click)="selectedSport = sport.id"
            [class]="selectedSport === sport.id 
              ? 'bg-red-600 text-white border-red-500' 
              : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'"
            class="px-4 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap transition border">
            <i [class]="sport.icon"></i>
            <span>{{ sport.name }}</span>
            <span *ngIf="getSportCount(sport.id) > 0" class="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {{ getSportCount(sport.id) }}
            </span>
          </button>
        </div>

        <!-- Live Events Grid -->
        <div *ngIf="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <app-event-card 
            *ngFor="let event of filteredEvents; trackBy: trackByEventId"
            [event]="event"
            [isLive]="true"
            [isSelected]="isSelected"
            (selectOdd)="onSelectOdd($event.event, $event.pick, $event.odds)"
            (viewDetails)="openEventDetails($event)">
          </app-event-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredEvents.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-tv text-4xl text-gray-600"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-400 mb-2">No hay eventos en vivo</h3>
          <p class="text-gray-500 mb-6">
            {{ selectedSport === 'all' 
              ? 'No hay partidos en directo en este momento' 
              : 'No hay partidos de ' + getSelectedSportName() + ' en vivo' 
            }}
          </p>
          <button (click)="refreshEvents()" class="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold transition text-white">
            <i class="fas fa-sync-alt mr-2"></i>Actualizar
          </button>
        </div>
      </ng-container>

      <!-- Modal -->
      <app-event-detail-modal 
        *ngIf="showDetailModal && selectedEvent"
        [event]="selectedEvent"
        [isSelected]="isSelected"
        (close)="closeDetailModal()"
        (selectOdd)="onSelectOdd($event.event, $event.pick, $event.odds)">
      </app-event-detail-modal>
    </div>
  `
})
export class LiveComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private betService = inject(BetService);
  private destroy$ = new Subject<void>();

  liveEvents: SportEvent[] = [];
  loading = true;
  error: string | null = null;
  selectedSport = 'all';
  
  selectedEvent: SportEvent | null = null;
  showDetailModal = false;

  sports = [
    { id: 'all', name: 'Todos', icon: 'fas fa-trophy' },
    { id: 'football', name: 'Fútbol', icon: 'fas fa-futbol' },
    { id: 'basketball', name: 'Basket', icon: 'fas fa-basketball' },
    { id: 'tennis', name: 'Tenis', icon: 'fas fa-table-tennis-paddle-ball' },
    { id: 'esports', name: 'eSports', icon: 'fas fa-gamepad' }
  ];

  ngOnInit(): void {
    this.loadLiveEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLiveEvents(): void {
    this.loading = true;
    this.error = null;

    this.eventService.getLiveEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.liveEvents = events;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar eventos';
          this.loading = false;
          console.error(err);
        }
      });
  }

  get filteredEvents(): SportEvent[] {
    if (this.selectedSport === 'all') {
      return this.liveEvents;
    }
    return this.liveEvents.filter(e => e.sport === this.selectedSport);
  }

  getSportCount(sportId: string): number {
    if (sportId === 'all') return this.liveEvents.length;
    return this.liveEvents.filter(e => e.sport === sportId).length;
  }

  getSelectedSportName(): string {
    const sport = this.sports.find(s => s.id === this.selectedSport);
    return sport ? sport.name : 'este deporte';
  }

  onSelectOdd(event: SportEvent, pick: 'home' | 'draw' | 'away', odds: number): void {
    this.betService.addToSlip(event, pick, odds);
  }

  isSelected = (eventId: string, pick: string): boolean => {
    return this.betService.isSelected(eventId, pick);
  }

  openEventDetails(event: SportEvent): void {
    this.selectedEvent = event;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEvent = null;
  }

  refreshEvents(): void {
    this.loadLiveEvents();
  }

  trackByEventId(index: number, event: SportEvent): string {
    return event.id;
  }
}