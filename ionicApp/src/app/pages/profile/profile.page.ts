import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonChip, IonList, IonItem, IonLabel, AlertController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOut, person, wallet, statsChart, ticket, settings, add, chevronForward } from 'ionicons/icons';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonChip, IonList, IonItem, IonLabel],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="font-bold">Mi Perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="p-4">
        
        <!-- Not Logged In -->
        <div *ngIf="!user" class="not-logged-in">
          <div class="avatar-placeholder">
            <ion-icon name="person"></ion-icon>
          </div>
          <h2 class="text-xl font-bold text-gray-400 mb-2">No has iniciado sesión</h2>
          <p class="text-gray-500 mb-6">Inicia sesión para ver tu perfil</p>
          <div class="auth-buttons">
            <ion-button expand="block" routerLink="/login" color="primary" class="font-bold mb-3">
              Iniciar Sesión
            </ion-button>
            <ion-button expand="block" routerLink="/register" fill="outline" color="primary" class="font-bold">
              Crear Cuenta
            </ion-button>
          </div>
        </div>

        <!-- Logged In -->
        <div *ngIf="user">
          
          <!-- User Card -->
          <div class="user-card">
            <div class="user-avatar">
              <span>{{ user.username[0].toUpperCase() }}</span>
            </div>
            <div class="user-info">
              <h2 class="user-name">{{ user.username }}</h2>
              <p class="user-email">{{ user.email }}</p>
              <ion-chip *ngIf="user.esDemo" color="warning" class="demo-chip">DEMO</ion-chip>
            </div>
          </div>

          <!-- Balance Card -->
          <div class="balance-card">
            <div class="balance-info">
              <span class="balance-label">Saldo disponible</span>
              <span class="balance-value">\${{ user.saldo | number:'1.0-0' }}</span>
            </div>
            <ion-button color="success" (click)="deposit()" class="deposit-btn">
              <ion-icon name="add" slot="start"></ion-icon>
              Depositar
            </ion-button>
          </div>

          <!-- Menu Items -->
          <div class="menu-section">
            <button class="menu-item" (click)="showComingSoon()">
              <div class="menu-icon bg-indigo-500/20">
                <ion-icon name="ticket" class="text-indigo-400"></ion-icon>
              </div>
              <span class="menu-label">Mis Apuestas</span>
              <ion-icon name="chevron-forward" class="menu-arrow"></ion-icon>
            </button>

            <button class="menu-item" (click)="showComingSoon()">
              <div class="menu-icon bg-green-500/20">
                <ion-icon name="stats-chart" class="text-green-400"></ion-icon>
              </div>
              <span class="menu-label">Estadísticas</span>
              <ion-icon name="chevron-forward" class="menu-arrow"></ion-icon>
            </button>

            <button class="menu-item" (click)="showComingSoon()">
              <div class="menu-icon bg-gray-500/20">
                <ion-icon name="settings" class="text-gray-400"></ion-icon>
              </div>
              <span class="menu-label">Configuración</span>
              <ion-icon name="chevron-forward" class="menu-arrow"></ion-icon>
            </button>

            <button class="menu-item logout" (click)="logout()">
              <div class="menu-icon bg-red-500/20">
                <ion-icon name="log-out" class="text-red-400"></ion-icon>
              </div>
              <span class="menu-label text-red-400">Cerrar Sesión</span>
              <ion-icon name="chevron-forward" class="menu-arrow text-red-400"></ion-icon>
            </button>
          </div>

          <!-- App Info -->
          <div class="app-info">
            <p>BetPro Mobile v1.0.0</p>
            <p>© 2024 BetPro. Todos los derechos reservados.</p>
          </div>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .not-logged-in {
      text-align: center;
      padding: 60px 20px;
    }
    
    .avatar-placeholder {
      width: 100px;
      height: 100px;
      background: #374151;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .avatar-placeholder ion-icon {
      font-size: 50px;
      color: #6b7280;
    }
    
    .auth-buttons {
      max-width: 280px;
      margin: 0 auto;
    }
    
    .user-card {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .user-avatar {
      width: 64px;
      height: 64px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      color: white;
    }
    
    .user-info {
      flex: 1;
    }
    
    .user-name {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin: 0 0 4px;
    }
    
    .user-email {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      margin: 0;
    }
    
    .demo-chip {
      margin-top: 8px;
      font-size: 11px;
      height: 24px;
    }
    
    .balance-card {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    
    .balance-label {
      display: block;
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    
    .balance-value {
      font-size: 32px;
      font-weight: 700;
      color: #4ade80;
    }
    
    .deposit-btn {
      --border-radius: 10px;
      font-weight: 600;
    }
    
    .menu-section {
      margin-bottom: 24px;
    }
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .menu-item:active {
      background: #374151;
    }
    
    .menu-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .menu-icon ion-icon {
      font-size: 20px;
    }
    
    .menu-label {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
      color: #ffffff;
      text-align: left;
    }
    
    .menu-arrow {
      color: #6b7280;
      font-size: 18px;
    }
    
    .app-info {
      text-align: center;
      padding: 20px;
    }
    .app-info p {
      font-size: 12px;
      color: #6b7280;
      margin: 4px 0;
    }
  `]
})
export class ProfilePage implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private destroy$ = new Subject<void>();

  user: any = null;

  constructor() { addIcons({ logOut, person, wallet, statsChart, ticket, settings, add, chevronForward }); }

  ngOnInit() {
    this.api.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  async deposit() {
    const alert = await this.alertCtrl.create({
      header: 'Depositar Fondos',
      inputs: [
        { name: 'amount', type: 'number', placeholder: 'Monto a depositar', min: 1 }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Depositar', 
          handler: async (data) => {
            const amount = parseFloat(data.amount);
            if (amount > 0) {
              this.api.updateBalance(this.user.saldo + amount);
              const toast = await this.toastCtrl.create({
                message: `¡Depósito de \$${amount} realizado!`,
                duration: 2000,
                color: 'success',
                position: 'top'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async showComingSoon() {
    const toast = await this.toastCtrl.create({
      message: 'Próximamente disponible',
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: '¿Cerrar sesión?',
      message: 'Se cerrará tu sesión actual',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Sí, salir', 
          role: 'confirm', 
          handler: async () => {
            await this.api.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}