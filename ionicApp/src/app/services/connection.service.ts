import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface ConnectionConfig {
  ip: string;
  port: number;
  useHttps: boolean;
}

const STORAGE_KEY = 'server_config';
const DEFAULT_CONFIG: ConnectionConfig = {
  ip: '192.168.1.100',
  port: 3000,
  useHttps: false
};

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private config: ConnectionConfig = { ...DEFAULT_CONFIG };
  private configLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  
  // Observable para notificar cuando la config cambia
  private configSubject = new BehaviorSubject<ConnectionConfig>(DEFAULT_CONFIG);
  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = (async () => {
      try {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (value) {
          this.config = JSON.parse(value);
          this.configSubject.next(this.config);
        }
        this.configLoaded = true;
        console.log('📡 Config cargada:', this.config);
      } catch (e) {
        console.error('Error loading connection config:', e);
        this.configLoaded = true;
      }
    })();
    
    return this.loadingPromise;
  }

  async ensureLoaded(): Promise<void> {
    if (!this.configLoaded) {
      await this.loadConfig();
    }
  }

  async getConfig(): Promise<ConnectionConfig> {
    await this.ensureLoaded();
    return { ...this.config };
  }

  async saveConfig(config: ConnectionConfig): Promise<void> {
    this.config = { ...config };
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(config)
    });
    this.configSubject.next(this.config);
    console.log('💾 Config guardada:', this.config);
  }

  getApiUrl(): string {
    const protocol = this.config.useHttps ? 'https' : 'http';
    const url = `${protocol}://${this.config.ip}:${this.config.port}`;
    return url;
  }

  async getApiUrlAsync(): Promise<string> {
    await this.ensureLoaded();
    return this.getApiUrl();
  }

  async testConnection(ip: string, port: number, useHttps: boolean): Promise<{ success: boolean; message: string; latency?: number }> {
    const protocol = useHttps ? 'https' : 'http';
    const baseUrl = `${protocol}://${ip}:${port}`;
    
    console.log(`🔍 Probando conexión a: ${baseUrl}`);
    
    const startTime = Date.now();

    // Intentar primero con /health, luego con /events
    const endpoints = ['/health', '/events'];
    
    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`   Intentando: ${url}`);
        
        await firstValueFrom(
          this.http.get<any>(url).pipe(
            timeout(5000),
            catchError(err => {
              console.log(`   ❌ ${endpoint} falló:`, err.status || err.message);
              throw err;
            })
          )
        );
        
        const latency = Date.now() - startTime;
        console.log(`   ✅ Conectado via ${endpoint} (${latency}ms)`);
        
        return {
          success: true,
          message: `Conectado a ${ip}:${port}`,
          latency
        };
      } catch (error: any) {
        // Continuar con el siguiente endpoint
        if (endpoint === endpoints[endpoints.length - 1]) {
          // Último intento falló
          let message = 'Error de conexión';
          
          if (error.name === 'TimeoutError') {
            message = 'Tiempo de espera agotado (5s)';
          } else if (error.status === 0) {
            message = 'No se puede alcanzar el servidor. Verifica que:\n• El backend esté corriendo\n• La IP sea correcta\n• Estés en la misma red WiFi';
          } else if (error.status === 404) {
            message = 'Servidor encontrado pero endpoint no existe';
          } else if (error.status) {
            message = `Error HTTP: ${error.status}`;
          } else if (error.message) {
            message = error.message;
          }

          console.log(`   ❌ Conexión fallida: ${message}`);
          return { success: false, message };
        }
      }
    }

    return { success: false, message: 'Error desconocido' };
  }
}