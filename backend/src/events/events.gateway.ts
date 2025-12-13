import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventsService } from './events.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private eventsService: EventsService) {}

  afterInit() {
    console.log('⚽ WebSocket Gateway iniciado');
    this.startLiveSimulation();
  }

  private getSportConfig(sport: string) {
    const configs: Record<string, any> = {
      football: {
        maxTime: 90,
        maxScore: 6,
        scoreChance: 0.03,
        periods: ['1T', '2T'],
        periodLength: 45
      },
      basketball: {
        maxTime: 48,
        maxScore: 130,
        scoreChance: 0.4,
        minScorePerPlay: 1,
        maxScorePerPlay: 3,
        periods: ['Q1', 'Q2', 'Q3', 'Q4'],
        periodLength: 12
      },
      tennis: {
        maxTime: 5,
        maxScore: 3,
        scoreChance: 0.1,
        periods: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'],
        periodLength: 1
      },
      esports: {
        maxTime: 45,
        maxScore: 2,
        scoreChance: 0.04,
        periods: ['Mapa 1', 'Mapa 2', 'Mapa 3'],
        periodLength: 15
      },
      boxing: {
        maxTime: 36,
        maxScore: 10,
        scoreChance: 0.02,
        periods: Array.from({ length: 12 }, (_, i) => `R${i + 1}`),
        periodLength: 3
      }
    };
    return configs[sport] || configs.football;
  }

  private startLiveSimulation() {
    setInterval(async () => {
      const liveEvents = await this.eventsService.findLive();
      
      for (const event of liveEvents) {
        const config = this.getSportConfig(event.sport);
        
        // Incrementar tiempo
        let currentMinute = typeof event.minute === 'number' ? event.minute : 0;
        let newMinute = Math.min(currentMinute + 1, config.maxTime);

        // Scores - INDEPENDIENTES para cada equipo
        let newScore1 = typeof event.score1 === 'number' ? event.score1 : 0;
        let newScore2 = typeof event.score2 === 'number' ? event.score2 : 0;

        // Equipo 1 intenta anotar
        if (Math.random() < config.scoreChance && newScore1 < config.maxScore) {
          if (event.sport === 'basketball') {
            const points = Math.random() < 0.2 ? 3 : (Math.random() < 0.5 ? 2 : 1);
            newScore1 = Math.min(newScore1 + points, config.maxScore);
          } else {
            newScore1 += 1;
          }
        }

        // Equipo 2 intenta anotar - DECISIÓN INDEPENDIENTE
        if (Math.random() < config.scoreChance && newScore2 < config.maxScore) {
          if (event.sport === 'basketball') {
            const points = Math.random() < 0.2 ? 3 : (Math.random() < 0.5 ? 2 : 1);
            newScore2 = Math.min(newScore2 + points, config.maxScore);
          } else {
            newScore2 += 1;
          }
        }

        // Calcular período
        let period = '';
        if (config.periods && config.periods.length > 0) {
          const periodIndex = Math.min(
            Math.floor(newMinute / config.periodLength),
            config.periods.length - 1
          );
          period = config.periods[periodIndex];
        }

        // Actualizar odds basado en diferencia de marcador
        const scoreDiff = newScore1 - newScore2;
        const oddsAdjust = scoreDiff * 0.03;
        
        const newOdds = {
          home: Math.max(1.05, Math.min(8, +(event.odds.home - oddsAdjust + (Math.random() - 0.5) * 0.05).toFixed(2))),
          draw: event.odds.draw 
            ? Math.max(1.05, Math.min(12, +(event.odds.draw + Math.abs(scoreDiff) * 0.08).toFixed(2))) 
            : undefined,
          away: Math.max(1.05, Math.min(8, +(event.odds.away + oddsAdjust + (Math.random() - 0.5) * 0.05).toFixed(2)))
        };

        await this.eventsService.updateEvent(event._id.toString(), {
          minute: newMinute,
          score1: newScore1,
          score2: newScore2,
          period,
          odds: newOdds as any
        });

        this.server.emit('eventUpdate', {
          eventId: event._id.toString(),
          minute: newMinute,
          score1: newScore1,
          score2: newScore2,
          period,
          odds: newOdds
        });
      }
    }, 8000); // Cada 8 segundos
  }
}