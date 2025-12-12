import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { EventService } from '../../services/event.service';
import { BetService } from '../../services/bet.service';
import { SportEvent } from '../../models/event.model';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { EventDetailModalComponent } from '../../components/event-detail-modal/event-detail-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCardComponent, EventDetailModalComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private betService = inject(BetService);
  private destroy$ = new Subject<void>();

  featuredEvents: SportEvent[] = [];
  upcomingEvents: SportEvent[] = [];
  liveEvents: SportEvent[] = [];
  allEvents: SportEvent[] = [];
  
  loading = true;
  error: string | null = null;
  selectedSport = 'all';
  
  // Modal
  selectedEvent: SportEvent | null = null;
  showDetailModal = false;

  sports = [
    { id: 'all', name: 'Todos', icon: 'fas fa-trophy' },
    { id: 'football', name: 'Fútbol', icon: 'fas fa-futbol' },
    { id: 'basketball', name: 'Basket', icon: 'fas fa-basketball' },
    { id: 'tennis', name: 'Tenis', icon: 'fas fa-table-tennis-paddle-ball' },
    { id: 'esports', name: 'eSports', icon: 'fas fa-gamepad' },
    { id: 'boxing', name: 'Boxeo', icon: 'fas fa-hand-fist' }
  ];

  ngOnInit(): void {
    this.eventService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.eventService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    combineLatest([
      this.eventService.getFeaturedEvents(),
      this.eventService.getLiveEvents(),
      this.eventService.getUpcomingEvents(),
      this.eventService.getAllEvents()
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([featured, live, upcoming, all]) => {
      this.featuredEvents = featured;
      this.liveEvents = live;
      this.upcomingEvents = upcoming;
      this.allEvents = all;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filterBySport(sportId: string): void {
    this.selectedSport = sportId;
  }

  get filteredEvents(): SportEvent[] {
    if (this.selectedSport === 'all') {
      return this.allEvents;
    }
    return this.allEvents.filter(e => e.sport === this.selectedSport);
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