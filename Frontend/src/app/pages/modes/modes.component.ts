// Frontend/src/app/pages/modes/modes.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationModalComponent } from '../../components/simulation-modal/simulation-modal.component';

interface GameMode {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  difficultyColor: string;
  gradient: string;
  icon: string;
  buttonText: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-modes',
  standalone: true,
  imports: [CommonModule, SimulationModalComponent],
  templateUrl: './modes.component.html',
  styles: []
})
export class ModesComponent {
  showSimulation = false;

  modes: GameMode[] = [
    {
      id: 'simple',
      name: 'Apuestas Simples',
      description: 'Apuesta a un solo resultado. Ideal para principiantes.',
      difficulty: 'Fácil',
      difficultyColor: 'text-green-400',
      gradient: 'from-blue-600 to-cyan-600',
      icon: 'fas fa-ticket',
      buttonText: 'Jugar'
    },
    {
      id: 'combined',
      name: 'Apuestas Combinadas',
      description: 'Combina múltiples eventos para multiplicar ganancias.',
      difficulty: 'Medio',
      difficultyColor: 'text-yellow-400',
      gradient: 'from-purple-600 to-pink-600',
      icon: 'fas fa-layer-group',
      buttonText: 'Jugar'
    },
    {
      id: 'streak',
      name: 'Modo Racha',
      description: 'Apuestas secuenciales con multiplicadores crecientes.',
      difficulty: 'Difícil',
      difficultyColor: 'text-red-400',
      gradient: 'from-orange-600 to-red-600',
      icon: 'fas fa-fire',
      buttonText: 'Jugar'
    },
    {
      id: 'tournament',
      name: 'Torneos',
      description: 'Compite contra otros usuarios en el leaderboard.',
      difficulty: 'Competitivo',
      difficultyColor: 'text-purple-400',
      gradient: 'from-yellow-600 to-amber-600',
      icon: 'fas fa-trophy',
      buttonText: 'Ver Torneos'
    },
    {
      id: 'simulation',
      name: 'Simulación',
      description: 'Reproduce partidos históricos y simula tus apuestas.',
      difficulty: 'Práctica',
      difficultyColor: 'text-cyan-400',
      gradient: 'from-green-600 to-teal-600',
      icon: 'fas fa-clock-rotate-left',
      buttonText: 'Simular'
    },
    {
      id: 'live-dynamic',
      name: 'Dinámico en Vivo',
      description: 'Cuotas que cambian en tiempo real. Máxima emoción.',
      difficulty: 'Experto',
      difficultyColor: 'text-red-400',
      gradient: 'from-indigo-600 to-violet-600',
      icon: 'fas fa-bolt',
      buttonText: 'Jugar',
      isNew: true
    }
  ];

  onModeClick(modeId: string): void {
    if (modeId === 'simulation') {
      this.showSimulation = true;
    }
  }

  closeSimulation(): void {
    this.showSimulation = false;
  }
}