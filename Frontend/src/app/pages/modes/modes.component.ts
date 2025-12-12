// Frontend/src/app/pages/modes/modes.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SimulationModalComponent } from '../../components/simulation-modal/simulation-modal.component';
import { AuthService } from '../../services/auth.service';

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
  isActive: boolean;
}

@Component({
  selector: 'app-modes',
  standalone: true,
  imports: [CommonModule, SimulationModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold flex items-center gap-3">
          <i class="fas fa-gamepad text-purple-400"></i>
          Modos de Juego
        </h1>
        <p class="text-gray-400 mt-2">Diferentes formas de disfrutar las apuestas</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let mode of modes"
             (click)="onModeClick(mode)"
             class="glass rounded-2xl overflow-hidden cursor-pointer group relative transition-all"
             [class.card-hover]="mode.isActive"
             [class.opacity-60]="!mode.isActive">
          
          <!-- New Badge -->
          <div *ngIf="mode.isNew" 
               class="absolute top-4 right-4 bg-red-600 px-2 py-1 rounded text-xs font-bold z-10">
            NUEVO
          </div>

          <!-- Coming Soon Badge -->
          <div *ngIf="!mode.isActive" 
               class="absolute top-4 left-4 bg-gray-600 px-2 py-1 rounded text-xs font-bold z-10">
            PRÓXIMAMENTE
          </div>

          <!-- Icon Section -->
          <div class="h-40 flex items-center justify-center"
               [ngClass]="'bg-gradient-to-br ' + mode.gradient">
            <i [class]="mode.icon + ' text-6xl opacity-50 group-hover:opacity-80 transition'"></i>
          </div>

          <!-- Content -->
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">{{ mode.name }}</h3>
            <p class="text-gray-400 text-sm mb-4">{{ mode.description }}</p>
            <div class="flex items-center justify-between">
              <span [class]="mode.difficultyColor" class="text-sm">{{ mode.difficulty }}</span>
              <button [disabled]="!mode.isActive"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition"
                      [ngClass]="mode.isActive ? 'bg-gradient-to-r ' + mode.gradient + ' hover:opacity-90' : 'bg-gray-600 cursor-not-allowed'">
                {{ mode.isActive ? mode.buttonText : 'Próximamente' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info sobre modos -->
      <div class="mt-8 glass rounded-2xl p-6">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-info-circle text-indigo-400"></i>
          ¿Cómo funcionan los modos?
        </h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 class="text-white font-medium mb-1">Apuestas Simples</h4>
            <p>Apuesta a un solo evento. Si aciertas, ganas según la cuota.</p>
          </div>
          <div>
            <h4 class="text-white font-medium mb-1">Apuestas Combinadas</h4>
            <p>Combina varias selecciones. Las cuotas se multiplican pero debes acertar todas.</p>
          </div>
          <div>
            <h4 class="text-white font-medium mb-1">Simulación</h4>
            <p>Practica con partidos históricos sin arriesgar dinero real.</p>
          </div>
          <div>
            <h4 class="text-white font-medium mb-1">Dinámico en Vivo</h4>
            <p>Apuesta mientras el evento está en curso con cuotas que cambian en tiempo real.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Simulation Modal -->
    <app-simulation-modal *ngIf="showSimulation" (close)="closeSimulation()"></app-simulation-modal>

    <!-- Mode Detail Modal -->
    <div *ngIf="selectedMode" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="selectedMode = null">
      <div class="glass rounded-2xl max-w-lg w-full p-6 animate-slide-up" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center"
               [ngClass]="'bg-gradient-to-br ' + selectedMode.gradient">
            <i [class]="selectedMode.icon + ' text-2xl'"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ selectedMode.name }}</h3>
            <p [class]="selectedMode.difficultyColor" class="text-sm">{{ selectedMode.difficulty }}</p>
          </div>
        </div>
        
        <p class="text-gray-400 mb-6">{{ selectedMode.description }}</p>

        <div class="space-y-3">
          <button *ngIf="selectedMode.id === 'simple'"
                  (click)="goToLive(); selectedMode = null"
                  class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-4 rounded-xl font-bold hover:opacity-90 transition">
            <i class="fas fa-play mr-2"></i> Ir a Eventos
          </button>
          <button *ngIf="selectedMode.id === 'combined'"
                  (click)="goToLive(); selectedMode = null"
                  class="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-bold hover:opacity-90 transition">
            <i class="fas fa-layer-group mr-2"></i> Crear Combinada
          </button>
          <button *ngIf="selectedMode.id === 'live-dynamic'"
                  (click)="goToLive(); selectedMode = null"
                  class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-4 rounded-xl font-bold hover:opacity-90 transition">
            <i class="fas fa-bolt mr-2"></i> Ver En Vivo
          </button>
          <button (click)="selectedMode = null"
                  class="w-full bg-gray-700 py-3 rounded-xl font-medium hover:bg-gray-600 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class ModesComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  showSimulation = false;
  selectedMode: GameMode | null = null;

  modes: GameMode[] = [
    {
      id: 'simple',
      name: 'Apuestas Simples',
      description: 'Apuesta a un solo resultado. Ideal para principiantes. Selecciona un evento y elige tu pronóstico.',
      difficulty: 'Fácil',
      difficultyColor: 'text-green-400',
      gradient: 'from-blue-600 to-cyan-600',
      icon: 'fas fa-ticket',
      buttonText: 'Jugar',
      isActive: true
    },
    {
      id: 'combined',
      name: 'Apuestas Combinadas',
      description: 'Combina múltiples eventos para multiplicar ganancias. Añade varias selecciones al cupón.',
      difficulty: 'Medio',
      difficultyColor: 'text-yellow-400',
      gradient: 'from-purple-600 to-pink-600',
      icon: 'fas fa-layer-group',
      buttonText: 'Jugar',
      isActive: true
    },
    {
      id: 'streak',
      name: 'Modo Racha',
      description: 'Apuestas secuenciales con multiplicadores crecientes. Gana consecutivamente para aumentar el premio.',
      difficulty: 'Difícil',
      difficultyColor: 'text-red-400',
      gradient: 'from-orange-600 to-red-600',
      icon: 'fas fa-fire',
      buttonText: 'Jugar',
      isActive: false
    },
    {
      id: 'tournament',
      name: 'Torneos',
      description: 'Compite contra otros usuarios en el leaderboard. Gana premios siendo el mejor apostador.',
      difficulty: 'Competitivo',
      difficultyColor: 'text-purple-400',
      gradient: 'from-yellow-600 to-amber-600',
      icon: 'fas fa-trophy',
      buttonText: 'Ver Torneos',
      isActive: false
    },
    {
      id: 'simulation',
      name: 'Simulación',
      description: 'Reproduce partidos históricos y simula tus apuestas sin riesgo. Perfecto para practicar.',
      difficulty: 'Práctica',
      difficultyColor: 'text-cyan-400',
      gradient: 'from-green-600 to-teal-600',
      icon: 'fas fa-clock-rotate-left',
      buttonText: 'Simular',
      isActive: true
    },
    {
      id: 'live-dynamic',
      name: 'Dinámico en Vivo',
      description: 'Cuotas que cambian en tiempo real según el desarrollo del partido. Máxima emoción.',
      difficulty: 'Experto',
      difficultyColor: 'text-red-400',
      gradient: 'from-indigo-600 to-violet-600',
      icon: 'fas fa-bolt',
      buttonText: 'Jugar',
      isNew: true,
      isActive: true
    }
  ];

  onModeClick(mode: GameMode): void {
    if (!mode.isActive) return;

    if (mode.id === 'simulation') {
      this.showSimulation = true;
    } else {
      this.selectedMode = mode;
    }
  }

  goToLive(): void {
    this.router.navigate(['/live']);
  }

  closeSimulation(): void {
    this.showSimulation = false;
  }
}