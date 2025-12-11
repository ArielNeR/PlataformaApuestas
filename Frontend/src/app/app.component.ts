import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BetSlipComponent } from './components/bet-slip/bet-slip.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, CommonModule, BetSlipComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private auth = inject(AuthService);  // ← USAMOS inject() → NUNCA MÁS ERROR DE INICIALIZACIÓN
  user$ = this.auth.user$;
}