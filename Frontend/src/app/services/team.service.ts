import { Injectable } from '@angular/core';

export interface TeamInfo {
  name: string;
  flag: string;
  country: string;
  league: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  
  private teams: Record<string, TeamInfo> = {
    // Fútbol - España
    'Real Madrid': { name: 'Real Madrid', flag: '⚪🟣', country: 'España', league: 'La Liga' },
    'Barcelona': { name: 'Barcelona', flag: '🔵🔴', country: 'España', league: 'La Liga' },
    'Atletico Madrid': { name: 'Atletico Madrid', flag: '🔴⚪', country: 'España', league: 'La Liga' },
    
    // Fútbol - Inglaterra
    'Manchester City': { name: 'Manchester City', flag: '🔵', country: 'Inglaterra', league: 'Premier League' },
    'Liverpool': { name: 'Liverpool', flag: '🔴', country: 'Inglaterra', league: 'Premier League' },
    'Chelsea': { name: 'Chelsea', flag: '🔵⚪', country: 'Inglaterra', league: 'Premier League' },
    'Arsenal': { name: 'Arsenal', flag: '🔴⚪', country: 'Inglaterra', league: 'Premier League' },
    'Manchester United': { name: 'Manchester United', flag: '🔴⚫', country: 'Inglaterra', league: 'Premier League' },
    
    // Fútbol - Otros
    'Bayern Munich': { name: 'Bayern Munich', flag: '🔴⚪', country: 'Alemania', league: 'Bundesliga' },
    'PSG': { name: 'PSG', flag: '🔵🔴', country: 'Francia', league: 'Ligue 1' },
    'Juventus': { name: 'Juventus', flag: '⚪⚫', country: 'Italia', league: 'Serie A' },
    'AC Milan': { name: 'AC Milan', flag: '🔴⚫', country: 'Italia', league: 'Serie A' },
    
    // NBA
    'LA Lakers': { name: 'LA Lakers', flag: '💜💛', country: 'USA', league: 'NBA' },
    'Boston Celtics': { name: 'Boston Celtics', flag: '☘️', country: 'USA', league: 'NBA' },
    'Golden State': { name: 'Golden State Warriors', flag: '💙💛', country: 'USA', league: 'NBA' },
    'Miami Heat': { name: 'Miami Heat', flag: '🔥', country: 'USA', league: 'NBA' },
    'Brooklyn Nets': { name: 'Brooklyn Nets', flag: '⚫⚪', country: 'USA', league: 'NBA' },
    'Chicago Bulls': { name: 'Chicago Bulls', flag: '🐂', country: 'USA', league: 'NBA' },
    
    // Tennis
    'Djokovic': { name: 'Novak Djokovic', flag: '🇷🇸', country: 'Serbia', league: 'ATP' },
    'Alcaraz': { name: 'Carlos Alcaraz', flag: '🇪🇸', country: 'España', league: 'ATP' },
    'Sinner': { name: 'Jannik Sinner', flag: '🇮🇹', country: 'Italia', league: 'ATP' },
    'Swiatek': { name: 'Iga Swiatek', flag: '🇵🇱', country: 'Polonia', league: 'WTA' },
    'Sabalenka': { name: 'Aryna Sabalenka', flag: '🇧🇾', country: 'Bielorrusia', league: 'WTA' },
    
    // eSports
    'G2 Esports': { name: 'G2 Esports', flag: '🎮', country: 'EU', league: 'LEC' },
    'Fnatic': { name: 'Fnatic', flag: '🟠', country: 'EU', league: 'LEC' },
    
    // Boxing
    'Tyson Fury': { name: 'Tyson Fury', flag: '🇬🇧', country: 'UK', league: 'WBC' },
    'Usyk': { name: 'Oleksandr Usyk', flag: '🇺🇦', country: 'Ucrania', league: 'WBC' },
  };

  getTeamFlag(teamName: string): string {
    const team = this.teams[teamName];
    return team?.flag || '🏆';
  }

  getTeamInfo(teamName: string): TeamInfo | null {
    return this.teams[teamName] || null;
  }

  getAllTeams(): TeamInfo[] {
    return Object.values(this.teams);
  }
}