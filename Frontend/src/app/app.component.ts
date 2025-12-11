import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';  // ← AÑADÍ ESTO
import { AuthService } from './services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BetSlipComponent } from './components/bet-slip/bet-slip.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,           // ← NUEVO
    RouterLinkActive,     // ← NUEVO
    AsyncPipe,
    CommonModule,
    BetSlipComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private auth = inject(AuthService);
  user$ = this.auth.user$;
}