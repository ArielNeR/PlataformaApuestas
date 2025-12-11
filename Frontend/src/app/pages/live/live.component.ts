// Frontend/src/app/pages/live/live.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { SportEvent } from '../../models/event.model';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { SportFilterComponent } from '../../components/sport-filter/sport-filter.component';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule, EventCardComponent, SportFilterComponent],
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss']
})
export class LiveComponent implements OnInit {
  private eventService = inject(EventService);

  liveEvents: SportEvent[] = [];
  filteredEvents: SportEvent[] = [];
  isLoading = true;
  selectedSport = 'all';

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.eventService.getLiveEvents().subscribe(events => {
      this.liveEvents = events;
      this.filteredEvents = events;
      this.isLoading = false;
    });
  }

  onSportChange(sport: string): void {
    this.selectedSport = sport;
    if (sport === 'all') {
      this.filteredEvents = this.liveEvents;
    } else {
      this.filteredEvents = this.liveEvents.filter(e => e.sport === sport);
    }
  }
}