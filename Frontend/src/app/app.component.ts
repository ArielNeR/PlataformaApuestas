// Frontend/src/app/app.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { BetService } from './services/bet.service';
import { BetSlipComponent } from './components/bet-slip/bet-slip.component';
import { ResultOverlayComponent } from './components/result-overlay/result-overlay.component';
import { DepositModalComponent } from './components/deposit-modal/deposit-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BetSlipComponent,
    ResultOverlayComponent,
    DepositModalComponent
  ],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  private authService = inject(AuthService);
  private betService = inject(BetService);
  private router = inject(Router);

  user$ = this.authService.user$;
  betSlip$ = this.betService.betSlip$;

  demoMode = true;
  showUserMenu = false;
  showDepositModal = false;

  toggleDemoMode(): void {
    this.demoMode = !this.demoMode;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  openDeposit(): void {
    this.showDepositModal = true;
    this.showUserMenu = false;
  }

  onDeposited(newBalance: number): void {
    this.showDepositModal = false;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/login']);
  }

  get slipCount(): number {
    return this.betService.slipCount;
  }
}