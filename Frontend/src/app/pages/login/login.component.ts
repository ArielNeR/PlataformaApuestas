import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
          <h1 class="text-3xl font-bold text-white">Bienvenido de vuelta</h1>
          <p class="text-gray-400 mt-2">Inicia sesión para continuar</p>
        </div>

        <!-- Form Card -->
        <div class="glass rounded-2xl p-8">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            
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
            </div>

            <!-- Password -->
            <div class="mb-6">
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
                  autocomplete="current-password"
                  class="w-full px-4 py-3 pr-12 rounded-xl border outline-none transition
                         bg-gray-800 border-gray-600 text-white placeholder-gray-400
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="••••••••"
                  style="color: #ffffff !important; background-color: #1f2937 !important;">
                <button 
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                  <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              [disabled]="loading || !loginForm.valid"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <span *ngIf="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center my-6">
            <div class="flex-1 border-t border-gray-700"></div>
            <span class="px-4 text-gray-500 text-sm">o</span>
            <div class="flex-1 border-t border-gray-700"></div>
          </div>

          <!-- Demo Account -->
          <button 
            (click)="loginDemo()"
            [disabled]="loading"
            class="w-full py-3 rounded-xl bg-purple-600/20 border border-purple-500/50 text-purple-400 font-medium hover:bg-purple-600/30 transition flex items-center justify-center gap-2">
            <i class="fas fa-gamepad"></i>
            Probar cuenta Demo
          </button>

          <!-- Register Link -->
          <p class="text-center mt-6 text-gray-400">
            ¿No tienes cuenta? 
            <a routerLink="/register" class="text-indigo-400 hover:text-indigo-300 font-medium">
              Regístrate aquí
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
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  onSubmit(): void {
    if (!this.email || !this.password) return;
    
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Credenciales inválidas';
      }
    });
  }

  loginDemo(): void {
    this.email = 'demo@betpro.com';
    this.password = 'demo123';
    this.onSubmit();
  }
}