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
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('balanceChart') balanceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sportChart') sportChartRef!: ElementRef<HTMLCanvasElement>;

  private betService = inject(BetService);

  stats = this.betService.getStats();
  history = this.betService.getBetHistory();

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initCharts();
  }

  private initCharts(): void {
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
}