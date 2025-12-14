import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { ConnectionService } from './connection.service';

export interface User {
  id: string;
  email: string;
  username: string;
  saldo: number;
  esDemo: boolean;
}

export interface SportEvent {
  id: string;
  sport: string;
  sportIcon: string;
  league: string;
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  startTime: Date;
  status: string;
  score1: number;
  score2: number;
  minute: number;
  period: string;
  odds: { home: number; draw?: number; away: number };
  featured: boolean;
}

export interface BetSelection {
  eventId: string;
  event: SportEvent;
  pick: 'home' | 'draw' | 'away';
  odds: number;
  pickLabel: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private eventsSubject = new BehaviorSubject<SportEvent[]>([]);
  events$ = this.eventsSubject.asObservable();

  private betSlipSubject = new BehaviorSubject<BetSelection[]>([]);
  betSlip$ = this.betSlipSubject.asObservable();

  private tokenCache: string | null = null;
  private initialized = false;

  constructor(
    private http: HttpClient,
    private connectionService: ConnectionService
  ) {
    this.init();
  }

  private get apiUrl(): string {
    return this.connectionService.getApiUrl();
  }

  private async init() {
    // Esperar a que la configuración de conexión esté lista
    await this.connectionService.ensureLoaded();
    await this.loadUserFromStorage();
    this.loadEvents();
    this.initialized = true;
    
    // Suscribirse a cambios de configuración para recargar eventos
    this.connectionService.config$.subscribe(() => {
      if (this.initialized) {
        console.log('🔄 Config cambió, recargando eventos...');
        this.loadEvents();
      }
    });
  }

