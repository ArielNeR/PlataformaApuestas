// Frontend/src/app/components/simulation-modal/simulation-modal.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulation-modal.component.html',
  styleUrls: ['./simulation-modal.component.scss']
})
export class SimulationModalComponent {
  @Output() close = new EventEmitter<void>();

  speed = 2;
  progress = 0;
  score1 = 0;
  score2 = 0;
  isRunning = false;
  result: 'won' | 'lost' | null = null;

  speeds = [1, 2, 5];

  setSpeed(s: number): void {
    this.speed = s;
  }

  startSimulation(): void {
    this.isRunning = true;
    this.progress = 0;
    this.score1 = 0;
    this.score2 = 0;
    this.result = null;

    const interval = setInterval(() => {
      this.progress += this.speed;

      if (Math.random() < 0.05 * this.speed) {
        if (Math.random() > 0.5) {
          this.score1++;
        } else {
          this.score2++;
        }
      }

      if (this.progress >= 100) {
        clearInterval(interval);
        this.isRunning = false;
        this.result = this.score1 > this.score2 ? 'won' : 'lost';
      }
    }, 100);
  }

  closeModal(): void {
    this.close.emit();
  }
}