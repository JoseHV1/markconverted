import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CONVERSION_ICONS, CONVERSION_META } from '../converter/models/converter.meta';
import { DarkModeService } from '../shared/services/dark-mode.service';
import { SiteHeaderComponent } from '../shared/components/site-header/site-header.component';
import { SiteFooterComponent } from '../shared/components/site-footer/site-footer.component';
import { HistoryEntry, STORAGE_KEYS } from '../shared/models/history-entry.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent],
  host: { '[class.dark-mode]': 'darkModeService.darkMode()' },
  template: `
  <app-site-header activePage="history"></app-site-header>

  <div class="page-body">

    <aside class="sidebar">
      <div class="sidebar-brand-wrap">
        <p class="sidebar-brand">MarkConvert</p>
        <p class="sidebar-tagline">Utility Hub</p>
      </div>
      <nav aria-label="Section navigation">
        <a class="sidebar-link" [routerLink]="['/']">
          <i class="bi bi-grid-3x3-gap" aria-hidden="true"></i>
          All Tools
        </a>
        <a class="sidebar-link" [routerLink]="['/editor']" [queryParams]="{type:'md-to-html'}">
          <i class="bi bi-pencil" aria-hidden="true"></i>
          Markdown Editor
        </a>
        <a class="sidebar-link sidebar-link-active" aria-current="page">
          <i class="bi bi-clock-history" aria-hidden="true"></i>
          Conversion History
        </a>
      </nav>
    </aside>

    <main class="main-content">

      <header class="content-header">
        <div>
          <h2>History</h2>
          <p>Manage and restore your recent Markdown transformations.</p>
        </div>
        <button class="clear-all-btn" (click)="clearAll()" aria-label="Clear all history">
          <i class="bi bi-trash3" aria-hidden="true"></i>
          Clear All History
        </button>
      </header>

      @if (entries().length > 0) {
        <div class="entry-list" role="list">
          @for (entry of entries(); track entry.id) {
            <div class="entry-row" role="listitem">
              <div class="entry-icon" [style.background]="meta[entry.type].bg">
                <i class="bi {{ tabIcon[entry.type] }}" [style.color]="meta[entry.type].fg" aria-hidden="true"></i>
              </div>
              <div class="entry-body">
                <div class="entry-meta">
                  <span class="entry-badge">{{ entry.label }}</span>
                  <span class="entry-time">{{ formatTime(entry.timestamp) }}</span>
                </div>
                <p class="entry-snippet">{{ entry.inputSnippet }}</p>
              </div>
              <div class="entry-actions">
                <button class="restore-btn" (click)="restore(entry)" aria-label="Restore this conversion">
                  <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                  Restore
                </button>
                <button class="delete-btn" (click)="delete(entry.id)" [attr.aria-label]="'Delete entry: ' + entry.label">
                  <i class="bi bi-trash3" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          }
        </div>

        <div class="info-panel">
          <div>
            <h3>Keep your workspace clean.</h3>
            <p>We store your last 50 conversions locally for 30 days. You can download or restore any snippet instantly.</p>
          </div>
        </div>
      } @else {
        <div class="empty-state" aria-live="polite">
          <i class="bi bi-clock-history empty-icon" aria-hidden="true"></i>
          <h3>No conversions yet</h3>
          <p>Your conversion history will appear here. <a [routerLink]="['/']">Go convert something</a></p>
        </div>
      }

    </main>

  </div><!-- /page-body -->

  <app-site-footer></app-site-footer>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8f9fa;
      font-family: 'Inter', system-ui, sans-serif;
    }

    :host.dark-mode { background: #010d1f; color: #e2eeff; }


    :host.dark-mode .page-body { background: #010d1f; }
    :host.dark-mode .sidebar {
      background: #041527;
      border-right-color: #143558;
    }
    :host.dark-mode .sidebar-link { color: #4d7a9a; }
    :host.dark-mode .sidebar-link:hover { background: rgba(255,255,255,0.06); color: #c5deff; }
    :host.dark-mode .sidebar-link-active { background: transparent; color: #3d9fff; border-right-color: #3d9fff; }

    :host.dark-mode .main-content { background: #010d1f; }
    :host.dark-mode .content-header h2 { color: #c5deff; }
    :host.dark-mode .content-header p { color: #4d7a9a; }
    :host.dark-mode .clear-all-btn { border-color: rgba(186,26,26,0.5); color: #ffb4ab; }
    :host.dark-mode .clear-all-btn:hover { background: rgba(186,26,26,0.15); }

    :host.dark-mode .entry-row {
      background: #061e38;
      border-color: #143558;
      box-shadow: none;
    }
    :host.dark-mode .entry-row:hover { border-color: #1e4d7a; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
    :host.dark-mode .entry-badge { background: #082448; color: #4d7a9a; }
    :host.dark-mode .entry-time { color: #2d5578; }
    :host.dark-mode .entry-snippet { color: #4d7a9a; }
    :host.dark-mode .restore-btn { color: #3d9fff; }
    :host.dark-mode .restore-btn:hover { background: rgba(61,159,255,0.15); }
    :host.dark-mode .delete-btn { color: #2d5578; }
    :host.dark-mode .delete-btn:hover { background: rgba(186,26,26,0.15); color: #ffb4ab; }

    :host.dark-mode .empty-state { color: #4d7a9a; }
    :host.dark-mode .empty-state h3 { color: #c5deff; }
    :host.dark-mode .empty-state a { color: #3d9fff; }
    :host.dark-mode .empty-icon { color: #143558; }

    :host.dark-mode .info-panel {
      background: rgba(61,159,255,0.06);
      border-color: rgba(61,159,255,0.2);
    }
    :host.dark-mode .info-panel h3 { color: #3d9fff; }
    :host.dark-mode .info-panel p { color: #4d7a9a; }


    .page-body {
      display: flex;
      min-height: calc(100vh - 64px);
    }

    .sidebar {
      width: 256px;
      flex-shrink: 0;
      border-right: 1px solid #c2c6d4;
      background: #f8f9fa;
      padding: 24px 16px;
      display: none;
      flex-direction: column;
      transition: background 250ms, border-color 250ms;
    }

    @media (min-width: 769px) {
      .sidebar { display: flex; }
    }

    .sidebar-brand-wrap {
      padding: 0 16px 16px;
      margin: 0 0 8px;
      border-bottom: 1px solid #e7e8e9;
      transition: border-color 250ms;
    }
    .sidebar-brand {
      font-size: 1rem;
      font-weight: 900;
      color: #003f87;
      margin: 0 0 2px;
      transition: color 250ms;
    }
    .sidebar-tagline {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #727784;
      margin: 0;
      transition: color 250ms;
    }

    :host.dark-mode .sidebar-brand-wrap { border-bottom-color: #143558; }
    :host.dark-mode .sidebar-brand { color: #acc7ff; }
    :host.dark-mode .sidebar-tagline { color: #2d5578; }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 6px;
      color: #424752;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      border-right: 3px solid transparent;
      transition: background 150ms, color 150ms, border-color 150ms;
      margin-bottom: 2px;
    }
    .sidebar-link:hover { background: #edeeef; color: #191c1d; }
    .sidebar-link-active { background: transparent; color: #003f87; font-weight: 600; border-right: 3px solid #003f87; }

    .main-content {
      flex: 1;
      padding: 32px 48px;
      max-width: 900px;
      transition: background 250ms;
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
    }

    .content-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #191c1d;
      letter-spacing: -0.02em;
      margin: 0 0 8px;
      transition: color 250ms;
    }

    .content-header p {
      color: #424752;
      font-size: 0.9375rem;
      margin: 0;
      transition: color 250ms;
    }

    .clear-all-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 1px solid #ba1a1a;
      border-radius: 6px;
      color: #ba1a1a;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 150ms;
    }
    .clear-all-btn:hover { background: #ffdad6; }

    .entry-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .entry-row {
      background: #ffffff;
      border: 1px solid #c2c6d4;
      border-radius: 8px;
      padding: 20px 24px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      box-shadow: 0 1px 3px rgba(0,61,128,0.05);
      transition: border-color 150ms, box-shadow 150ms, background 250ms;
    }
    .entry-row:hover {
      border-color: #003f87;
      box-shadow: 0 4px 12px rgba(0,61,128,0.10);
    }

    .entry-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.25rem;
    }

    .entry-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .entry-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .entry-badge {
      padding: 2px 8px;
      background: #e1e3e4;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #424752;
      transition: background 250ms, color 250ms;
    }

    .entry-time {
      font-size: 0.75rem;
      color: #727784;
      transition: color 250ms;
    }

    .entry-snippet {
      font-size: 0.875rem;
      color: #191c1d;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: italic;
      margin: 0;
      transition: color 250ms;
    }

    .entry-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .restore-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #0056b3;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms;
    }
    .restore-btn:hover { background: #d7e2ff; }

    .delete-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #727784;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: background 150ms, color 150ms;
    }
    .delete-btn:hover { background: #ffdad6; color: #ba1a1a; }

    .empty-state {
      text-align: center;
      padding: 80px 24px;
      color: #727784;
    }

    .empty-icon {
      font-size: 3rem;
      color: #c2c6d4;
      display: block;
      margin-bottom: 16px;
      transition: color 250ms;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: #191c1d;
      margin: 0 0 8px;
      transition: color 250ms;
    }

    .empty-state p { margin: 0; }

    .empty-state a {
      color: #0056b3;
      text-decoration: none;
    }
    .empty-state a:hover { text-decoration: underline; }

    .info-panel {
      margin-top: 32px;
      padding: 24px;
      background: #d7e2ff40;
      border: 1px dashed #acc7ff;
      border-radius: 8px;
      transition: background 250ms, border-color 250ms;
    }

    .info-panel h3 {
      color: #003f87;
      margin: 0 0 8px;
      font-size: 1rem;
      transition: color 250ms;
    }

    .info-panel p {
      color: #424752;
      font-size: 0.875rem;
      margin: 0;
      transition: color 250ms;
    }


    @media (max-width: 768px) {
      .main-content { padding: 16px 20px; }

      .content-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .entry-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .entry-actions {
        width: 100%;
        justify-content: flex-end;
      }

    }
  `],
})
export class HistoryComponent implements OnInit {
  private readonly router = inject(Router);
  readonly darkModeService = inject(DarkModeService);

  entries = signal<HistoryEntry[]>([]);

  readonly tabIcon = CONVERSION_ICONS;
  readonly meta = CONVERSION_META;

  ngOnInit(): void {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.history);
    if (savedHistory) {
      try {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const all: HistoryEntry[] = JSON.parse(savedHistory);
        const pruned = all.filter(e => e.timestamp >= thirtyDaysAgo);
        if (pruned.length !== all.length) {
          localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(pruned));
        }
        this.entries.set(pruned);
      } catch { /* ignore */ }
    }
  }

  restore(entry: HistoryEntry): void {
    localStorage.setItem(STORAGE_KEYS.pendingRestore, JSON.stringify(entry));
    this.router.navigate(['/editor'], { queryParams: { type: entry.type } });
  }

  delete(id: string): void {
    const updated = this.entries().filter(e => e.id !== id);
    this.entries.set(updated);
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(updated));
  }

  clearAll(): void {
    this.entries.set([]);
    localStorage.removeItem(STORAGE_KEYS.history);
  }

  formatTime(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60_000)    return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ts).toLocaleDateString();
  }
}
