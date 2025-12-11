// Frontend/src/app/pages/home/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { SportEvent } from '../../models/event.model';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { SportFilterComponent } from '../../components/sport-filter/sport-filter.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCardComponent, SportFilterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private eventService = inject(EventService);

  liveEvents: SportEvent[] = [];
  upcomingEvents: SportEvent[] = [];
  popularEvents: SportEvent[] = [];
  selectedSport = 'all';

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.eventService.getLiveEvents().subscribe(events => {
      this.liveEvents = events;
    });

    this.eventService.getUpcomingEvents().subscribe(events => {
      this.upcomingEvents = events;
    });

    this.eventService.getFeaturedEvents().subscribe(events => {
      this.popularEvents = events;
    });
  }

  onSportChange(sport: string): void {
    this.selectedSport = sport;
    // Filtrar eventos si es necesario
  }
}