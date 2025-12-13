import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonChip, IonNote, AlertController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, close, checkmark, warning, arrowForward, receipt } from 'ionicons/icons';
import { Subject, takeUntil } from 'rxjs';
import { ApiService, BetSelection } from '../../services/api.service';

@Component({
  selector: 'app-bet-slip',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonChip, IonNote],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>
          <div class="flex items-center gap-2">
            <ion-icon name="receipt" class="text-indigo-400"></ion-icon>
            <span class="font-bold">Cupón de Apuesta</span>
          </div>
        </ion-title>
        <ion-button *ngIf="selections.length > 0" slot="end" fill="clear" (click)="clearAll()">
          <ion-icon name="trash" slot="icon-only" color="danger"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="p-4">
        
        <!-- Empty State -->
        <div *ngIf="selections.length === 0" class="empty-state">
          <div class="empty-icon">🎫</div>
          <h2 class="text-xl font-bold text-gray-400 mb-2">Cupón vacío</h2>
          <p class="text-gray-500 mb-6">Selecciona cuotas para apostar</p>
          <ion-button routerLink="/tabs/home" color="primary" class="font-bold">
            <ion-icon name="arrow-forward" slot="start"></ion-icon>
            Ver Eventos
          </ion-button>
        </div>

        <!-- Selections -->
        <div *ngIf="selections.length > 0">
          
          <!-- Selection Cards -->
          <div class="selections-list">
            <div *ngFor="let sel of selections" class="selection-card">
              <div class="selection-header">
                <div class="selection-info">
                  <span class="league-name">{{ sel.event.league }}</span>
                  <span class="match-name">{{ sel.event.team1 }} vs {{ sel.event.team2 }}</span>
                </div>
                <button class="remove-btn" (click)="remove(sel.eventId)">
                  <ion-icon name="close"></ion-icon>
                </button>
              </div>
              <div class="selection-footer">
                <ion-chip color="primary" class="pick-chip">{{ sel.pickLabel }}</ion-chip>
                <span class="odds-value">{{ sel.odds | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Stake Input Card -->
          <div class="stake-card">
            <label class="stake-label">Monto a apostar</label>
            <div class="stake-input-wrapper">
              <span class="currency-symbol">$</span>
              <input 
                type="number" 
                [(ngModel)]="stake" 
                class="stake-input"
                placeholder="100"
                [min]="1"
                [max]="maxStake">
            </div>
            
            <!-- Quick Amounts -->
            <div class="quick-amounts">
              <button 
                *ngFor="let amount of quickAmounts"
                class="quick-btn"
                [class.disabled]="amount > maxStake"
                [disabled]="amount > maxStake"
                (click)="stake = amount">
                \${{ amount }}
              </button>
            </div>
          </div>

          <!-- Summary Card -->
          <div class="summary-card">
            <div class="summary-row">
              <span class="summary-label">Selecciones</span>
              <span class="summary-value">{{ selections.length }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Cuota total</span>
              <span class="summary-value text-indigo-400 font-bold">{{ totalOdds | number:'1.2-2' }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row large">
              <span class="summary-label">Retorno potencial</span>
              <span class="summary-value text-green-400">\${{ potentialWin | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Warning if not logged in -->
          <div *ngIf="!isLoggedIn" class="warning-box">
            <ion-icon name="warning" class="warning-icon"></ion-icon>
            <span>Inicia sesión para apostar</span>
          </div>

          <!-- Place Bet Button -->
          <ion-button 
            expand="block" 
            class="place-bet-btn"
            [disabled]="!canPlaceBet || loading"
            (click)="placeBet()"
            color="success">
            <ion-icon *ngIf="!loading" name="checkmark" slot="start"></ion-icon>
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Procesando...' : 'Confirmar Apuesta' }}
          </ion-button>

          <!-- Success Message -->
          <div *ngIf="success" class="success-box">
            <ion-icon name="checkmark" class="success-icon"></ion-icon>
            <span>¡Apuesta realizada! Esperando resultado...</span>
          </div>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }
    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    
    .selections-list {
      margin-bottom: 16px;
    }
    
    .selection-card {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 10px;
    }
    
    .selection-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    
    .selection-info {
      flex: 1;
    }
    
    .league-name {
      display: block;
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    
    .match-name {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
    }
    
    .remove-btn {
      background: transparent;
      border: none;
      color: #6b7280;
      font-size: 20px;
      padding: 4px;
      cursor: pointer;
    }
    .remove-btn:active {
      color: #ef4444;
    }
    
    .selection-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .pick-chip {
      margin: 0;
      font-size: 12px;
      height: 26px;
    }
    
    .odds-value {
      font-size: 18px;
      font-weight: 700;
      color: #818cf8;
    }
    
    .stake-card {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .stake-label {
      display: block;
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 10px;
    }
    
    .stake-input-wrapper {
      display: flex;
      align-items: center;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 10px;
      padding: 0 16px;
      margin-bottom: 12px;
    }
    
    .currency-symbol {
      font-size: 20px;
      font-weight: 600;
      color: #9ca3af;
      margin-right: 8px;
    }
    
    .stake-input {
      flex: 1;
      background: transparent;
      border: none;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      padding: 12px 0;
      outline: none;
    }
    .stake-input::placeholder {
      color: #4b5563;
    }
    
    .quick-amounts {
      display: flex;
      gap: 8px;
    }
    
    .quick-btn {
      flex: 1;
      background: #374151;
      border: 1px solid #4b5563;
      border-radius: 8px;
      padding: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quick-btn:active {
      background: #4b5563;
    }
    .quick-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .summary-card {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .summary-row.large {
      margin-bottom: 0;
    }
    .summary-row.large .summary-label {
      font-size: 16px;
      color: #d1d5db;
    }
    .summary-row.large .summary-value {
      font-size: 22px;
      font-weight: 700;
    }
    
    .summary-label {
      font-size: 14px;
      color: #9ca3af;
    }
    
    .summary-value {
      font-size: 14px;
      color: #ffffff;
    }
    
    .summary-divider {
      height: 1px;
      background: #374151;
      margin: 12px 0;
    }
    
    .warning-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(234, 179, 8, 0.15);
      border: 1px solid rgba(234, 179, 8, 0.3);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .warning-icon {
      color: #eab308;
      font-size: 20px;
    }
    .warning-box span {
      color: #eab308;
      font-size: 14px;
    }
    
    .place-bet-btn {
      --border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 12px;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }
    
    .success-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 10px;
      padding: 14px;
    }
    .success-icon {
      color: #22c55e;
      font-size: 20px;
    }
    .success-box span {
      color: #22c55e;
      font-size: 14px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class BetSlipPage implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  selections: BetSelection[] = [];
  stake = 100;
  loading = false;
  success = false;
  user: any = null;

  quickAmounts = [50, 100, 500, 1000];

  constructor() { addIcons({ trash, close, checkmark, warning, arrowForward, receipt }); }

  ngOnInit() {
    this.api.betSlip$.pipe(takeUntil(this.destroy$)).subscribe(s => this.selections = s);
    this.api.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  get totalOdds() { return this.api.totalOdds; }
  get potentialWin() { return Math.round(this.stake * this.totalOdds * 100) / 100; }
  get maxStake() { return this.user?.saldo || 0; }
  get isLoggedIn() { return !!this.user; }
  get canPlaceBet() {
    return this.isLoggedIn && this.stake > 0 && this.stake <= this.maxStake && this.selections.length > 0;
  }

  remove(eventId: string) {
    this.api.removeFromSlip(eventId);
  }

  async clearAll() {
    const alert = await this.alertCtrl.create({
      header: '¿Limpiar cupón?',
      message: 'Se eliminarán todas las selecciones',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Limpiar', role: 'confirm', handler: () => this.api.clearSlip() }
      ]
    });
    await alert.present();
  }

  async placeBet() {
    if (!this.canPlaceBet) {
      if (!this.isLoggedIn) {
        this.router.navigate(['/login']);
      }
      return;
    }

    this.loading = true;
    this.success = false;
    
    const result = await this.api.placeBet(this.stake);
    this.loading = false;

    if (result.success) {
      this.success = true;
      this.stake = 100;
      
      const toast = await this.toastCtrl.create({
        message: '¡Apuesta realizada con éxito!',
        duration: 3000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      setTimeout(() => { this.success = false; }, 5000);
    } else {
      const toast = await this.toastCtrl.create({
        message: result.message || 'Error al realizar apuesta',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }
}