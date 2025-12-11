import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSub = new BehaviorSubject<any>(null);
  user$ = this.userSub.asObservable();

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('betflow_user');
    if (saved) this.userSub.next(JSON.parse(saved));
  }

  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:3000/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('betflow_token', res.access_token);
        localStorage.setItem('betflow_user', JSON.stringify(res.user));
        this.userSub.next(res.user);
      })
    );
  }

  register(email: string, username: string, password: string) {
    return this.http.post<any>('http://localhost:3000/auth/register', { email, username, password }).pipe(
      tap(res => {
        localStorage.setItem('betflow_token', res.access_token);
        localStorage.setItem('betflow_user', JSON.stringify(res.user));
        this.userSub.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('betflow_token');
    localStorage.removeItem('betflow_user');
    this.userSub.next(null);
  }

  get token() {
    return localStorage.getItem('betflow_token');
  }
}