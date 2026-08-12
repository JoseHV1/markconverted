import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string, title?: string, duration = 4000): void { this.add(message, 'success', duration, title); }
  error(message: string, title?: string, duration = 6000): void   { this.add(message, 'error', duration, title); }
  warning(message: string, title?: string, duration = 4500): void { this.add(message, 'warning', duration, title); }
  info(message: string, title?: string, duration = 3500): void    { this.add(message, 'info', duration, title); }

  remove(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private add(message: string, type: ToastType, duration: number, title?: string): void {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, type, message, title, duration }]);
    setTimeout(() => this.remove(id), duration);
  }
}
