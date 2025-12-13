// Mapa de equipos a URLs de logos reales
export const TEAM_LOGOS: Record<string, { logo: string; country: string }> = {
  // FÚTBOL - España
  'Real Madrid': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    country: 'https://flagcdn.com/w80/es.png'
  },
  'Barcelona': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    country: 'https://flagcdn.com/w80/es.png'
  },
  'Atletico Madrid': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
    country: 'https://flagcdn.com/w80/es.png'
  },

  // FÚTBOL - Inglaterra
  'Manchester City': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    country: 'https://flagcdn.com/w80/gb-eng.png'
  },
  'Liverpool': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    country: 'https://flagcdn.com/w80/gb-eng.png'
  },
  'Chelsea': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    country: 'https://flagcdn.com/w80/gb-eng.png'
  },
  'Arsenal': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    country: 'https://flagcdn.com/w80/gb-eng.png'
  },
  'Manchester United': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    country: 'https://flagcdn.com/w80/gb-eng.png'
  },

  // FÚTBOL - Alemania/Italia/Francia
  'Bayern Munich': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
    country: 'https://flagcdn.com/w80/de.png'
  },
  'PSG': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    country: 'https://flagcdn.com/w80/fr.png'
  },
  'Juventus': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg',
    country: 'https://flagcdn.com/w80/it.png'
  },
  'AC Milan': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    country: 'https://flagcdn.com/w80/it.png'
  },

  // NBA
  'LA Lakers': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
    country: 'https://flagcdn.com/w80/us.png'
  },
  'Boston Celtics': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
    country: 'https://flagcdn.com/w80/us.png'
  },
  'Golden State': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
    country: 'https://flagcdn.com/w80/us.png'
  },
  'Miami Heat': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg',
    country: 'https://flagcdn.com/w80/us.png'
  },
  'Brooklyn Nets': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Brooklyn_Nets_newlogo.svg',
    country: 'https://flagcdn.com/w80/us.png'
  },
  'Chicago Bulls': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg',
    country: 'https://flagcdn.com/w80/us.png'
  },

  // TENNIS
  'Djokovic': {
    logo: 'https://flagcdn.com/w80/rs.png',
    country: 'https://flagcdn.com/w80/rs.png'
  },
  'Alcaraz': {
    logo: 'https://flagcdn.com/w80/es.png',
    country: 'https://flagcdn.com/w80/es.png'
  },
  'Sinner': {
    logo: 'https://flagcdn.com/w80/it.png',
    country: 'https://flagcdn.com/w80/it.png'
  },
  'Swiatek': {
    logo: 'https://flagcdn.com/w80/pl.png',
    country: 'https://flagcdn.com/w80/pl.png'
  },
  'Sabalenka': {
    logo: 'https://flagcdn.com/w80/by.png',
    country: 'https://flagcdn.com/w80/by.png'
  },

  // ESPORTS
  'G2 Esports': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Esports_organization_G2_Esports_logo.svg',
    country: 'https://flagcdn.com/w80/eu.png'
  },
  'Fnatic': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/4/43/Esports_organization_Fnatic_logo.svg',
    country: 'https://flagcdn.com/w80/eu.png'
  },

  // BOXING
  'Tyson Fury': {
    logo: 'https://flagcdn.com/w80/gb.png',
    country: 'https://flagcdn.com/w80/gb.png'
  },
  'Usyk': {
    logo: 'https://flagcdn.com/w80/ua.png',
    country: 'https://flagcdn.com/w80/ua.png'
  },
};

export function getTeamLogo(teamName: string): string {
  return TEAM_LOGOS[teamName]?.logo || 'https://via.placeholder.com/80?text=' + encodeURIComponent(teamName.substring(0, 2));
}

export function getTeamCountry(teamName: string): string {
  return TEAM_LOGOS[teamName]?.country || 'https://flagcdn.com/w80/un.png';
}