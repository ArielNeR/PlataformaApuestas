// Frontend/src/app/models/bet.model.ts
export interface BetSelection {
  eventId: string;
  event: SportEvent;
  pick: 'home' | 'draw' | 'away';
  odds: number;
  pickLabel: string;
}

export interface Bet {
  id: string;
  selections: BetSelection[];
  type: 'simple' | 'multiple';
  stake: number;
  totalOdds: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  profit?: number;
  createdAt: Date;
  settledAt?: Date;
}

export interface BetHistoryItem {
  event: string;
  pick: string;
  odds: number;
  amount: number;
  result: 'won' | 'lost' | 'pending';
  profit: number;
}