// Frontend/src/app/pages/my-bets/my-bets.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-my-bets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold flex items-center gap-3">
          <i class="fas fa-ticket text-indigo-400"></i>
          Mis Apuestas
        </h1>
        <p class="text-gray-400 mt-2">Historial y seguimiento de tus apuestas</p>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="glass rounded-2xl p-5">
          <div class="text-3xl font-bold">{{ stats.totalBets }}</div>
          <div class="text-gray-400 text-sm">Total Apuestas</div>
        </div>
        <div class="glass rounded-2xl p-5">
          <div class="text-3xl font-bold text-green-400">{{ stats.won }}</div>
          <div class="text-gray-400 text-sm">Ganadas</div>
        </div>
        <div class="glass rounded-2xl p-5">
          <div class="text-3xl font-bold text-red-400">{{ stats.lost }}</div>
          <div class="text-gray-400 text-sm">Perdidas</div>
        </div>
        <div class="glass rounded-2xl p-5">
          <div class="text-3xl font-bold" 
               [class.text-green-400]="stats.profit > 0" 
               [class.text-red-400]="stats.profit < 0">
            {{ stats.profit > 0 ? '+' : '' }}\${{ stats.profit.toFixed(2) }}
          </div>
          <div class="text-gray-400 text-sm">Balance</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button (click)="setTab('all')"
                class="px-6 py-3 rounded-xl font-bold transition"
                [class.bg-indigo-600]="activeTab === 'all'"
                [class.bg-gray-800]="activeTab !== 'all'">
          Todas
        </button>
        <button (click)="setTab('pending')"
                class="px-6 py-3 rounded-xl font-bold transition"
                [class.bg-yellow-600]="activeTab === 'pending'"
                [class.bg-gray-800]="activeTab !== 'pending'">
          Pendientes
        </button>
        <button (click)="setTab('settled')"
                class="px-6 py-3 rounded-xl font-bold transition"
                [class.bg-purple-600]="activeTab === 'settled'"
                [class.bg-gray-800]="activeTab !== 'settled'">
          Finalizadas
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <div class="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredBets.length === 0" class="text-center py-20 glass rounded-2xl">
        <i class="fas fa-ticket text-6xl text-gray-600 mb-4"></i>
        <h3 class="text-2xl font-bold text-gray-400">No hay apuestas</h3>
        <p class="text-gray-500 mt-2">¡Haz tu primera apuesta ahora!</p>
      </div>

      <!-- Bets List -->
      <div class="space-y-4" *ngIf="!isLoading && filteredBets.length > 0">
        <div *ngFor="let bet of filteredBets" 
             class="glass rounded-2xl p-5 hover:border-indigo-500/50 transition">
          
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="font-bold text-lg">{{ getBetEventName(bet) }}</h4>
              <p class="text-gray-400">
                {{ getBetPick(bet) }} &#64; <span class="text-indigo-400">{{ bet.totalOdds?.toFixed(2) || '0.00' }}</span>
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(bet.createdAt) }}</p>
            </div>
            
            <div class="text-right">
              <div class="text-sm text-gray-400 mb-1">Apostado: \${{ bet.stake }}</div>
              <div class="text-xl font-bold" 
                   [class.text-green-400]="bet.status === 'won'"
                   [class.text-red-400]="bet.status === 'lost'"
                   [class.text-yellow-400]="bet.status === 'pending'">
                <ng-container *ngIf="bet.status === 'won'">+\${{ (bet.profit || 0).toFixed(2) }}</ng-container>
                <ng-container *ngIf="bet.status === 'lost'">-\${{ bet.stake.toFixed(2) }}</ng-container>
                <ng-container *ngIf="bet.status === 'pending'">Pendiente</ng-container>
              </div>
            </div>

            <div class="ml-4">
              <i *ngIf="bet.status === 'won'" class="fas fa-check-circle text-green-400 text-2xl"></i>
              <i *ngIf="bet.status === 'lost'" class="fas fa-times-circle text-red-400 text-2xl"></i>
              <i *ngIf="bet.status === 'pending'" class="fas fa-clock text-yellow-400 text-2xl animate-pulse"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MyBetsComponent implements OnInit {
  private betService = inject(BetService);

  bets: any[] = [];
  stats: any = { totalBets: 0, won: 0, lost: 0, pending: 0, profit: 0 };
  activeTab: 'all' | 'pending' | 'settled' = 'all';
  isLoading = true;

  ngOnInit(): void {
    this.loadBets();
    this.stats = this.betService.getStats();
  }

  private loadBets(): void {
    this.isLoading = true;
    this.betService.getBetHistory().subscribe({
      next: (bets) => {
        this.bets = bets;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando apuestas:', err);
        this.isLoading = false;
      }
    });
  }

  setTab(tab: 'all' | 'pending' | 'settled'): void {
    this.activeTab = tab;
  }

  get filteredBets(): any[] {
    switch (this.activeTab) {
      case 'pending':
        return this.bets.filter(b => b.status === 'pending');
      case 'settled':
        return this.bets.filter(b => b.status !== 'pending');
      default:
        return this.bets;
    }
  }

  getBetEventName(bet: any): string {
    if (bet.selections && bet.selections.length > 0) {
      return bet.selections.map((s: any) => s.eventName).join(', ');
    }
    return 'Evento desconocido';
  }

  getBetPick(bet: any): string {
    if (bet.selections && bet.selections.length > 0) {
      return bet.selections.map((s: any) => s.pickLabel).join(', ');
    }
    return '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}