import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventsService } from './events.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private eventsService: EventsService) {}

  afterInit() {
    this.startLiveSimulation();
  }

  // Configuración realista por deporte
  private getSportConfig(sport: string) {
    return {
      football: {
        maxTime: 90,
        maxScore: 8,           // Máximo goles por equipo (muy raro más de 5)
        scoreChance: 0.02,     // 2% probabilidad de gol por tick
        scoreIncrement: 1,
        periods: ['1T', '2T'],
        periodLength: 45
      },
      basketball: {
        maxTime: 48,
        maxScore: 140,         // Máximo puntos NBA por equipo
        scoreChance: 0.35,     // Alta probabilidad de anotar
        scoreIncrement: 2,     // Promedio 2 puntos por anotación
        periods: ['Q1', 'Q2', 'Q3', 'Q4'],
        periodLength: 12
      },
      tennis: {
        maxTime: 5,            // 5 sets máximo
        maxScore: 3,           // Máximo sets para ganar
        scoreChance: 0.08,
        scoreIncrement: 1,
        periods: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'],
        periodLength: 1
      },
      esports: {
        maxTime: 60,
        maxScore: 3,           // Bo3 o Bo5
        scoreChance: 0.04,
        scoreIncrement: 1,
        periods: ['Mapa 1', 'Mapa 2', 'Mapa 3'],
        periodLength: 20
      },
      boxing: {
        maxTime: 36,           // 12 rounds de 3 minutos
        maxScore: 12,
        scoreChance: 0.03,
        scoreIncrement: 1,
        periods: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12'],
        periodLength: 3
      }
    }[sport] || {
      maxTime: 90,
      maxScore: 10,
      scoreChance: 0.03,
      scoreIncrement: 1,
      periods: ['1T', '2T'],
      periodLength: 45
    };
  }

  private startLiveSimulation() {
    setInterval(async () => {
      const liveEvents = await this.eventsService.findLive();
      
      for (const event of liveEvents) {
        const config = this.getSportConfig(event.sport);
        
        // Incrementar tiempo
        let currentMinute = typeof event.minute === 'number' ? event.minute : 0;
        let newMinute = Math.min(currentMinute + 1, config.maxTime);

        // Scores actuales
        let newScore1 = typeof event.score1 === 'number' ? event.score1 : 0;
        let newScore2 = typeof event.score2 === 'number' ? event.score2 : 0;

        // Solo anotar si no excede el máximo
        if (Math.random() < config.scoreChance) {
          if (Math.random() > 0.5) {
            // Equipo 1 anota
            if (newScore1 < config.maxScore) {
              newScore1 += config.scoreIncrement;
              // Para basketball, variar entre 1, 2 o 3 puntos
              if (event.sport === 'basketball') {
                const points = Math.random() < 0.3 ? 3 : (Math.random() < 0.5 ? 1 : 2);
                newScore1 = Math.min(newScore1 - config.scoreIncrement + points, config.maxScore);
              }
            }
          } else {
            // Equipo 2 anota
            if (newScore2 < config.maxScore) {
              newScore2 += config.scoreIncrement;
              if (event.sport === 'basketball') {
                const points = Math.random() < 0.3 ? 3 : (Math.random() < 0.5 ? 1 : 2);
                newScore2 = Math.min(newScore2 - config.scoreIncrement + points, config.maxScore);
              }
            }
          }
        }

        // Calcular período actual
        let period = '';
        const periodIndex = Math.min(
          Math.floor(newMinute / config.periodLength),
          config.periods.length - 1
        );
        period = config.periods[periodIndex];

        // Actualizar odds (fluctuación basada en marcador)
        const scoreDiff = newScore1 - newScore2;
        const homeAdvantage = scoreDiff * 0.05;
        const change = (Math.random() - 0.5) * 0.08;
        
        const newOdds = {
          home: Math.max(1.05, Math.min(10, +(event.odds.home - homeAdvantage + change).toFixed(2))),
          draw: event.odds.draw 
            ? Math.max(1.05, Math.min(15, +(event.odds.draw + Math.abs(scoreDiff) * 0.1).toFixed(2))) 
            : undefined,
          away: Math.max(1.05, Math.min(10, +(event.odds.away + homeAdvantage - change).toFixed(2)))
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
    }, 10000); // Cada 10 segundos
  }
}