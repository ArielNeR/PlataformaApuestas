import { Component, OnInit, OnDestroy, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BetService } from '../../services/bet.service';
import { AuthService } from '../../services/auth.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold mb-6 text-white">
        <i class="fas fa-chart-line text-indigo-400 mr-3"></i>
        Mis Estadísticas
      </h1>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="glass rounded-xl p-4">
          <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-2">
            <i class="fas fa-ticket text-indigo-400"></i>
          </div>
          <p class="text-2xl font-bold text-white">{{ stats.totalBets }}</p>
          <p class="text-gray-400 text-sm">Total Apuestas</p>
        </div>

        <div class="glass rounded-xl p-4">
          <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
            <i class="fas fa-trophy text-green-400"></i>
          </div>
          <p class="text-2xl font-bold text-green-400">{{ stats.won }}</p>
          <p class="text-gray-400 text-sm">Ganadas</p>
        </div>

        <div class="glass rounded-xl p-4">
          <div class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-2">
            <i class="fas fa-times-circle text-red-400"></i>
          </div>
          <p class="text-2xl font-bold text-red-400">{{ stats.lost }}</p>
          <p class="text-gray-400 text-sm">Perdidas</p>
        </div>

        <div class="glass rounded-xl p-4">
          <div class="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-2">
            <i class="fas fa-clock text-yellow-400"></i>
          </div>
          <p class="text-2xl font-bold text-yellow-400">{{ stats.pending }}</p>
          <p class="text-gray-400 text-sm">Pendientes</p>
        </div>
      </div>

      <!-- Financial Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="glass rounded-xl p-6">
          <p class="text-gray-400 text-sm mb-1">Ganancias/Pérdidas</p>
          <p class="text-3xl font-bold" [class]="stats.profit >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ stats.profit >= 0 ? '+' : '' }}\${{ stats.profit | number:'1.0-0' }}
          </p>
        </div>

        <div class="glass rounded-xl p-6">
          <p class="text-gray-400 text-sm mb-1">Tasa de Acierto</p>
          <p class="text-3xl font-bold text-indigo-400">{{ stats.winRate }}%</p>
        </div>

        <div class="glass rounded-xl p-6">
          <p class="text-gray-400 text-sm mb-1">ROI</p>
          <p class="text-3xl font-bold" [class]="getROINumber() >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ getROINumber() >= 0 ? '+' : '' }}{{ stats.roi }}%
          </p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Pie Chart -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-lg font-bold mb-4 text-white">Distribución de Resultados</h3>
          <div class="relative h-64 flex items-center justify-center">
            <canvas #pieChart></canvas>
          </div>
          <div class="flex justify-center gap-6 mt-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              <span class="text-sm text-gray-400">Ganadas ({{ stats.won }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="text-sm text-gray-400">Perdidas ({{ stats.lost }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span class="text-sm text-gray-400">Pendientes ({{ stats.pending }})</span>
            </div>
          </div>
        </div>

        <!-- Bar Chart -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-lg font-bold mb-4 text-white">Resumen Financiero</h3>
          <div class="relative h-64">
            <canvas #barChart></canvas>
          </div>
        </div>
      </div>

      <!-- Historial de Apuestas -->
      <div class="glass rounded-xl p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white">
            <i class="fas fa-history text-indigo-400 mr-2"></i>
            Historial de Apuestas
          </h3>
          <span class="text-sm text-gray-400">Últimas {{ recentBets.length }} apuestas</span>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="recentBets.length === 0" class="text-center py-12">
          <i class="fas fa-ticket text-5xl text-gray-600 mb-4"></i>
          <p class="text-gray-400 text-lg">No tienes apuestas aún</p>
          <p class="text-gray-500 text-sm">Realiza tu primera apuesta para ver tu historial</p>
        </div>

        <!-- Bets List -->
        <div *ngIf="recentBets.length > 0" class="space-y-3">
          <div *ngFor="let bet of recentBets" 
               class="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition">
            
            <!-- Left: Status Icon + Info -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                   [class]="bet.status === 'won' ? 'bg-green-500/20' : 
                           bet.status === 'lost' ? 'bg-red-500/20' : 'bg-yellow-500/20'">
                <i [class]="bet.status === 'won' ? 'fas fa-check text-green-400 text-xl' : 
                           bet.status === 'lost' ? 'fas fa-times text-red-400 text-xl' : 
                           'fas fa-clock text-yellow-400 text-xl'"></i>
              </div>
              <div>
                <p class="font-medium text-white">
                  {{ bet.selections[0]?.eventName || 'Apuesta' }}
                  <span *ngIf="bet.selections.length > 1" class="text-gray-400 text-sm">
                    (+{{ bet.selections.length - 1 }} más)
                  </span>
                </p>
                <p class="text-sm text-gray-400">
                  <span class="text-indigo-400">{{ bet.selections[0]?.pickLabel }}</span>
                  <span class="mx-2">•</span>
                  <span>Cuota: {{ bet.totalOdds | number:'1.2-2' }}</span>
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ bet.createdAt | date:'dd MMM yyyy, HH:mm' }}
                </p>
              </div>
            </div>

            <!-- Right: Amount + Status -->
            <div class="text-right">
              <p class="text-sm text-gray-400 mb-1">Apostado: \${{ bet.stake | number:'1.0-0' }}</p>
              <p class="text-lg font-bold"
                 [class]="bet.status === 'won' ? 'text-green-400' : 
                         bet.status === 'lost' ? 'text-red-400' : 'text-yellow-400'">
                <ng-container *ngIf="bet.status === 'won'">
                  +\${{ bet.potentialWin | number:'1.0-0' }}
                </ng-container>
                <ng-container *ngIf="bet.status === 'lost'">
                  -\${{ bet.stake | number:'1.0-0' }}
                </ng-container>
                <ng-container *ngIf="bet.status === 'pending'">
                  \${{ bet.potentialWin | number:'1.0-0' }}
                </ng-container>
              </p>
              <span class="text-xs px-2 py-1 rounded-full"
                    [class]="bet.status === 'won' ? 'bg-green-500/20 text-green-400' : 
                            bet.status === 'lost' ? 'bg-red-500/20 text-red-400' : 
                            'bg-yellow-500/20 text-yellow-400'">
                {{ bet.status === 'won' ? 'Ganada' : bet.status === 'lost' ? 'Perdida' : 'Pendiente' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Saldo actual -->
      <div class="glass rounded-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Saldo Actual</p>
            <p class="text-4xl font-bold text-green-400">\${{ currentBalance | number:'1.0-0' }}</p>
          </div>
          <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <i class="fas fa-wallet text-green-400 text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  private betService = inject(BetService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;

  stats = {
    totalBets: 0,
    won: 0,
    lost: 0,
    pending: 0,
    profit: 0,
    totalStaked: 0,
    winRate: 0,
    roi: '0'
  };

  recentBets: any[] = [];
  currentBalance = 0;

  ngOnInit(): void {
    this.betService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
        this.updateCharts();
      });

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentBalance = user?.saldo || 0;
      });

    this.betService.getBetHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe(bets => {
        this.recentBets = bets;
      });

    this.betService.refreshStats();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCharts(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pieChart?.destroy();
    this.barChart?.destroy();
  }

  getROINumber(): number {
    return parseFloat(this.stats.roi) || 0;
  }

  private initCharts(): void {
    this.initPieChart();
    this.initBarChart();
  }

  private initPieChart(): void {
    const ctx = this.pieChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    const hasData = this.stats.won > 0 || this.stats.lost > 0 || this.stats.pending > 0;
    
    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ganadas', 'Perdidas', 'Pendientes'],
        datasets: [{
          data: hasData ? [this.stats.won, this.stats.lost, this.stats.pending] : [1, 1, 1],
          backgroundColor: hasData ? ['#22c55e', '#ef4444', '#eab308'] : ['#374151', '#374151', '#374151'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '60%'
      }
    });
  }

  private initBarChart(): void {
    const ctx = this.barChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Apostado', 'Retornado', 'Profit'],
        datasets: [{
          label: 'Monto ($)',
          data: [
            this.stats.totalStaked,
            this.stats.totalStaked + this.stats.profit,
            this.stats.profit
          ],
          backgroundColor: [
            '#6366f1',
            '#22c55e',
            this.stats.profit >= 0 ? '#22c55e' : '#ef4444'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#9ca3af' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#9ca3af' }
          }
        }
      }
    });
  }

  private updateCharts(): void {
    if (this.pieChart) {
      const hasData = this.stats.won > 0 || this.stats.lost > 0 || this.stats.pending > 0;
      this.pieChart.data.datasets[0].data = hasData 
        ? [this.stats.won, this.stats.lost, this.stats.pending] 
        : [1, 1, 1];
      this.pieChart.data.datasets[0].backgroundColor = hasData 
        ? ['#22c55e', '#ef4444', '#eab308'] 
        : ['#374151', '#374151', '#374151'];
      this.pieChart.update();
    }

    if (this.barChart) {
      this.barChart.data.datasets[0].data = [
        this.stats.totalStaked,
        this.stats.totalStaked + this.stats.profit,
        this.stats.profit
      ];
      this.barChart.data.datasets[0].backgroundColor = [
        '#6366f1',
        '#22c55e',
        this.stats.profit >= 0 ? '#22c55e' : '#ef4444'
      ];
      this.barChart.update();
    }
  }
}