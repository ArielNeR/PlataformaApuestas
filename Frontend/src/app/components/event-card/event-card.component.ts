// Frontend/src/app/components/event-card/event-card.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportEvent } from '../../models/event.model';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styles: []
})
export class EventCardComponent {
  @Input() event!: SportEvent;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  private betService = inject(BetService);

  addToSlip(pick: 'home' | 'draw' | 'away', odds: number, e: Event): void {
    e.stopPropagation();
    this.betService.addToSlip(this.event, pick, odds);
  }

  isSelected(pick: string): boolean {
    return this.betService.isSelected(this.event.id, pick);
  }

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/w40/${code}.png`;
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