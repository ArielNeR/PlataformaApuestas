// Frontend/src/app/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface EventUpdate {
  eventId: string;
  minute?: number;
  score1?: number;
  score2?: number;
  odds?: {
    home: number;
    draw?: number;
    away: number;
  };
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket;
  private eventUpdates = new BehaviorSubject<EventUpdate | null>(null);

  constructor() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('connect', () => {
      console.log('🔌 Conectado al servidor WebSocket');
    });

    this.socket.on('eventUpdate', (data: EventUpdate) => {
      this.eventUpdates.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
    });
  }

  getEventUpdates(): Observable<EventUpdate | null> {
    return this.eventUpdates.asObservable();
  }
}