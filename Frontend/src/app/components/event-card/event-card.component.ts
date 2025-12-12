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

  // Mapa de equipos a logos (URLs de ejemplo - puedes usar APIs reales)
  private teamLogos: Record<string, string> = {
    'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
    'PSG': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg',
    'Chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    'Arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    'LA Lakers': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
    'Boston Celtics': 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
  };

  // Mapa de países/ligas a banderas emoji
  private countryFlags: Record<string, string> = {
    'España': '🇪🇸',
    'Spain': '🇪🇸',
    'La Liga': '🇪🇸',
    'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Alemania': '🇩🇪',
    'Germany': '🇩🇪',
    'Bundesliga': '🇩🇪',
    'Italia': '🇮🇹',
    'Italy': '🇮🇹',
    'Serie A': '🇮🇹',
    'Francia': '🇫🇷',
    'France': '🇫🇷',
    'Ligue 1': '🇫🇷',
    'USA': '🇺🇸',
    'NBA': '🇺🇸',
    'ATP': '🎾',
    'WTA': '🎾',
  };

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

  getTeamLogo(teamName: string): string | null {
    return this.teamLogos[teamName] || null;
  }

  onImageError(event: Event, fallbackEmoji: string): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // El emoji de fallback se mostrará automáticamente por el *ngIf
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

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    }
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  }
}