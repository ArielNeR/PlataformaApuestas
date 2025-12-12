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
  templateUrl: './live.component.html'
})
export class LiveComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private betService = inject(BetService);
  private destroy$ = new Subject<void>();

  liveEvents: SportEvent[] = [];
  loading = true;
  error: string | null = null;
  selectedSport = 'all';

  // Modal
  selectedEvent: SportEvent | null = null;
  showDetailModal = false;

  sports = [
    { id: 'all', name: 'Todos', icon: 'fas fa-trophy', count: 0 },
    { id: 'football', name: 'Fútbol', icon: 'fas fa-futbol', count: 0 },
    { id: 'basketball', name: 'Basket', icon: 'fas fa-basketball', count: 0 },
    { id: 'tennis', name: 'Tenis', icon: 'fas fa-table-tennis-paddle-ball', count: 0 },
    { id: 'esports', name: 'eSports', icon: 'fas fa-gamepad', count: 0 }
  ];

  ngOnInit(): void {
    this.eventService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.eventService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    this.eventService.getLiveEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => {
        this.liveEvents = events;
        this.updateSportCounts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSportCounts(): void {
    this.sports = this.sports.map(sport => ({
      ...sport,
      count: sport.id === 'all' 
        ? this.liveEvents.length 
        : this.liveEvents.filter(e => e.sport === sport.id).length
    }));
  }

  filterBySport(sportId: string): void {
    this.selectedSport = sportId;
  }

  get filteredEvents(): SportEvent[] {
    if (this.selectedSport === 'all') {
      return this.liveEvents;
    }
    return this.liveEvents.filter(e => e.sport === this.selectedSport);
  }

  get selectedSportName(): string {
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
    this.eventService.refreshEvents();
  }

  trackByEventId(index: number, event: SportEvent): string {
    return event.id;
  }
}