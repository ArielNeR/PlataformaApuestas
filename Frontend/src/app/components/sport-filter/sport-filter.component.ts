// Frontend/src/app/components/sport-filter/sport-filter.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SportOption {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-sport-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-3 overflow-x-auto carousel pb-2">
      <button *ngFor="let sport of sports"
              (click)="selectSport(sport.id)"
              class="flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap transition"
              [class.bg-indigo-600]="selectedSport === sport.id"
              [class.bg-gray-800]="selectedSport !== sport.id"
              [class.hover:bg-indigo-500]="selectedSport === sport.id"
              [class.hover:bg-gray-700]="selectedSport !== sport.id">
        <i [class]="sport.icon"></i>
        {{ sport.name }}
      </button>
    </div>
  `
})
export class SportFilterComponent {
  @Output() sportChange = new EventEmitter<string>();
  
  selectedSport = 'all';
  
  sports: SportOption[] = [
    { id: 'all', name: 'Todos', icon: 'fas fa-fire' },
    { id: 'football', name: 'Fútbol', icon: 'fas fa-futbol' },
    { id: 'basketball', name: 'Baloncesto', icon: 'fas fa-basketball' },
    { id: 'tennis', name: 'Tenis', icon: 'fas fa-table-tennis-paddle-ball' },
    { id: 'esports', name: 'eSports', icon: 'fas fa-gamepad' },
    { id: 'boxing', name: 'Boxeo', icon: 'fas fa-hand-fist' }
  ];

  selectSport(sportId: string): void {
    this.selectedSport = sportId;
    this.sportChange.emit(sportId);
  }
}