import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html'
})
export class EventCardComponent {
  @Input() event!: SportEvent;
  @Input() featured = false;
  @Input() isLive = false;
  @Input() isSelected!: (eventId: string, pick: string) => boolean;

  @Output() selectOdd = new EventEmitter<{
    event: SportEvent;
    pick: 'home' | 'draw' | 'away';
    odds: number;
  }>();

  @Output() viewDetails = new EventEmitter<SportEvent>();

  onSelectOdd(pick: 'home' | 'draw' | 'away'): void {
    const odds = pick === 'home' ? this.event.odds.home 
               : pick === 'away' ? this.event.odds.away 
               : this.event.odds.draw!;
    this.selectOdd.emit({ event: this.event, pick, odds });
  }

  openDetails(): void {
    this.viewDetails.emit(this.event);
  }

  checkSelected(pick: string): boolean {
    return this.isSelected ? this.isSelected(this.event.id, pick) : false;
  }

  getTimeDisplay(): string {
    const minute = typeof this.event.minute === 'number' ? this.event.minute : 0;
    const period = this.event.period || '';
    
    switch (this.event.sport) {
      case 'basketball':
        return period ? `${period} - ${minute}'` : `${minute}'`;
      case 'tennis':
        return period || 'En juego';
      case 'boxing':
        return period || `R${Math.ceil(minute / 3)}`;
      case 'esports':
        return `${minute}'`;
      case 'football':
      default:
        return `${minute}'`;
    }
  }

  get formattedTime(): string {
    return new Date(this.event.startTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get formattedDate(): string {
    const date = new Date(this.event.startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  }
}