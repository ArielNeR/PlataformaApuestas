import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-bolt text-white text-3xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-white">Crear Cuenta</h1>
          <p class="text-gray-400 mt-2">Únete y comienza a apostar</p>
        </div>

        <!-- Form Card -->
        <div class="glass rounded-2xl p-8">
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            
            <!-- Username -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-user mr-2"></i>Usuario
              </label>
              <input 
                type="text" 
                [(ngModel)]="username" 
                name="username"
                required
                minlength="3"
                maxlength="20"
                autocomplete="username"
                class="w-full px-4 py-3 rounded-xl border outline-none transition
                       bg-gray-800 border-gray-600 text-white placeholder-gray-400
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Tu nombre de usuario"
                style="color: #ffffff !important; background-color: #1f2937 !important;">
            </div>

            <!-- Email -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-envelope mr-2"></i>Email
              </label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email"
                required
                autocomplete="email"
                class="w-full px-4 py-3 rounded-xl border outline-none transition
                       bg-gray-800 border-gray-600 text-white placeholder-gray-400
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="tu@email.com"
                style="color: #ffffff !important; background-color: #1f2937 !important;">
              <p class="text-xs text-purple-400 mt-1">
                <i class="fas fa-info-circle mr-1"></i>
                Usa "demo" en el email para cuenta con $100,000
              </p>
            </div>

            <!-- Password -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-lock mr-2"></i>Contraseña
              </label>
              <div class="relative">
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="w-full px-4 py-3 pr-12 rounded-xl border outline-none transition
                         bg-gray-800 border-gray-600 text-white placeholder-gray-400
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Mínimo 6 caracteres"
                  style="color: #ffffff !important; background-color: #1f2937 !important;">
                <button 
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                  <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <i class="fas fa-lock mr-2"></i>Confirmar Contraseña
              </label>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword"
                required
                autocomplete="new-password"
                class="w-full px-4 py-3 rounded-xl border outline-none transition
                       bg-gray-800 border-gray-600 text-white placeholder-gray-400
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                [class.border-red-500]="password && confirmPassword && password !== confirmPassword"
                placeholder="Repite tu contraseña"
                style="color: #ffffff !important; background-color: #1f2937 !important;">
              <p *ngIf="password && confirmPassword && password !== confirmPassword" 
                 class="text-xs text-red-400 mt-1">
                Las contraseñas no coinciden
              </p>
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              [disabled]="loading || !registerForm.valid || password !== confirmPassword"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <span *ngIf="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
            </button>
          </form>

          <!-- Login Link -->
          <p class="text-center mt-6 text-gray-400">
            ¿Ya tienes cuenta? 
            <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 font-medium">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
      -webkit-text-fill-color: #ffffff !important;
      caret-color: #ffffff !important;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  loading = false;
  error = '';

  onSubmit(): void {
    if (!this.username || !this.email || !this.password) return;
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    
    this.loading = true;
    this.error = '';

    this.authService.register(this.email, this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al crear cuenta';
      }
    });
  }
}