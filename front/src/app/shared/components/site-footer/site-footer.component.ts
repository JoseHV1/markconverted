import { Component, inject } from '@angular/core';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  host: { '[class.dark-mode]': 'darkMode.darkMode()' },
  template: `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="footer-logo-name">MarkConvert</span>
      <span class="footer-tagline">&copy; 2025 MarkConvert. High-performance Markdown tools.</span>
    </div>
    <div class="footer-links">
      <a class="footer-link" href="#">Privacy</a>
      <a class="footer-link" href="#">Terms</a>
      <a class="footer-link" href="#">API Docs</a>
      <a class="footer-link" href="#">GitHub</a>
    </div>
  </div>
</footer>
  `,
  styles: [`
    :host { display: block; }

    .site-footer {
      background: #ffffff;
      border-top: 1px solid #c2c6d4;
      transition: background 250ms, border-color 250ms;
    }
    .footer-inner {
      max-width: 1280px; margin: 0 auto; padding: 24px 32px;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
    }
    .footer-brand { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .footer-logo-name { font-size: 0.9375rem; font-weight: 700; color: #003f87; transition: color 250ms; }
    .footer-tagline { font-size: 0.75rem; color: #727784; transition: color 250ms; }
    .footer-links { display: flex; gap: 24px; }
    .footer-link {
      font-size: 0.75rem; color: #727784; text-decoration: none; opacity: 0.8;
      transition: color 150ms;
    }
    .footer-link:hover { color: #0056b3; text-decoration: underline; }

    :host.dark-mode .site-footer { background: #020f21; border-top-color: rgba(255,255,255,0.06); }
    :host.dark-mode .footer-logo-name { color: #acc7ff; }
    :host.dark-mode .footer-tagline { color: rgba(197,222,255,0.4); }
    :host.dark-mode .footer-link { color: rgba(197,222,255,0.4); }
    :host.dark-mode .footer-link:hover { color: #c5deff; text-decoration: underline; }

    @media (max-width: 768px) {
      .footer-inner { padding: 20px; flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `],
})
export class SiteFooterComponent {
  readonly darkMode = inject(DarkModeService);
}
