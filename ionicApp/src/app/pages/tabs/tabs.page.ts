import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, flash, receipt, person } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home">
          <ion-icon name="home"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="live">
          <ion-icon name="flash" color="danger"></ion-icon>
          <ion-label>En Vivo</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="bet-slip">
          <ion-icon name="receipt"></ion-icon>
          <ion-label>Cupón</ion-label>
          <ion-badge *ngIf="api.slipCount > 0" color="danger">{{ api.slipCount }}</ion-badge>
        </ion-tab-button>

        <ion-tab-button tab="profile">
          <ion-icon name="person"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `
})
export class TabsPage {
  api = inject(ApiService);
  constructor() { addIcons({ home, flash, receipt, person }); }
}