  // ========== AUTH ==========
  private async loadUserFromStorage() {
    try {
      const { value: token } = await Preferences.get({ key: 'token' });
      const { value: userData } = await Preferences.get({ key: 'user' });

      if (token && userData) {
        this.tokenCache = token;
        this.userSubject.next(JSON.parse(userData));
        this.refreshUser();
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log(`🔐 Intentando login en: ${this.apiUrl}/auth/login`);
      const res: any = await this.http.post(`${this.apiUrl}/auth/login`, { email, password })
        .pipe(timeout(10000))
        .toPromise();
      await this.saveAuthData(res.access_token, res.user);
      console.log('✅ Login exitoso');
      return true;
    } catch (e: any) {
      console.error('❌ Login error:', e.message || e);
      return false;
    }
  }

  async register(email: string, username: string, password: string): Promise<boolean> {
    try {
      console.log(`📝 Intentando registro en: ${this.apiUrl}/auth/register`);
      const res: any = await this.http.post(`${this.apiUrl}/auth/register`, { email, username, password })
        .pipe(timeout(10000))
        .toPromise();
      await this.saveAuthData(res.access_token, res.user);
      console.log('✅ Registro exitoso');
      return true;
    } catch (e: any) {
      console.error('❌ Register error:', e.message || e);
      return false;
    }
  }

  private async saveAuthData(token: string, user: User) {
    this.tokenCache = token;
    await Preferences.set({ key: 'token', value: token });
    await Preferences.set({ key: 'user', value: JSON.stringify(user) });
    this.userSubject.next(user);
  }

  async logout() {
    this.tokenCache = null;
    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'user' });
    this.userSubject.next(null);
    this.betSlipSubject.next([]);
  }

  async refreshUser() {
    const token = await this.getToken();
    if (!token) return;

    this.http.get<User>(`${this.apiUrl}/auth/me`, { headers: this.getHeaders(token) })
      .pipe(
        timeout(10000),
        catchError((err) => {
          console.error('Error refreshing user:', err);
          return of(null);
        })
      )
      .subscribe(user => {
        if (user) {
          Preferences.set({ key: 'user', value: JSON.stringify(user) });
          this.userSubject.next(user);
        }
      });
  }

  updateBalance(newBalance: number) {
    const user = this.userSubject.value;
    if (user) {
      const updated = { ...user, saldo: Math.round(newBalance * 100) / 100 };
      Preferences.set({ key: 'user', value: JSON.stringify(updated) });
      this.userSubject.next(updated);
    }
  }

  // ========== EVENTS ==========
  loadEvents() {
    const url = `${this.apiUrl}/events`;
    console.log(`📡 Cargando eventos desde: ${url}`);
    
    this.http.get<any[]>(url)
      .pipe(
        timeout(10000),
        catchError((err) => {
          console.error('❌ Error cargando eventos:', err.message || err);
          return of([]);
        })
      )
      .subscribe(events => {
        if (events.length > 0) {
          console.log(`✅ ${events.length} eventos cargados`);
          const mapped = events.map(e => this.mapEvent(e));
          this.eventsSubject.next(mapped);
        } else {
          console.log('⚠️ No se recibieron eventos');
        }
      });
  }

  private mapEvent(e: any): SportEvent {
    const icons: Record<string, string> = {
      football: 'football-outline',
      basketball: 'basketball-outline',
      tennis: 'tennisball-outline',
      esports: 'game-controller-outline',
      boxing: 'fitness-outline',
    };
    return {
      id: e._id,
      sport: e.sport,
      sportIcon: icons[e.sport] || 'trophy-outline',
      league: e.league,
      team1: e.team1,
      team2: e.team2,
      flag1: e.flag1,
      flag2: e.flag2,
      startTime: new Date(e.startTime),
      status: e.status,
      score1: e.score1 || 0,
      score2: e.score2 || 0,
      minute: e.minute || 0,
      period: e.period || '',
      odds: e.odds,
      featured: e.featured || false,
    };
  }

  // ========== BET SLIP ==========
  addToSlip(event: SportEvent, pick: 'home' | 'draw' | 'away', odds: number) {
    const current = [...this.betSlipSubject.value];
    const existingIndex = current.findIndex(s => s.eventId === event.id);
    const pickLabel = pick === 'home' ? event.team1 : pick === 'away' ? event.team2 : 'Empate';
    const selection: BetSelection = { eventId: event.id, event, pick, odds, pickLabel };

    if (existingIndex >= 0) {
      if (current[existingIndex].pick === pick) {
        current.splice(existingIndex, 1);
      } else {
        current[existingIndex] = selection;
      }
    } else {
      current.push(selection);
    }
    this.betSlipSubject.next(current);
  }

  removeFromSlip(eventId: string) {
    const filtered = this.betSlipSubject.value.filter(s => s.eventId !== eventId);
    this.betSlipSubject.next(filtered);
  }

  clearSlip() {
    this.betSlipSubject.next([]);
  }

  get slipCount(): number {
    return this.betSlipSubject.value.length;
  }

  get totalOdds(): number {
    const val = this.betSlipSubject.value.reduce((acc, s) => acc * s.odds, 1);
    return Math.round(val * 100) / 100;
  }

  isSelected(eventId: string, pick: string): boolean {
    const sel = this.betSlipSubject.value.find(s => s.eventId === eventId);
    return sel?.pick === pick;
  }

  // ========== PLACE BET ==========
  async placeBet(stake: number): Promise<{ success: boolean; message?: string }> {
    const token = await this.getToken();
    if (!token) return { success: false, message: 'No autenticado' };

    const selections = this.betSlipSubject.value;
    const body = {
      selections: selections.map(s => ({
        eventId: s.eventId,
        eventName: `${s.event.team1} vs ${s.event.team2}`,
        market: 'Resultado Final',
        pick: s.pick,
        pickLabel: s.pickLabel,
        odds: s.odds
      })),
      stake,
      totalOdds: this.totalOdds,
      potentialWin: Math.round(stake * this.totalOdds * 100) / 100
    };

    try {
      const res: any = await this.http.post(`${this.apiUrl}/bets`, body, { headers: this.getHeaders(token) })
        .pipe(timeout(10000))
        .toPromise();
      this.clearSlip();
      if (res.newBalance !== undefined) {
        this.updateBalance(res.newBalance);
      }

      // Simular resultado
      setTimeout(() => this.simulateBet(res.bet._id), 5000);

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.error?.message || 'Error al apostar' };
    }
  }

  private async simulateBet(betId: string) {
    const token = await this.getToken();
    if (!token) return;

    this.http.post<any>(`${this.apiUrl}/bets/${betId}/simulate`, {}, { headers: this.getHeaders(token) })
      .pipe(timeout(10000))
      .subscribe({
        next: () => this.refreshUser(),
        error: (e) => console.error('Simulate error:', e)
      });
  }

  // ========== HELPERS ==========
  private async getToken(): Promise<string | null> {
    if (this.tokenCache) return this.tokenCache;
    const { value } = await Preferences.get({ key: 'token' });
    this.tokenCache = value;
    return value;
  }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }
}