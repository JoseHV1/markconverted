import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  NavigationSkipped,
} from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-route-loader',
  standalone: true,
  template: `
@if (loading()) {
  <div class="route-loader" role="status" aria-label="Loading page"></div>
}
  `,
  styles: [`
    .route-loader {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      height: 3px;
      background: #0056b3;
      background: linear-gradient(90deg, #0056b3 0%, #3d9fff 50%, #0056b3 100%);
      background-size: 200% 100%;
      animation: route-loader-grow 900ms ease-out forwards, route-loader-shimmer 1.2s linear infinite;
      box-shadow: 0 0 8px rgba(0,86,179,0.6);
    }

    @keyframes route-loader-grow {
      0%   { width: 0%; }
      100% { width: 90%; }
    }

    @keyframes route-loader-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class RouteLoaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  readonly loading = signal(false);
  private routerSub: Subscription | null = null;

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped
      ) {
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
