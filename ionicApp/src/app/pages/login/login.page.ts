import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mail, lockClosed, eye, eyeOff, gameController, arrowBack } from 'ionicons/icons';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="login-container">
        
        <!-- Back Button -->
        <button class="back-btn" routerLink="/tabs/home">
          <ion-icon name="arrow-back"></ion-icon>
        </button>
        
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo-box">
            <span class="logo-icon">🎲</span>
          </div>
          <h1 class="title">Bienvenido</h1>
          <p class="subtitle">Inicia sesión para continuar</p>
        </div>

        <!-- Form -->
        <div class="form-section">
          
          <!-- Email -->
          <div class="input-group">
            <ion-icon name="mail" class="input-icon"></ion-icon>
            <input 
              type="email" 
              [(ngModel)]="email" 
              placeholder="Email"
              class="form-input"
              autocomplete="email">
          </div>

          <!-- Password -->
          <div class="input-group">
            <ion-icon name="lock-closed" class="input-icon"></ion-icon>
            <input 
              [type]="showPassword ? 'text' : 'password'" 
              [(ngModel)]="password" 
              placeholder="Contraseña"
              class="form-input"
              autocomplete="current-password">
            <button class="toggle-pwd" (click)="showPassword = !showPassword">
              <ion-icon [name]="showPassword ? 'eye-off' : 'eye'"></ion-icon>
            </button>
          </div>

          <!-- Login Button -->
          <ion-button 
            expand="block" 
            class="login-btn"
            [disabled]="loading || !email || !password"
            (click)="login()">
            <ion-spinner *ngIf="loading" name="crescent" class="mr-2"></ion-spinner>
            {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
          </ion-button>

          <!-- Divider -->
          <div class="divider">
            <span>o</span>
          </div>

          <!-- Demo Button -->
          <ion-button 
            expand="block" 
            fill="outline"
            color="tertiary"
            class="demo-btn"
            (click)="loginDemo()">
            <ion-icon name="game-controller" slot="start"></ion-icon>
            Probar cuenta Demo
          </ion-button>

          <!-- Register Link -->
          <p class="register-link">
            ¿No tienes cuenta?
            <a routerLink="/register">Regístrate aquí</a>
          </p>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-container {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 24px;
      background: #111827;
    }
    
    .back-btn {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 40px;
      height: 40px;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      cursor: pointer;
    }
    .back-btn:active {
      background: #374151;
    }
    
    .logo-section {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo-box {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    
    .logo-icon {
      font-size: 40px;
    }
    
    .title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px;
    }
    
    .subtitle {
      font-size: 16px;
      color: #9ca3af;
      margin: 0;
    }
    
    .form-section {
      max-width: 400px;
      margin: 0 auto;
      width: 100%;
    }
    
    .input-group {
      position: relative;
      margin-bottom: 16px;
    }
    
    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      font-size: 20px;
    }
    
    .form-input {
      width: 100%;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 16px 16px 16px 50px;
      font-size: 16px;
      color: #ffffff;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus {
      border-color: #6366f1;
    }
    .form-input::placeholder {
      color: #6b7280;
    }
    
    .toggle-pwd {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: #6b7280;
      font-size: 20px;
      cursor: pointer;
    }
    
    .login-btn {
      --border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      margin-top: 8px;
    }
    
    .divider {
      display: flex;
      align-items: center;
      margin: 24px 0;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #374151;
    }
    .divider span {
      padding: 0 16px;
      color: #6b7280;
      font-size: 14px;
    }
    
    .demo-btn {
      --border-radius: 12px;
      font-weight: 600;
    }
    
    .register-link {
      text-align: center;
      margin-top: 24px;
      color: #9ca3af;
      font-size: 14px;
    }
    .register-link a {
      color: #818cf8;
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }
    
    .mr-2 {
      margin-right: 8px;
    }
  `]
})
export class LoginPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  email = '';
  password = '';
  showPassword = false;
  loading = false;

  constructor() { addIcons({ mail, lockClosed, eye, eyeOff, gameController, arrowBack }); }

  async login() {
    if (!this.email || !this.password) return;
    
    this.loading = true;
    const success = await this.api.login(this.email, this.password);
    this.loading = false;

    if (success) {
      this.router.navigate(['/tabs/home']);
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Credenciales inválidas',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  loginDemo() {
    this.email = 'demo@betpro.com';
    this.password = 'demo123';
    this.login();
  }
}