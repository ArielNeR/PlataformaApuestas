// Frontend/src/app/components/deposit-modal/deposit-modal.component.ts
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deposit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="glass rounded-2xl max-w-md w-full overflow-hidden animate-slide-up">
        
        <div class="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 class="text-xl font-bold flex items-center gap-3">
            <i class="fas fa-credit-card text-green-400"></i>
            Depositar Fondos
          </h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-white transition">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="p-6">
          <!-- Cantidad -->
          <div class="mb-6">
            <label class="block text-sm text-gray-400 mb-2">Cantidad a depositar</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
              <input type="number" [(ngModel)]="amount" min="10" max="10000"
                     class="w-full bg-gray-800 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div class="flex gap-2 mt-3">
              <button *ngFor="let a of [50, 100, 500, 1000]"
                      (click)="amount = a"
                      class="flex-1 py-2 rounded-lg text-sm font-medium transition"
                      [class.bg-green-600]="amount === a"
                      [class.bg-gray-700]="amount !== a">
                \${{ a }}
              </button>
            </div>
          </div>

          <!-- Tarjeta -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">Número de tarjeta</label>
              <input type="text" [(ngModel)]="cardNumber" maxlength="19"
                     placeholder="1234 5678 9012 3456"
                     (input)="formatCardNumber($event)"
                     class="w-full bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none">
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-2">Nombre en la tarjeta</label>
              <input type="text" [(ngModel)]="cardName" 
                     placeholder="JUAN PEREZ"
                     class="w-full bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none uppercase">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-2">Vencimiento</label>
                <input type="text" [(ngModel)]="cardExpiry" maxlength="5"
                       placeholder="MM/YY"
                       (input)="formatExpiry($event)"
                       class="w-full bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none">
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-2">CVV</label>
                <input type="password" [(ngModel)]="cardCvv" maxlength="4"
                       placeholder="***"
                       class="w-full bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none">
              </div>
            </div>
          </div>

          <!-- Iconos de tarjetas -->
          <div class="flex justify-center gap-4 my-6">
            <i class="fab fa-cc-visa text-3xl text-blue-400"></i>
            <i class="fab fa-cc-mastercard text-3xl text-orange-400"></i>
            <i class="fab fa-cc-amex text-3xl text-blue-300"></i>
          </div>

          <!-- Error -->
          <div *ngIf="error" class="bg-red-600/20 text-red-400 p-3 rounded-xl mb-4 text-center">
            {{ error }}
          </div>

          <!-- Success -->
          <div *ngIf="success" class="bg-green-600/20 text-green-400 p-3 rounded-xl mb-4 text-center">
            <i class="fas fa-check-circle mr-2"></i> {{ success }}
          </div>

          <!-- Botón -->
          <button (click)="deposit()"
                  [disabled]="isProcessing || !isFormValid()"
                  class="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50">
            <ng-container *ngIf="!isProcessing">
              <i class="fas fa-lock mr-2"></i> Depositar \${{ amount }}
            </ng-container>
            <ng-container *ngIf="isProcessing">
              <i class="fas fa-spinner fa-spin mr-2"></i> Procesando...
            </ng-container>
          </button>

          <p class="text-center text-xs text-gray-500 mt-4">
            <i class="fas fa-shield-alt mr-1"></i>
            Transacción segura con encriptación SSL
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DepositModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() deposited = new EventEmitter<number>();

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  amount = 100;
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';
  isProcessing = false;
  error = '';
  success = '';

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber = value;
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.cardExpiry = value;
  }

  isFormValid(): boolean {
    return this.amount >= 10 && 
           this.cardNumber.replace(/\s/g, '').length >= 16 &&
           this.cardName.length >= 3 &&
           this.cardExpiry.length === 5 &&
           this.cardCvv.length >= 3;
  }

  deposit(): void {
    if (!this.isFormValid()) return;

    this.isProcessing = true;
    this.error = '';
    this.success = '';

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.token}`);

    this.http.post<any>('http://localhost:3000/transactions/deposit', {
      amount: this.amount,
      cardNumber: this.cardNumber.replace(/\s/g, ''),
      cardName: this.cardName,
      cardExpiry: this.cardExpiry,
      cardCvv: this.cardCvv,
    }, { headers }).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.success = `¡Depósito exitoso! Tu nuevo saldo es $${response.newBalance.toLocaleString()}`;
        this.authService.updateBalance(response.newBalance);
        this.deposited.emit(response.newBalance);
        
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (err) => {
        this.isProcessing = false;
        this.error = err.error?.message || 'Error al procesar el depósito';
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}