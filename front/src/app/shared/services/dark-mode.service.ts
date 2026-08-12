import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../models/history-entry.model';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  readonly darkMode = signal(false);

  constructor() {
    let stored = false;
    try { stored = localStorage.getItem(STORAGE_KEYS.darkMode) === 'true'; } catch { /* ignore */ }
    this.darkMode.set(stored);
    document.body.classList.toggle('dark-mode', stored);
  }

  toggle(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    try { localStorage.setItem(STORAGE_KEYS.darkMode, String(next)); } catch { /* ignore */ }
    document.body.classList.toggle('dark-mode', next);
  }
}
