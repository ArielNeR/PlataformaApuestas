// Frontend/src/app/pages/stats/stats.component.ts
import { Component, OnInit, AfterViewInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService } from '../../services/bet.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styles: []
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('balanceChart') balanceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sportChart') sportChartRef!: ElementRef<HTMLCanvasElement>;

  private betService = inject(BetService);

  stats: any = {
    totalBets: 0,
    won: 0,
    lost: 0,
    pending: 0,
    profit: 0,
    totalStaked: 0,
    winRate: 0,
    roi: '0'
  };
  
  history: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Esperar a que los datos carguen antes de inicializar gráficos
    setTimeout(() => this.initCharts(), 500);
  }

  private loadData(): void {
    this.stats = this.betService.getStats();
    
    this.betService.getBetHistory().subscribe({
      next: (bets) => {
        this.history = bets.slice(0, 10); // Últimas 10 apuestas
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.isLoading = false;
      }
    });
  }

  private initCharts(): void {
    if (!this.balanceChartRef || !this.sportChartRef) return;

    // Balance Chart
    new Chart(this.balanceChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Saldo',
          data: [500, 650, 580, 900, 1100, 1250],
          borderColor: '#818cf8',
          backgroundColor: 'rgba(129, 140, 248, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } }
        }
      }
    });

    // Sport Chart
    new Chart(this.sportChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Fútbol', 'Baloncesto', 'Tenis', 'eSports', 'Otros'],
        datasets: [{
          data: [45, 25, 15, 10, 5],
          backgroundColor: ['#818cf8', '#22c55e', '#f59e0b', '#ec4899', '#6b7280']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } }
      }
    });
  }

  getBetEventName(bet: any): string {
    if (bet.selections && bet.selections.length > 0) {
      return bet.selections.map((s: any) => s.eventName).join(', ');
    }
    return bet.event || 'Evento desconocido';
  }

  getBetPick(bet: any): string {
    if (bet.selections && bet.selections.length > 0) {
      return bet.selections.map((s: any) => s.pickLabel).join(', ');
    }
    return bet.pick || '';
  }

  getProfit(bet: any): number {
    return bet.profit || (bet.status === 'won' ? bet.potentialWin - bet.stake : -bet.stake);
  }
}