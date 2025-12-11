// Frontend/src/app/models/event.model.ts
export interface SportEvent {
  id: string;
  sport: 'football' | 'basketball' | 'tennis' | 'esports' | 'boxing' | 'other';
  sportIcon: string;
  league: string;
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  startTime: Date;
  status: 'scheduled' | 'live' | 'finished';
  score1?: number | string;
  score2?: number | string;
  minute?: number | string;
  period?: string;
  odds: {
    home: number;
    draw?: number;
    away: number;
  };
  imageUrl?: string;
  featured?: boolean;
}