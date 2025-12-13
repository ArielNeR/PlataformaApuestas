import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'live',
    loadComponent: () => import('./pages/live/live.component').then(m => m.LiveComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'modes',
    loadComponent: () => import('./pages/modes/modes.component').then(m => m.ModesComponent)
  },
  {
    path: 'my-bets',
    loadComponent: () => import('./pages/my-bets/my-bets.component').then(m => m.MyBetsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];