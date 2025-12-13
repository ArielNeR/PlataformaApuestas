import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonLabel, IonIcon, IonSpinner, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { football, basketball, tennisball, gameController, trophy, refreshOutline } from 'ionicons/icons';
import { Subject, takeUntil } from 'rxjs';
import { ApiService, SportEvent } from '../../services/api.service';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonLabel, IonIcon, IonSpinner, IonBadge, EventCardComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>
          <div class="flex items-center gap-2">
            <span class="live-dot"></span>
            <span class="font-bold">En Vivo</span>
            <ion-badge *ngIf="liveEvents.length" color="danger">{{ liveEvents.length }}</ion-badge>
          </div>
        </ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="selectedSport" (ionChange)="onSportChange($event)" scrollable>
          <ion-segment-button value="all">
            <ion-icon name="trophy"></ion-icon>
            <ion-label>Todos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="football">
            <ion-icon name="football"></ion-icon>
            <ion-label>Fútbol</ion-label>
          </ion-segment-button>
          <ion-segment-button value="basketball">
            <ion-icon name="basketball"></ion-icon>
            <ion-label>NBA</ion-label>
          </ion-segment-button>
          <ion-segment-button value="tennis">
            <ion-icon name="tennisball"></ion-icon>
            <ion-label>Tenis</ion-label>
          </ion-segment-button>
          <ion-segment-button value="esports">
            <ion-icon name="game-controller"></ion-icon>
            <ion-label>eSports</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="p-4">
        <div *ngIf="loading" class="flex justify-center py-10">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <div *ngIf="!loading" class="space-y-3">
          <app-event-card 
            *ngFor="let event of filteredEvents"
            [event]="event"
            [isLive]="true"
            (onSelect)="onSelectOdd($event)">
          </app-event-card>
        </div>

        <div *ngIf="!loading && filteredEvents.length === 0" class="empty-state">
          <div class="text-6xl mb-4">📺</div>
          <p class="text-gray-400 text-lg mb-2">No hay eventos en vivo</p>
          <p class="text-gray-500 text-sm">Vuelve más tarde</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .live-dot {
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .space-y-3 > *:not(:last-child) { margin-bottom: 12px; }
    .empty-state { text-align: center; padding: 60px 20px; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  `]
})
export class LivePage implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private destroy$ = new Subject<void>();

  liveEvents: SportEvent[] = [];
  selectedSport = 'all';
  loading = true;

  constructor() { addIcons({ football, basketball, tennisball, gameController, trophy, refreshOutline }); }

  ngOnInit() {
    this.api.events$.pipe(takeUntil(this.destroy$)).subscribe(events => {
      this.liveEvents = events.filter(e => e.status === 'live');
      this.loading = false;
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  get filteredEvents() {
    if (this.selectedSport === 'all') return this.liveEvents;
    return this.liveEvents.filter(e => e.sport === this.selectedSport);
  }

  onSportChange(event: any) { this.selectedSport = event.detail.value; }

  onSelectOdd(data: any) { this.api.addToSlip(data.event, data.pick, data.odds); }

  doRefresh(event: any) { this.api.loadEvents(); setTimeout(() => event.target.complete(), 1000); }
}