// Frontend/src/app/pages/my-bets/my-bets.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService } from '../../services/bet.service';
import { BetHistoryItem } from '../../models/bet.model';

@Component({
  selector: 'app-my-bets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bets.component.html',
  styleUrls: ['./my-bets.component.scss']
})
export class MyBetsComponent implements OnInit {
  private betService = inject(BetService);

  bets: BetHistoryItem[] = [];
  stats = this.betService.getStats();
  activeTab: 'all' | 'pending' | 'settled' = 'all';

  ngOnInit(): void {
    this.bets = this.betService.getBetHistory();
  }

  setTab(tab: 'all' | 'pending' | 'settled'): void {
    this.activeTab = tab;
  }

  get filteredBets(): BetHistoryItem[] {
    switch (this.activeTab) {
      case 'pending':
        return this.bets.filter(b => b.result === 'pending');
      case 'settled':
        return this.bets.filter(b => b.result !== 'pending');
      default:
        return this.bets;
    }
  }
}