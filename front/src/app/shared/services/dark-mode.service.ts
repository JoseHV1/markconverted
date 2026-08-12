import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../models/history-entry.model';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  readonly darkMode = signal(false);

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEYS.darkMode) === 'true';
    this.darkMode.set(stored);
    document.body.classList.toggle('dark-mode', stored);
  }

  toggle(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    localStorage.setItem(STORAGE_KEYS.darkMode, String(next));
    document.body.classList.toggle('dark-mode', next);
  }
}
