import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const saved = localStorage.getItem('betpro_user');
    const token = localStorage.getItem('betpro_token');
    if (saved && token) {
      try {
        const user = JSON.parse(saved);
        this.userSubject.next(user);
        // Sincronizar con el servidor al cargar
        this.syncUserFromServer();
      } catch {
        this.logout();
      }
    }
  }

  private syncUserFromServer(): void {
    const token = this.token;
    if (!token) return;
    
    this.http.get<User>(`${this.API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (user) => {
        if (user) {
          const updated = { ...user, id: user.id };
          localStorage.setItem('betpro_user', JSON.stringify(updated));
          this.userSubject.next(updated);
        }
      },
      error: () => {
        // Token inválido, hacer logout
        this.logout();
      }
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  register(email: string, username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, { email, username, password })
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('betpro_token', res.access_token);
    localStorage.setItem('betpro_user', JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  logout(): void {
    localStorage.removeItem('betpro_token');
    localStorage.removeItem('betpro_user');
    this.userSubject.next(null);
  }

  updateBalance(newBalance: number): void {
    const user = this.userSubject.value;
    if (user) {
      const updated: User = { ...user, saldo: newBalance };
      localStorage.setItem('betpro_user', JSON.stringify(updated));
      this.userSubject.next(updated);
      console.log('💰 Saldo actualizado:', newBalance);
    }
  }

  // Refrescar datos del usuario desde el servidor
  refreshUser(): void {
    this.syncUserFromServer();
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('betpro_token');
  }
}