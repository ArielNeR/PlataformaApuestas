import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonIcon, IonLabel, IonSpinner, IonToggle,
  ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifi, wifiOutline, checkmarkCircle, closeCircle, arrowBack, server, refresh } from 'ionicons/icons';
import { ConnectionService } from '../../services/connection.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-connection',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
    IonIcon, IonLabel, IonSpinner, IonToggle
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-button slot="start" fill="clear" routerLink="/tabs/profile">
          <ion-icon name="arrow-back" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-title class="font-bold">Conexión al Servidor</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="p-4">
        
        <!-- Status Card -->
        <div class="status-card" [class.connected]="isConnected" [class.disconnected]="isConnected === false">
          <div class="status-icon">
            <ion-icon [name]="isConnected ? 'checkmark-circle' : isConnected === false ? 'close-circle' : 'wifi-outline'"></ion-icon>
          </div>
          <div class="status-info">
            <h3 class="status-title">
              {{ isConnected ? 'Conectado' : isConnected === false ? 'Desconectado' : 'Sin verificar' }}
            </h3>
            <p class="status-message">{{ statusMessage }}</p>
            <p *ngIf="latency" class="status-latency">Latencia: {{ latency }}ms</p>
          </div>
        </div>

        <!-- Server Config -->
        <div class="config-card">
          <h2 class="section-title">
            <ion-icon name="server"></ion-icon>
            Configuración del Servidor
          </h2>
          
          <!-- IP Input -->
          <div class="input-group">
            <label class="input-label">Dirección IP del servidor</label>
            <input 
              type="text" 
              [(ngModel)]="serverIp" 
              placeholder="192.168.1.100"
              class="form-input"
              [disabled]="testing">
            <p class="input-hint">Ejemplo: 192.168.1.100 o 10.0.0.5</p>
          </div>

          <!-- Port Input -->
          <div class="input-group">
            <label class="input-label">Puerto</label>
            <input 
              type="number" 
              [(ngModel)]="serverPort" 
              placeholder="3000"
              class="form-input port-input"
              [disabled]="testing">
            <p class="input-hint">Por defecto: 3000</p>
          </div>

          <!-- Use HTTPS Toggle -->
          <div class="toggle-row">
            <ion-label>Usar HTTPS</ion-label>
            <ion-toggle [(ngModel)]="useHttps" [disabled]="testing"></ion-toggle>
          </div>

          <!-- Current URL Preview -->
          <div class="url-preview">
            <span class="url-label">URL actual:</span>
            <code class="url-value">{{ fullUrl }}</code>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          
          <!-- Test Connection Button -->
          <ion-button 
            expand="block" 
            class="test-btn"
            [disabled]="testing || !serverIp"
            (click)="testConnection()">
            <ion-spinner *ngIf="testing" name="crescent" class="mr-2"></ion-spinner>
            <ion-icon *ngIf="!testing" name="wifi" slot="start"></ion-icon>
            {{ testing ? 'Probando conexión...' : 'Probar Conexión' }}
          </ion-button>

          <!-- Save & Connect Button -->
          <ion-button 
            expand="block" 
            color="success"
            class="save-btn"
            [disabled]="testing || !serverIp || !isConnected"
            (click)="saveAndConnect()">
            <ion-icon name="checkmark-circle" slot="start"></ion-icon>
            Guardar y Conectar
          </ion-button>

          <!-- Reset Button -->
          <ion-button 
            expand="block" 
            fill="outline"
            color="medium"
            class="reset-btn"
            [disabled]="testing"
            (click)="resetToDefault()">
            <ion-icon name="refresh" slot="start"></ion-icon>
            Restaurar valores por defecto
          </ion-button>
        </div>

        <!-- Info Card -->
        <div class="info-card">
          <h4>💡 ¿Cómo encontrar la IP del servidor?</h4>
          <ol>
            <li>En el equipo donde corre el backend, abre una terminal</li>
            <li>En Windows: escribe <code>ipconfig</code></li>
            <li>En Mac/Linux: escribe <code>ifconfig</code> o <code>ip addr</code></li>
            <li>Busca la IP de tu red local (ej: 192.168.x.x)</li>
            <li>Asegúrate de que el backend esté corriendo con: <code>npm run start:dev</code></li>
          </ol>
        </div>

        <!-- Debug Info -->
        <div class="debug-card">
          <h4>🔧 Información de Debug</h4>
          <p><strong>URL configurada:</strong> {{ currentApiUrl }}</p>
          <p><strong>Eventos cargados:</strong> {{ eventsCount }}</p>
        </div>

        <!-- Connection Log -->
        <div *ngIf="connectionLog.length > 0" class="log-card">
          <h4>Registro de conexión</h4>
          <div class="log-entries">
            <div *ngFor="let log of connectionLog" class="log-entry" [class.success]="log.success" [class.error]="!log.success">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
          <ion-button fill="clear" size="small" (click)="clearLog()">Limpiar registro</ion-button>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .status-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #1f2937;
      border: 2px solid #374151;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }
    
    .status-card.connected {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }
    
    .status-card.disconnected {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }
    
    .status-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #374151;
    }
    
    .status-card.connected .status-icon {
      background: rgba(34, 197, 94, 0.2);
    }
    
    .status-card.disconnected .status-icon {
      background: rgba(239, 68, 68, 0.2);
    }
    
    .status-icon ion-icon {
      font-size: 32px;
      color: #9ca3af;
    }
    
    .status-card.connected .status-icon ion-icon {
      color: #22c55e;
    }
    
    .status-card.disconnected .status-icon ion-icon {
      color: #ef4444;
    }
    
    .status-info {
      flex: 1;
    }
    
    .status-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 4px;
    }
    
    .status-message {
      font-size: 14px;
      color: #9ca3af;
      margin: 0;
      white-space: pre-line;
    }
    
    .status-latency {
      font-size: 12px;
      color: #4ade80;
      margin: 4px 0 0;
    }
    
    .config-card {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 20px;
    }
    
    .section-title ion-icon {
      color: #818cf8;
    }
    
    .input-group {
      margin-bottom: 20px;
    }
    
    .input-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #d1d5db;
      margin-bottom: 8px;
    }
    
    .form-input {
      width: 100%;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 18px;
      font-family: monospace;
      color: #ffffff;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .form-input:focus {
      border-color: #6366f1;
    }
    
    .form-input::placeholder {
      color: #6b7280;
    }
    
    .form-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .port-input {
      width: 120px;
    }
    
    .input-hint {
      font-size: 12px;
      color: #6b7280;
      margin: 8px 0 0 4px;
    }
    
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-top: 1px solid #374151;
      margin-top: 10px;
    }
    
    .toggle-row ion-label {
      color: #d1d5db;
    }
    
    .url-preview {
      background: #111827;
      border-radius: 10px;
      padding: 12px 16px;
      margin-top: 16px;
    }
    
    .url-label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .url-value {
      font-size: 14px;
      color: #818cf8;
      word-break: break-all;
    }
    
    .actions-section {
      margin-bottom: 20px;
    }
    
    .test-btn, .save-btn, .reset-btn {
      --border-radius: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .mr-2 {
      margin-right: 8px;
    }
    
    .info-card, .debug-card {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    
    .info-card h4, .debug-card h4 {
      font-size: 14px;
      font-weight: 600;
      color: #818cf8;
      margin: 0 0 12px;
    }
    
    .info-card ol {
      margin: 0;
      padding-left: 20px;
      color: #9ca3af;
      font-size: 13px;
      line-height: 1.8;
    }
    
    .info-card code, .debug-card code {
      background: #1f2937;
      padding: 2px 6px;
      border-radius: 4px;
      color: #818cf8;
      font-size: 12px;
    }
    
    .debug-card p {
      margin: 6px 0;
      font-size: 13px;
      color: #9ca3af;
    }
    
    .debug-card strong {
      color: #d1d5db;
    }
    
    .log-card {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 12px;
      padding: 16px;
    }
    
    .log-card h4 {
      font-size: 14px;
      font-weight: 600;
      color: #9ca3af;
      margin: 0 0 12px;
    }
    
    .log-entries {
      max-height: 150px;
      overflow-y: auto;
    }
    
    .log-entry {
      display: flex;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #374151;
      font-size: 12px;
    }
    
    .log-entry:last-child {
      border-bottom: none;
    }
    
    .log-time {
      color: #6b7280;
      flex-shrink: 0;
    }
    
    .log-message {
      color: #d1d5db;
    }
    
    .log-entry.success .log-message {
      color: #4ade80;
    }
    
    .log-entry.error .log-message {
      color: #f87171;
    }
  `]
})
export class ConnectionPage implements OnInit {
  private connectionService = inject(ConnectionService);
  private apiService = inject(ApiService);
  private toastCtrl = inject(ToastController);

  serverIp = '';
  serverPort = 3000;
  useHttps = false;
  testing = false;
  isConnected: boolean | null = null;
  statusMessage = 'Ingresa la IP del servidor y prueba la conexión';
  latency: number | null = null;
  
  connectionLog: { time: string; message: string; success: boolean }[] = [];

  constructor() {
    addIcons({ wifi, wifiOutline, checkmarkCircle, closeCircle, arrowBack, server, refresh });
  }

  async ngOnInit() {
    const config = await this.connectionService.getConfig();
    this.serverIp = config.ip;
    this.serverPort = config.port;
    this.useHttps = config.useHttps;
    
    // Verificar conexión actual si ya hay IP
    if (this.serverIp && this.serverIp !== '192.168.1.100') {
      this.testConnection(true);
    }
  }

  get fullUrl(): string {
    const protocol = this.useHttps ? 'https' : 'http';
    return `${protocol}://${this.serverIp || 'xxx.xxx.xxx.xxx'}:${this.serverPort}`;
  }

  get currentApiUrl(): string {
    return this.connectionService.getApiUrl();
  }

  get eventsCount(): number {
    let count = 0;
    this.apiService.events$.subscribe(e => count = e.length).unsubscribe();
    return count;
  }

  async testConnection(silent = false) {
    if (!this.serverIp) {
      this.addLog('IP no configurada', false);
      return;
    }

    this.testing = true;
    this.statusMessage = 'Verificando conexión...';
    this.latency = null;

    const result = await this.connectionService.testConnection(
      this.serverIp, 
      this.serverPort, 
      this.useHttps
    );

    this.testing = false;
    this.isConnected = result.success;
    this.statusMessage = result.message;
    this.latency = result.latency || null;
    
    this.addLog(result.message, result.success);

    if (!silent) {
      const toast = await this.toastCtrl.create({
        message: result.success ? '✓ Conexión exitosa' : '✗ ' + result.message,
        duration: 2500,
        color: result.success ? 'success' : 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  async saveAndConnect() {
    await this.connectionService.saveConfig({
      ip: this.serverIp,
      port: this.serverPort,
      useHttps: this.useHttps
    });

    // Recargar eventos con la nueva configuración
    this.apiService.loadEvents();

    const toast = await this.toastCtrl.create({
      message: '✓ Configuración guardada y conectado',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    this.addLog('Configuración guardada y reconectado', true);
  }

  async resetToDefault() {
    this.serverIp = '192.168.1.100';
    this.serverPort = 3000;
    this.useHttps = false;
    this.isConnected = null;
    this.latency = null;
    this.statusMessage = 'Valores restaurados. Prueba la conexión.';
    
    this.addLog('Valores restaurados a defecto', true);
  }

  private addLog(message: string, success: boolean) {
    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.connectionLog.unshift({ time, message, success });
    if (this.connectionLog.length > 10) {
      this.connectionLog.pop();
    }
  }

  clearLog() {
    this.connectionLog = [];
  }
}