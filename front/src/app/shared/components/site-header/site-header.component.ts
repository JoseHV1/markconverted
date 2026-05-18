import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DarkModeService } from '../../services/dark-mode.service';
import { PwaInstallService } from '../../services/pwa-install.service';

export type ActivePage = 'tools' | 'editor' | 'history';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  host: { '[class.dark-mode]': 'darkMode.darkMode()' },
  template: `
<header class="site-header">
  <div class="header-inner">

    <a class="logo" [routerLink]="['/']" aria-label="MarkConvert home">
      <svg class="logo-icon" viewBox="0 0 680 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="680" height="512" rx="90" fill="#003d80"/>
        <path fill="white" d="M252 108H218Q168 108 168 158V224Q168 256 132 256Q168 256 168 288V354Q168 404 218 404H252V374H228Q198 374 198 354V292Q198 270 172 256Q198 242 198 220V158Q198 138 228 138H252Z"/>
        <path fill="white" d="M292 108H330L340 240L350 108H388V404H358V220L340 372L322 220V404H292Z"/>
        <path fill="white" d="M428 108H462Q512 108 512 158V224Q512 256 548 256Q512 256 512 288V354Q512 404 462 404H428V374H452Q482 374 482 354V292Q482 270 508 256Q482 242 482 220V158Q482 138 452 138H428Z"/>
      </svg>
      <span class="logo-name">MarkConvert</span>
    </a>

    <nav class="header-nav" aria-label="Primary navigation">
      <a class="nav-link" [class.nav-link-active]="activePage === 'tools'"
         [routerLink]="['/']">Tools</a>
      <a class="nav-link" [class.nav-link-active]="activePage === 'editor'"
         [routerLink]="['/editor']" [queryParams]="{type:'md-to-html'}">Editor</a>
      <a class="nav-link" [class.nav-link-active]="activePage === 'history'"
         [routerLink]="['/history']">History</a>
    </nav>

    <div class="header-spacer"></div>

    <div class="header-actions">
      <button class="nav-dark-toggle" (click)="darkMode.toggle()"
              [attr.aria-label]="darkMode.darkMode() ? 'Switch to light mode' : 'Switch to dark mode'">
        <i class="bi" [class.bi-moon-fill]="!darkMode.darkMode()" [class.bi-sun-fill]="darkMode.darkMode()" aria-hidden="true"></i>
      </button>
      @if (pwa.canInstall()) {
        <button class="nav-install-btn" (click)="pwa.install()" aria-label="Install MarkConvert app">
          <i class="bi bi-download" aria-hidden="true"></i>
          Install App
        </button>
      }
    </div>

    <button class="nav-hamburger" aria-label="Toggle menu" (click)="menuOpen.set(!menuOpen())">
      <i class="bi" [class.bi-list]="!menuOpen()" [class.bi-x-lg]="menuOpen()" aria-hidden="true"></i>
    </button>

  </div>

  @if (menuOpen()) {
    <nav class="header-mobile-menu" aria-label="Mobile navigation">
      <a class="mobile-nav-btn mobile-nav-link" [routerLink]="['/']" (click)="menuOpen.set(false)">
        <i class="bi bi-grid-3x3-gap" aria-hidden="true"></i> Tools
      </a>
      <a class="mobile-nav-btn mobile-nav-link" [routerLink]="['/editor']" [queryParams]="{type:'md-to-html'}" (click)="menuOpen.set(false)">
        <i class="bi bi-pencil" aria-hidden="true"></i> Editor
      </a>
      <a class="mobile-nav-btn mobile-nav-link" [routerLink]="['/history']" (click)="menuOpen.set(false)">
        <i class="bi bi-clock-history" aria-hidden="true"></i> History
      </a>
      <button class="mobile-nav-btn mobile-dark-btn" (click)="darkMode.toggle(); menuOpen.set(false)">
        <i class="bi" [class.bi-moon-fill]="!darkMode.darkMode()" [class.bi-sun-fill]="darkMode.darkMode()" aria-hidden="true"></i>
        {{ darkMode.darkMode() ? 'Light mode' : 'Dark mode' }}
      </button>
      @if (pwa.canInstall()) {
        <button class="mobile-nav-btn mobile-install-btn" (click)="pwa.install(); menuOpen.set(false)">
          <i class="bi bi-download" aria-hidden="true"></i>
          Install app
        </button>
      }
    </nav>
  }
</header>
  `,
  styles: [`
    :host { display: block; }

    /* ════ DARK MODE ═══════════════════════════════════════════ */
    :host.dark-mode .site-header { background: #041527; border-bottom-color: #143558; box-shadow: none; }
    :host.dark-mode .logo-name { color: #c5deff; }
    :host.dark-mode .nav-link { color: #4d7a9a; border-bottom-color: transparent; }
    :host.dark-mode .nav-link:hover { color: #c5deff; }
    :host.dark-mode .nav-link-active { color: #3d9fff; border-bottom-color: #3d9fff; }
    :host.dark-mode .nav-dark-toggle { color: #4d7a9a; }
    :host.dark-mode .nav-dark-toggle:hover { background: rgba(255,255,255,0.08); color: #fbbf24; }
    :host.dark-mode .nav-install-btn { background: rgba(0,86,179,0.25); color: #acc7ff; }
    :host.dark-mode .nav-install-btn:hover { background: rgba(0,86,179,0.4); color: #d7e2ff; }
    :host.dark-mode .nav-hamburger { color: #4d7a9a; }
    :host.dark-mode .nav-hamburger:hover { background: rgba(255,255,255,0.08); color: #c5deff; }
    :host.dark-mode .header-mobile-menu { background: #041527; border-top-color: #143558; }
    :host.dark-mode .mobile-nav-btn { color: rgba(197,222,255,0.6); }
    :host.dark-mode .mobile-nav-btn:hover { background: rgba(255,255,255,0.08); color: #c5deff; }
    :host.dark-mode .mobile-nav-link { color: #3d9fff; }
    :host.dark-mode .mobile-nav-link:hover { background: rgba(61,159,255,0.12); color: #acc7ff; }
    :host.dark-mode .mobile-dark-btn { color: #fbbf24; }
    :host.dark-mode .mobile-install-btn { color: #3d9fff; border-top-color: #143558; }

    /* ════ HEADER ═══════════════════════════════════════════════ */
    .site-header {
      background: #ffffff;
      border-bottom: 1px solid #c2c6d4;
      box-shadow: 0 1px 4px rgba(0,61,128,0.06);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background 250ms, border-color 250ms, box-shadow 250ms;
    }

    .header-inner {
      max-width: 1280px; margin: 0 auto;
      padding: 0 32px; height: 64px;
      display: flex; align-items: center; gap: 8px;
    }

    .logo {
      display: flex; align-items: center; gap: 10px;
      margin-right: 8px; flex-shrink: 0; text-decoration: none;
    }

    .logo-icon { width: 58px; height: 44px; border-radius: 10px; display: block; flex-shrink: 0; }

    .logo-name {
      font-size: 1.0625rem; font-weight: 700;
      color: #003f87; letter-spacing: -0.01em;
      transition: color 250ms;
    }

    .header-nav {
      display: none; align-items: center; gap: 2px; margin-left: 16px;
    }

    .nav-link {
      padding: 6px 10px; font-size: 0.875rem; font-weight: 500; color: #424752;
      border: none; border-bottom: 2px solid transparent;
      background: none; cursor: pointer; text-decoration: none;
      display: inline-flex; align-items: center;
      transition: color 150ms, border-color 150ms; white-space: nowrap;
    }
    .nav-link:hover { color: #0056b3; }
    .nav-link-active { color: #0056b3; font-weight: 600; border-bottom-color: #0056b3; }

    .header-spacer { flex: 1; }

    .header-actions {
      display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: 8px;
    }

    .nav-dark-toggle {
      width: 38px; height: 38px; border: none; border-radius: 6px;
      background: transparent; color: #727784; font-size: 1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 150ms, color 150ms;
    }
    .nav-dark-toggle:hover { background: #edeeef; color: #0056b3; }

    .nav-install-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 0 16px; height: 36px; border: none; border-radius: 4px;
      background: #0056b3; color: #ffffff; font-size: 0.8125rem; font-weight: 600;
      white-space: nowrap; cursor: pointer; letter-spacing: 0.01em;
      transition: background 150ms, transform 100ms;
    }
    .nav-install-btn:hover { background: #004491; }
    .nav-install-btn:active { transform: scale(0.97); }

    .nav-hamburger {
      display: none; width: 40px; height: 40px;
      border: none; border-radius: 6px; background: transparent;
      color: #424752; font-size: 1.25rem; cursor: pointer;
      align-items: center; justify-content: center; margin-left: auto;
      transition: background 150ms, color 150ms;
    }
    .nav-hamburger:hover { background: #edeeef; color: #191c1d; }

    .header-mobile-menu {
      display: flex; flex-direction: column;
      border-top: 1px solid #c2c6d4; padding: 8px 0; background: #ffffff;
      transition: background 250ms, border-color 250ms;
    }

    .mobile-nav-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 24px; border: none; background: transparent;
      color: #424752; font-size: 0.9rem; font-weight: 500;
      text-align: left; cursor: pointer; text-decoration: none;
      transition: background 150ms, color 150ms;
    }
    .mobile-nav-btn:hover { background: #edeeef; color: #191c1d; }
    .mobile-nav-link { color: #0056b3; font-weight: 600; }
    .mobile-nav-link:hover { background: #d7e2ff; color: #003f87; }
    .mobile-dark-btn { color: #727784; }
    .mobile-install-btn { color: #0056b3; font-weight: 600; border-top: 1px solid #c2c6d4; margin-top: 4px; }

    @media (min-width: 769px) {
      .header-nav { display: flex; }
      .nav-hamburger { display: none !important; }
    }

    @media (max-width: 768px) {
      .header-inner { padding: 0 20px; }
      .nav-hamburger { display: flex; }
    }
  `],
})
export class SiteHeaderComponent {
  @Input() activePage: ActivePage = 'tools';

  readonly darkMode = inject(DarkModeService);
  readonly pwa = inject(PwaInstallService);
  readonly menuOpen = signal(false);
}
