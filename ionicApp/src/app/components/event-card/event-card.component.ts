import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonRippleEffect } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, time } from 'ionicons/icons';
import { ApiService, SportEvent } from '../../services/api.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, IonIcon, IonRippleEffect],
  template: `
    <div class="event-card" [class.live]="isLive || event.status === 'live'" [class.featured]="featured">
      <!-- Header -->
      <div class="card-header">
        <div class="league-info">
          <ion-icon [name]="event.sportIcon"></ion-icon>
          <span>{{ event.league }}</span>
        </div>
        <div class="time-info">
          <ng-container *ngIf="event.status === 'live'; else scheduled">
            <span class="live-indicator">
              <span class="live-dot"></span>
              {{ getTimeDisplay() }}
            </span>
          </ng-container>
          <ng-template #scheduled>
            <span class="scheduled-time">{{ formattedDate }} {{ formattedTime }}</span>
          </ng-template>
          <ion-icon *ngIf="featured" name="star" class="star-icon"></ion-icon>
        </div>
      </div>

      <!-- Teams -->
      <div class="teams-container">
        <!-- Team 1 -->
        <div class="team">
          <div class="team-logo">
            <img [src]="event.flag1" [alt]="event.team1" (error)="onImgError($event, event.team1)">
          </div>
          <span class="team-name">{{ event.team1 }}</span>
        </div>

        <!-- Score / VS -->
        <div class="score-container">
          <ng-container *ngIf="event.status === 'live'; else vsLabel">
            <div class="score-box">
              <span class="score">{{ event.score1 }} - {{ event.score2 }}</span>
              <span *ngIf="event.period" class="period">{{ event.period }}</span>
            </div>
          </ng-container>
          <ng-template #vsLabel>
            <span class="vs-label">VS</span>
          </ng-template>
        </div>

        <!-- Team 2 -->
        <div class="team">
          <div class="team-logo">
            <img [src]="event.flag2" [alt]="event.team2" (error)="onImgError($event, event.team2)">
          </div>
          <span class="team-name">{{ event.team2 }}</span>
        </div>
      </div>

      <!-- Odds -->
      <div class="odds-container" [class.two-cols]="event.odds.draw === undefined">
        <button 
          class="odd-btn ion-activatable"
          [class.selected]="isOddSelected('home')"
          (click)="selectOdd('home', event.odds.home)">
          <span class="odd-label">1</span>
          <span class="odd-value">{{ event.odds.home | number:'1.2-2' }}</span>
          <ion-ripple-effect></ion-ripple-effect>
        </button>

        <button 
          *ngIf="event.odds.draw !== undefined"
          class="odd-btn ion-activatable"
          [class.selected]="isOddSelected('draw')"
          (click)="selectOdd('draw', event.odds.draw!)">
          <span class="odd-label">X</span>
          <span class="odd-value">{{ event.odds.draw | number:'1.2-2' }}</span>
          <ion-ripple-effect></ion-ripple-effect>
        </button>

        <button 
          class="odd-btn ion-activatable"
          [class.selected]="isOddSelected('away')"
          (click)="selectOdd('away', event.odds.away)">
          <span class="odd-label">2</span>
          <span class="odd-value">{{ event.odds.away | number:'1.2-2' }}</span>
          <ion-ripple-effect></ion-ripple-effect>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .event-card {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    
    .event-card.live {
      border-color: rgba(239, 68, 68, 0.5);
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }
    
    .event-card.featured {
      border-color: rgba(234, 179, 8, 0.5);
      box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.2);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(55, 65, 81, 0.5);
    }
    
    .league-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #9ca3af;
      font-size: 13px;
    }
    
    .league-info ion-icon {
      color: #818cf8;
      font-size: 16px;
    }
    
    .time-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .live-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #f87171;
      font-size: 13px;
      font-weight: 500;
    }
    
    .live-dot {
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .scheduled-time {
      color: #9ca3af;
      font-size: 12px;
    }
    
    .star-icon {
      color: #facc15;
      font-size: 14px;
    }
    
    .teams-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
    }
    
    .team {
      flex: 1;
      text-align: center;
    }
    
    .team-logo {
      width: 48px;
      height: 48px;
      margin: 0 auto 8px;
      background: #374151;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 6px;
    }
    
    .team-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .team-name {
      color: #ffffff;
      font-size: 12px;
      font-weight: 500;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 4px;
    }
    
    .score-container {
      padding: 0 12px;
    }
    
    .score-box {
      background: #374151;
      border-radius: 8px;
      padding: 8px 16px;
      text-align: center;
      min-width: 80px;
    }
    
    .score {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      display: block;
    }
    
    .period {
      font-size: 10px;
      color: #9ca3af;
    }
    
    .vs-label {
      color: #6b7280;
      font-weight: 700;
      font-size: 14px;
    }
    
    .odds-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 0 16px 16px;
    }
    
    .odds-container.two-cols {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .odd-btn {
      position: relative;
      overflow: hidden;
      background: rgba(55, 65, 81, 0.5);
      border: 1px solid #4b5563;
      border-radius: 10px;
      padding: 10px 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .odd-btn:active {
      transform: scale(0.98);
    }
    
    .odd-btn.selected {
      background: #6366f1;
      border-color: #818cf8;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
    }
    
    .odd-label {
      display: block;
      font-size: 10px;
      color: #9ca3af;
      margin-bottom: 2px;
    }
    
    .odd-btn.selected .odd-label {
      color: rgba(255,255,255,0.7);
    }
    
    .odd-value {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #818cf8;
    }
    
    .odd-btn.selected .odd-value {
      color: #ffffff;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class EventCardComponent {
  private api = inject(ApiService);
  
  @Input() event!: SportEvent;
  @Input() featured = false;
  @Input() isLive = false;
  @Output() onSelect = new EventEmitter<{ event: SportEvent; pick: 'home' | 'draw' | 'away'; odds: number }>();

  constructor() { addIcons({ star, time }); }

  selectOdd(pick: 'home' | 'draw' | 'away', odds: number) {
    this.onSelect.emit({ event: this.event, pick, odds });
  }

  isOddSelected(pick: string): boolean {
    return this.api.isSelected(this.event.id, pick);
  }

  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=374151&color=fff&size=80`;
  }

  getTimeDisplay(): string {
    const minute = this.event.minute || 0;
    if (this.event.sport === 'basketball') return this.event.period || `${minute}'`;
    if (this.event.sport === 'tennis') return this.event.period || 'En juego';
    return `${minute}'`;
  }

  get formattedTime(): string {
    return new Date(this.event.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  get formattedDate(): string {
    const date = new Date(this.event.startTime);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  }
}