import { Component, inject } from '@angular/core';
import { Toast, ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
<div class="toast-stack" aria-live="polite" aria-atomic="false" aria-label="Notifications">
  @for (toast of toastService.toasts(); track toast.id) {
    <div class="toast-item"
         [class]="'toast-item toast-' + toast.type"
         role="alert"
         [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'">
      <i class="bi {{ iconClass(toast) }} toast-icon" aria-hidden="true"></i>
      <div class="toast-body">
        @if (toast.title) {
          <span class="toast-title">{{ toast.title }}</span>
        }
        <span class="toast-message">{{ toast.message }}</span>
      </div>
      <button class="toast-close"
              (click)="toastService.remove(toast.id)"
              aria-label="Dismiss notification">
        <i class="bi bi-x" aria-hidden="true"></i>
      </button>
    </div>
  }
</div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 300px;
      max-width: 420px;
      pointer-events: none;
    }

    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      border-left: 4px solid transparent;
      background: #061e38;
      box-shadow: 0 8px 24px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
      pointer-events: auto;
      animation: toast-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(20px) scale(0.96); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }

    .toast-success { border-left-color: #22c55e; }
    .toast-error   { border-left-color: #ffb4ab; }
    .toast-warning { border-left-color: #f59e0b; }
    .toast-info    { border-left-color: #acc7ff; }

    .toast-icon {
      font-size: 1.0625rem;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .toast-success .toast-icon { color: #22c55e; }
    .toast-error   .toast-icon { color: #ffb4ab; }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info    .toast-icon { color: #acc7ff; }

    .toast-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .toast-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #f0f1f2;
      line-height: 1.3;
    }

    .toast-message {
      font-size: 0.8125rem;
      color: #4d7a9a;
      line-height: 1.45;
    }

    .toast-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #7aa3c0;
      cursor: pointer;
      font-size: 1rem;
      transition: background 150ms, color 150ms;
      margin-top: 1px;
    }

    .toast-close:hover {
      background: #334155;
      color: #c5deff;
    }

    .toast-close:focus-visible {
      outline: 2px solid #acc7ff;
      outline-offset: 1px;
    }

    @media (max-width: 480px) {
      .toast-stack {
        left: 16px;
        right: 16px;
        bottom: 16px;
        min-width: unset;
        max-width: unset;
      }
    }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);

  iconClass(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'bi-check-circle-fill',
      error:   'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info:    'bi-info-circle-fill',
    };
    return map[toast.type] ?? 'bi-info-circle-fill';
  }
}
