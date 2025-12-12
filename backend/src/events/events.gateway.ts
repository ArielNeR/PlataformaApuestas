// backend/src/events/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventsService } from './events.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private eventsService: EventsService) {}

  afterInit() {
    console.log('🔌 WebSocket Gateway inicializado');
    this.startLiveSimulation();
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  private startLiveSimulation() {
    // Simular actualizaciones cada 10 segundos
    setInterval(async () => {
      const liveEvents = await this.eventsService.findLive();
      
      for (const event of liveEvents) {
        // Simular cambio de minuto
        let newMinute = (event.minute || 0) + 1;
        if (newMinute > 90) newMinute = 90;

        // Probabilidad de gol (5%)
        let newScore1 = event.score1;
        let newScore2 = event.score2;
        
        if (Math.random() < 0.05) {
          if (Math.random() > 0.5) {
            newScore1++;
          } else {
            newScore2++;
          }
        }

        // Simular cambio de cuotas
        const change = (Math.random() - 0.5) * 0.1;
        const newOdds = {
          home: Math.max(1.01, +(event.odds.home + change).toFixed(2)),
          draw: event.odds.draw ? Math.max(1.01, +(event.odds.draw + (Math.random() - 0.5) * 0.05).toFixed(2)) : undefined,
          away: Math.max(1.01, +(event.odds.away - change).toFixed(2))
        };

        // Actualizar en BD
        await this.eventsService.updateEvent(event._id.toString(), {
          minute: newMinute,
          score1: newScore1,
          score2: newScore2,
          odds: newOdds as any,
        });

        // Emitir actualización
        this.server.emit('eventUpdate', {
          eventId: event._id,
          minute: newMinute,
          score1: newScore1,
          score2: newScore2,
          odds: newOdds,
        });
      }
    }, 10000); // Cada 10 segundos
  }

  emitEventUpdate(eventId: string, data: any) {
    this.server.emit('eventUpdate', { eventId, ...data });
  }
}