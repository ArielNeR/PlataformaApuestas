import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonButton, IonIcon, IonChip, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flash, star, refreshOutline, arrowForward } from 'ionicons/icons';
import { Subject, takeUntil } from 'rxjs';
import { ApiService, SportEvent } from '../../services/api.service';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonButton, IonIcon, IonChip, IonSpinner, EventCardComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎲</span>
            <span class="font-bold gradient-text">BetPro</span>
          </div>
        </ion-title>
        <ion-chip *ngIf="user" slot="end" color="success" class="mr-4 font-bold">
          \${{ user.saldo | number:'1.0-0' }}
        </ion-chip>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="p-4">
        <!-- Hero Banner - Igual al Frontend -->
        <div class="hero-card rounded-2xl overflow-hidden mb-6">
          <div class="hero-bg"></div>
          <div class="hero-content p-5 relative z-10">
            <!-- Live Badge -->
            <div class="flex items-center gap-2 mb-3">
              <span class="live-badge">
                <span class="live-dot"></span>
                EN VIVO
              </span>
              <span class="text-white/70 text-sm">{{ liveEvents.length }} eventos</span>
            </div>
            
            <!-- Title -->
            <h1 class="text-3xl font-bold text-white mb-2">
              ¡Bienvenido a <span class="text-yellow-400">BetPro</span>!
            </h1>
            <p class="text-white/70 mb-5">Las mejores cuotas en deportes y eSports</p>
            
            <!-- Buttons -->
            <div class="flex gap-3 mb-5">
              <ion-button routerLink="/tabs/live" color="danger" class="font-bold">
                <ion-icon name="flash" slot="start"></ion-icon>
                Ver En Vivo
              </ion-button>
            </div>

            <!-- Stats -->
            <div class="stats-bar">
              <div class="stat-item">
                <span class="stat-value text-yellow-400">{{ liveEvents.length }}</span>
                <span class="stat-label">En Vivo</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value text-green-400">{{ allEvents.length }}</span>
                <span class="stat-label">Eventos</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value text-indigo-400">5</span>
                <span class="stat-label">Deportes</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex justify-center py-10">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <!-- Live Events -->
        <section *ngIf="!loading && liveEvents.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="live-dot-small"></span>
              En Vivo Ahora
              <span class="text-gray-400 text-sm font-normal">({{ liveEvents.length }})</span>
            </h2>
            <a routerLink="/tabs/live" class="text-indigo-400 text-sm flex items-center gap-1">
              Ver todos
              <ion-icon name="arrow-forward"></ion-icon>
            </a>
          </div>
          <div class="space-y-3">
            <app-event-card 
              *ngFor="let event of liveEvents.slice(0, 3)"
              [event]="event"
              [isLive]="true"
              (onSelect)="onSelectOdd($event)">
            </app-event-card>
          </div>
        </section>

        <!-- Featured Events -->
        <section *ngIf="!loading && featuredEvents.length > 0" class="mb-6">
          <h2 class="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <ion-icon name="star" class="text-yellow-400"></ion-icon>
            Eventos Destacados
          </h2>
          <div class="space-y-3">
            <app-event-card 
              *ngFor="let event of featuredEvents.slice(0, 4)"
              [event]="event"
              [featured]="true"
              (onSelect)="onSelectOdd($event)">
            </app-event-card>
          </div>
        </section>

        <!-- Upcoming Events -->
        <section *ngIf="!loading && upcomingEvents.length > 0">
          <h2 class="text-xl font-bold text-white mb-4">Próximos Eventos</h2>
          <div class="space-y-3">
            <app-event-card 
              *ngFor="let event of upcomingEvents"
              [event]="event"
              (onSelect)="onSelectOdd($event)">
            </app-event-card>
          </div>
        </section>

        <!-- Empty -->
        <div *ngIf="!loading && allEvents.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">🏆</div>
          <p class="text-gray-400 text-lg">No hay eventos disponibles</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .gradient-text {
      background: linear-gradient(135deg, #818cf8, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .hero-card {
      position: relative;
      background: linear-gradient(135deg, #166534, #15803d, #059669);
      min-height: 280px;
    }
    
    .hero-bg {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='60' viewBox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='100' height='60' fill='none' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3Cline x1='50' y1='0' x2='50' y2='60' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='50' cy='30' r='10' fill='none' stroke='white' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E");
      background-size: 100% 100%;
    }
    
    .hero-content::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3), transparent);
      z-index: -1;
    }
    
    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ef4444;
      color: white;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
    }
    
    .live-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .live-dot-small {
      width: 10px;
      height: 10px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .stats-bar {
      display: flex;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 12px 16px;
    }
    
    .stat-item {
      flex: 1;
      text-align: center;
    }
    
    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 11px;
      color: #9ca3af;
    }
    
    .stat-divider {
      width: 1px;
      background: #4b5563;
      margin: 0 8px;
    }
    
    .space-y-3 > *:not(:last-child) {
      margin-bottom: 12px;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class HomePage implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private destroy$ = new Subject<void>();

  user: any = null;
  allEvents: SportEvent[] = [];
  loading = true;

  constructor() { addIcons({ flash, star, refreshOutline, arrowForward }); }

  ngOnInit() {
    this.api.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
    this.api.events$.pipe(takeUntil(this.destroy$)).subscribe(events => {
      this.allEvents = events;
      this.loading = false;
    });
    this.api.loadEvents();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  get liveEvents() { return this.allEvents.filter(e => e.status === 'live'); }
  get featuredEvents() { return this.allEvents.filter(e => e.featured); }
  get upcomingEvents() { return this.allEvents.filter(e => e.status === 'scheduled'); }

  onSelectOdd(data: { event: SportEvent; pick: 'home' | 'draw' | 'away'; odds: number }) {
    this.api.addToSlip(data.event, data.pick, data.odds);
  }

  doRefresh(event: any) {
    this.api.loadEvents();
    setTimeout(() => event.target.complete(), 1000);
  }
}