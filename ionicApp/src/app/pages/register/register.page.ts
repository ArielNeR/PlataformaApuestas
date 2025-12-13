import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mail, lockClosed, person, eye, eyeOff, arrowBack } from 'ionicons/icons';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="register-container">
        
        <!-- Back Button -->
        <button class="back-btn" routerLink="/tabs/home">
          <ion-icon name="arrow-back"></ion-icon>
        </button>
        
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo-box">
            <span class="logo-icon">🎲</span>
          </div>
          <h1 class="title">Crear Cuenta</h1>
          <p class="subtitle">Únete y comienza a apostar</p>
        </div>

        <!-- Form -->
        <div class="form-section">
          
          <!-- Username -->
          <div class="input-group">
            <ion-icon name="person" class="input-icon"></ion-icon>
            <input 
              type="text" 
              [(ngModel)]="username" 
              placeholder="Nombre de usuario"
              class="form-input"
              autocomplete="username">
          </div>

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
          <p class="input-hint">
            💡 Usa "demo" en el email para recibir \$100,000 gratis
          </p>

          <!-- Password -->
          <div class="input-group">
            <ion-icon name="lock-closed" class="input-icon"></ion-icon>
            <input 
              [type]="showPassword ? 'text' : 'password'" 
              [(ngModel)]="password" 
              placeholder="Contraseña (mín. 6 caracteres)"
              class="form-input"
              autocomplete="new-password">
            <button class="toggle-pwd" (click)="showPassword = !showPassword">
              <ion-icon [name]="showPassword ? 'eye-off' : 'eye'"></ion-icon>
            </button>
          </div>

          <!-- Register Button -->
          <ion-button 
            expand="block" 
            class="register-btn"
            [disabled]="loading || !canRegister"
            (click)="register()">
            <ion-spinner *ngIf="loading" name="crescent" class="mr-2"></ion-spinner>
            {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </ion-button>

          <!-- Login Link -->
          <p class="login-link">
            ¿Ya tienes cuenta?
            <a routerLink="/login">Inicia sesión</a>
          </p>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .register-container {
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
    
    .input-hint {
      font-size: 13px;
      color: #a78bfa;
      margin: -8px 0 16px 4px;
    }
    
    .register-btn {
      --border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      margin-top: 8px;
    }
    
    .login-link {
      text-align: center;
      margin-top: 24px;
      color: #9ca3af;
      font-size: 14px;
    }
    .login-link a {
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
export class RegisterPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  username = '';
  email = '';
  password = '';
  showPassword = false;
  loading = false;

  constructor() { addIcons({ mail, lockClosed, person, eye, eyeOff, arrowBack }); }

  get canRegister() {
    return this.username.length >= 3 && this.email.includes('@') && this.password.length >= 6;
  }

  async register() {
    if (!this.canRegister) return;
    
    this.loading = true;
    const success = await this.api.register(this.email, this.username, this.password);
    this.loading = false;

    if (success) {
      const toast = await this.toastCtrl.create({
        message: '¡Cuenta creada exitosamente!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      this.router.navigate(['/tabs/home']);
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Error al crear cuenta. El email puede estar en uso.',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }
}