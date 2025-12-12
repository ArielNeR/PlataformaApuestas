import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subject, takeUntil, pairwise, startWith } from 'rxjs';
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
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private betService = inject(BetService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  user$ = this.authService.user$;
  betSlip$ = this.betService.betSlip$;
  
  showUserMenu = false;
  showDepositModal = false;
  balanceChanged = false;

  ngOnInit(): void {
    // Detectar cambios de saldo para animación
    this.authService.user$.pipe(
      takeUntil(this.destroy$),
      startWith(null),
      pairwise()
    ).subscribe(([prev, curr]) => {
      if (prev && curr && prev.saldo !== curr.saldo) {
        this.balanceChanged = true;
        setTimeout(() => this.balanceChanged = false, 1500);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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