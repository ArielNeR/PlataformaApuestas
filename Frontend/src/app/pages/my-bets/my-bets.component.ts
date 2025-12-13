import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-my-bets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold mb-6 text-white">
        <i class="fas fa-ticket text-indigo-400 mr-3"></i>
        Mis Apuestas
      </h1>

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="glass rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-white">{{ stats.totalBets }}</p>
          <p class="text-gray-400 text-sm">Total</p>
        </div>
        <div class="glass rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-green-400">{{ stats.won }}</p>
          <p class="text-gray-400 text-sm">Ganadas</p>
        </div>
        <div class="glass rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-red-400">{{ stats.lost }}</p>
          <p class="text-gray-400 text-sm">Perdidas</p>
        </div>
        <div class="glass rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-yellow-400">{{ stats.pending }}</p>
          <p class="text-gray-400 text-sm">Pendientes</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto">
        <button 
          *ngFor="let filter of filters"
          (click)="selectedFilter = filter.id"
          [class]="selectedFilter === filter.id 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
          class="px-4 py-2 rounded-full whitespace-nowrap transition">
          {{ filter.label }}
        </button>
      </div>

      <!-- Bets List -->
      <div *ngIf="filteredBets.length === 0" class="text-center py-12 glass rounded-xl">
        <i class="fas fa-inbox text-5xl text-gray-600 mb-4"></i>
        <p class="text-gray-400">No hay apuestas para mostrar</p>
      </div>

      <div *ngIf="filteredBets.length > 0" class="space-y-4">
        <div *ngFor="let bet of filteredBets" class="glass rounded-xl p-4">
          
          <!-- Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                   [class]="bet.status === 'won' ? 'bg-green-500/20' : 
                           bet.status === 'lost' ? 'bg-red-500/20' : 'bg-yellow-500/20'">
                <i [class]="bet.status === 'won' ? 'fas fa-check text-green-400' : 
                           bet.status === 'lost' ? 'fas fa-times text-red-400' : 
                           'fas fa-clock text-yellow-400'"></i>
              </div>
              <div>
                <span class="text-xs px-2 py-1 rounded-full"
                      [class]="bet.status === 'won' ? 'bg-green-500/20 text-green-400' : 
                              bet.status === 'lost' ? 'bg-red-500/20 text-red-400' : 
                              'bg-yellow-500/20 text-yellow-400'">
                  {{ bet.status === 'won' ? 'Ganada' : bet.status === 'lost' ? 'Perdida' : 'Pendiente' }}
                </span>
                <p class="text-xs text-gray-500 mt-1">{{ bet.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-400">Cuota: {{ bet.totalOdds | number:'1.2-2' }}</p>
            </div>
          </div>

          <!-- Selections -->
          <div class="space-y-2 mb-3">
            <div *ngFor="let sel of bet.selections" class="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
              <div>
                <p class="text-sm text-white">{{ sel.eventName }}</p>
                <p class="text-xs text-gray-400">{{ sel.market }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-indigo-400">{{ sel.pickLabel }}</p>
                <p class="text-xs text-gray-400">Cuota: {{ sel.odds | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-700">
            <div>
              <p class="text-sm text-gray-400">Apostado</p>
              <p class="font-bold text-white">\${{ bet.stake | number:'1.0-0' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-400">{{ bet.status === 'pending' ? 'Ganancia potencial' : 'Resultado' }}</p>
              <p class="font-bold text-lg"
                 [class]="bet.status === 'won' ? 'text-green-400' : 
                         bet.status === 'lost' ? 'text-red-400' : 'text-yellow-400'">
                {{ bet.status === 'won' ? '+' : bet.status === 'lost' ? '-' : '' }}\${{ bet.status === 'lost' ? bet.stake : bet.potentialWin | number:'1.0-0' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyBetsComponent implements OnInit, OnDestroy {
  private betService = inject(BetService);
  private destroy$ = new Subject<void>();

  bets: any[] = [];
  selectedFilter = 'all';
  
  stats = {
    totalBets: 0,
    won: 0,
    lost: 0,
    pending: 0
  };

  filters = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'won', label: 'Ganadas' },
    { id: 'lost', label: 'Perdidas' }
  ];

  ngOnInit(): void {
    this.betService.getBetHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe(bets => {
        this.bets = bets;
        this.calculateStats();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateStats(): void {
    this.stats = {
      totalBets: this.bets.length,
      won: this.bets.filter(b => b.status === 'won').length,
      lost: this.bets.filter(b => b.status === 'lost').length,
      pending: this.bets.filter(b => b.status === 'pending').length
    };
  }

  get filteredBets(): any[] {
    if (this.selectedFilter === 'all') return this.bets;
    return this.bets.filter(b => b.status === this.selectedFilter);
  }
}