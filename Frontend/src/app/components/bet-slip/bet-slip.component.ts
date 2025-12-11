// Frontend/src/app/components/bet-slip/bet-slip.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BetService } from '../../services/bet.service';
import { AuthService } from '../../services/auth.service';
import { ResultOverlayService } from '../../services/result-overlay.service';

@Component({
  selector: 'app-bet-slip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bet-slip.component.html',
  styleUrls: ['./bet-slip.component.scss']
})
export class BetSlipComponent {
  private betService = inject(BetService);
  private authService = inject(AuthService);
  private resultService = inject(ResultOverlayService);
  private router = inject(Router);

  betSlip$ = this.betService.betSlip$;
  
  isOpen = false;
  stake = 10;
  isPlacing = false;

  get totalOdds(): number {
    return this.betService.totalOdds;
  }

  get potentialWin(): number {
    return this.stake * this.totalOdds;
  }

  get slipCount(): number {
    return this.betService.slipCount;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  removeItem(eventId: string): void {
    this.betService.removeFromSlip(eventId);
  }

  clearAll(): void {
    this.betService.clearSlip();
  }

  setStake(amount: number): void {
    this.stake = amount;
  }

  placeBet(): void {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authService.currentUser;
    if (!user || user.saldo < this.stake) {
      alert('Saldo insuficiente');
      return;
    }

    this.isPlacing = true;
    
    this.betService.placeBet(this.stake).subscribe({
      next: (result) => {
        if (result.won) {
          this.authService.updateBalance(user.saldo + result.amount);
          this.resultService.showWin(result.amount);
        } else {
          this.authService.updateBalance(user.saldo - result.amount);
          this.resultService.showLoss(result.amount);
        }
        this.isPlacing = false;
        this.isOpen = false;
      },
      error: () => {
        this.isPlacing = false;
        alert('Error al realizar la apuesta');
      }
    });
  }
}