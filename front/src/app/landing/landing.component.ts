import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CONVERSION_OPTIONS, ConversionOption } from '../converter/models/converter.models';
import { CONVERSION_ICONS, CONVERSION_META } from '../converter/models/converter.meta';
import { DarkModeService } from '../shared/services/dark-mode.service';
import { SiteHeaderComponent } from '../shared/components/site-header/site-header.component';
import { SiteFooterComponent } from '../shared/components/site-footer/site-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  host: { '[class.dark-mode]': 'darkModeService.darkMode()' },
  template: `
<app-site-header activePage="tools"></app-site-header>

<section class="hero">
  <div class="hero-inner">
    <h1 class="hero-title">Convert documents instantly</h1>
    <p class="hero-subtitle">The document converter for developers and writers</p>
    <p class="hero-sub">
      Markdown → HTML, TXT, PDF or DOCX · PDF → Markdown · HTML → Markdown.<br>
      No signup, no watermarks, no file storage.
    </p>
  </div>
</section>

<section class="tools-section" id="tools" aria-label="Choose a conversion">
  <div class="tools-inner">
    <div class="tools-grid">
      @for (opt of options; track opt.value) {
        <button
          class="tool-card"
          [attr.aria-label]="opt.label"
          (click)="openEditor(opt)"
        >
          <div class="tool-icon-wrap">
            <i class="bi {{ tabIcon[opt.value] }} tool-icon" aria-hidden="true"></i>
          </div>
          <span class="tool-name">{{ opt.label }}</span>
          <span class="tool-desc">{{ meta[opt.value].desc }}</span>
          <div class="tool-card-footer">
            <span class="tool-open-link">
              {{ opt.inputType === 'pdf' || opt.inputType === 'docx' ? 'Upload File' : 'Open Editor' }}
              <i class="bi bi-arrow-right" aria-hidden="true"></i>
            </span>
          </div>
        </button>
      }
    </div>
  </div>
</section>

<section class="adv-editor-section" aria-label="Advanced Editor">
  <div class="adv-editor-inner">

    <div class="adv-editor-preview" aria-hidden="true">
      <div class="adv-preview-chrome">
        <div class="adv-preview-dots">
          <span></span><span></span><span></span>
        </div>
        <div class="adv-preview-url">markconvert.app/editor?type=md-to-html</div>
      </div>
      <div class="adv-preview-body">
        <div class="adv-pane adv-pane-left">
          <div class="adv-pane-label">MARKDOWN</div>
          <div class="adv-code-line"><span class="adv-syntax-h">## </span>Introduction</div>
          <div class="adv-code-line">Write Markdown here and</div>
          <div class="adv-code-line">see it rendered instantly.</div>
          <div class="adv-code-line adv-code-blank"></div>
          <div class="adv-code-line"><span class="adv-syntax-h">### </span>Features</div>
          <div class="adv-code-line">- Live preview</div>
          <div class="adv-code-line">- Syntax highlighting</div>
          <div class="adv-code-line">- One-click export</div>
        </div>
        <div class="adv-divider"></div>
        <div class="adv-pane adv-pane-right">
          <div class="adv-pane-label">PREVIEW</div>
          <div class="adv-rendered-h2">Introduction</div>
          <div class="adv-rendered-p">Write Markdown here and see it rendered instantly.</div>
          <div class="adv-rendered-h3">Features</div>
          <div class="adv-rendered-ul">
            <div class="adv-rendered-li">Live preview</div>
            <div class="adv-rendered-li">Syntax highlighting</div>
            <div class="adv-rendered-li">One-click export</div>
          </div>
        </div>
      </div>
    </div>

    <div class="adv-editor-content">
      <p class="adv-editor-eyebrow">EDITOR AVANZADO</p>
      <h2 class="adv-editor-title">A real editor for real work</h2>
      <p class="adv-editor-desc">
        The full-screen editor gives you a split view, live preview, keyboard shortcuts,
        and drag-and-drop file support &mdash; everything you need to convert without friction.
      </p>
      <ul class="adv-feature-list" aria-label="Editor features">
        <li class="adv-feature-item">
          <i class="bi bi-check-circle-fill adv-check-icon" aria-hidden="true"></i>
          <span>Live preview (Split view)</span>
        </li>
        <li class="adv-feature-item">
          <i class="bi bi-check-circle-fill adv-check-icon" aria-hidden="true"></i>
          <span>Full GFM support (GitHub Flavored Markdown)</span>
        </li>
        <li class="adv-feature-item">
          <i class="bi bi-check-circle-fill adv-check-icon" aria-hidden="true"></i>
          <span>Bulk export to multiple formats</span>
        </li>
      </ul>
      <a class="adv-cta-btn" [routerLink]="['/editor']" [queryParams]="{type:'md-to-html'}">
        Open Editor <i class="bi bi-arrow-right" aria-hidden="true"></i>
      </a>
    </div>

  </div>
</section>

<app-site-footer></app-site-footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f8f9fa;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      transition: background 250ms, color 250ms;
    }

    /* Deep-navy palette derived from brand #003d80 / #0056b3 */

    :host.dark-mode { background: #010d1f; color: #e2eeff; }
    :host.dark-mode .hero { background: #041527; border-bottom-color: #143558; }
    :host.dark-mode .hero-title { color: #c5deff; }
    :host.dark-mode .hero-subtitle { color: #7aa3c0; }
    :host.dark-mode .hero-sub { color: #4d7a9a; }

    .hero {
      background: #ffffff;
      padding: 72px 32px 64px;
      text-align: center;
      border-bottom: 1px solid #c2c6d4;
      transition: background 250ms, border-color 250ms;
    }
    .hero-inner { max-width: 672px; margin: 0 auto; }
    .hero-title {
      font-size: 2.5rem; font-weight: 700;
      color: #003f87; letter-spacing: -0.02em;
      margin: 0 0 16px; line-height: 1.2;
    }
    .hero-subtitle {
      font-size: 1.125rem; font-weight: 500;
      color: #424752; margin: 0 0 10px; letter-spacing: -0.01em;
    }
    .hero-sub {
      font-size: 0.9375rem; color: #727784; line-height: 1.7; margin: 0;
    }

    :host.dark-mode .tools-section { background: #010d1f; }
    :host.dark-mode .tool-card { background: #061e38; border-color: #143558; box-shadow: none; }
    :host.dark-mode .tool-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-color: #1e4d7a; }
    :host.dark-mode .tool-name { color: #c5deff; }
    :host.dark-mode .tool-desc { color: #4d7a9a; }
    :host.dark-mode .tool-card-footer { border-top-color: #143558; }
    :host.dark-mode .tool-icon { color: #acc7ff; }
    :host.dark-mode .tool-open-link { color: #3d9fff; }

    .tools-section {
      background: #f8f9fa;
    }
    .tools-inner {
      max-width: 1280px; margin: 0 auto; padding: 60px 40px;
    }
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    .tool-card {
      position: relative; display: flex; flex-direction: column;
      align-items: center; text-align: center; padding: 28px 20px 20px;
      background: #ffffff; border: 1px solid #c2c6d4; border-radius: 8px;
      cursor: pointer; overflow: hidden; gap: 0;
      transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
      box-shadow: 0 1px 4px rgba(0,61,128,0.06);
    }
    .tool-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,61,128,0.12);
      border-color: #0056b3;
    }
    .tool-card:focus-visible { outline: 3px solid #acc7ff; outline-offset: 2px; }

    .tool-icon-wrap {
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
    }
    .tool-icon { font-size: 2rem; color: #003f87; transition: color 250ms; }
    .tool-name { font-size: 0.9375rem; font-weight: 700; color: #003f87; margin-bottom: 8px; display: block; flex: 1; transition: color 250ms; }
    .tool-desc { font-size: 0.8125rem; color: #424752; line-height: 1.6; display: block; }
    .tool-card-footer {
      width: 100%; border-top: 1px solid #e7e8e9;
      padding-top: 14px; margin-top: 16px;
      display: flex; justify-content: center;
      transition: border-color 250ms;
    }
    .tool-open-link {
      font-size: 0.8125rem; font-weight: 600; color: #0056b3;
      display: inline-flex; align-items: center; gap: 4px;
      transition: gap 150ms;
    }
    .tool-card:hover .tool-open-link { gap: 8px; }

    .adv-editor-section {
      background: #041527;
      padding: 80px 32px;
      border-bottom: 1px solid #143558;
    }
    .adv-editor-inner {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
    }
    .adv-editor-preview {
      border-radius: 10px; overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
      border: 1px solid #1e3d5c;
    }
    .adv-preview-chrome {
      display: flex; align-items: center; gap: 10px;
      background: #0a2540; padding: 10px 14px;
      border-bottom: 1px solid #1e3d5c;
    }
    .adv-preview-dots { display: flex; gap: 6px; }
    .adv-preview-dots span { width: 10px; height: 10px; border-radius: 50%; background: #1e3d5c; }
    .adv-preview-url {
      flex: 1; font-size: 0.7rem; color: #2d5578;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
    }
    .adv-preview-body { display: flex; background: #061e38; min-height: 280px; }
    .adv-pane { flex: 1; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
    .adv-pane-label { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.12em; color: #2d5578; margin-bottom: 4px; }
    .adv-divider { width: 1px; background: #1e3d5c; flex-shrink: 0; }
    .adv-code-line { font-size: 0.775rem; color: #4d7a9a; font-family: 'JetBrains Mono', 'Consolas', monospace; line-height: 1.6; }
    .adv-code-blank { height: 0.5rem; }
    .adv-syntax-h { color: #3d9fff; font-weight: 700; }
    .adv-rendered-h2 { font-size: 0.9rem; font-weight: 700; color: #c5deff; margin-bottom: 4px; }
    .adv-rendered-h3 { font-size: 0.8rem; font-weight: 700; color: #acc7ff; margin: 8px 0 4px; }
    .adv-rendered-p { font-size: 0.75rem; color: #7aa3c0; line-height: 1.5; }
    .adv-rendered-ul { display: flex; flex-direction: column; gap: 2px; }
    .adv-rendered-li { font-size: 0.75rem; color: #7aa3c0; padding-left: 10px; position: relative; }
    .adv-rendered-li::before { content: '•'; position: absolute; left: 0; color: #3d9fff; }
    .adv-editor-eyebrow { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; color: #3d9fff; margin: 0 0 12px; text-transform: uppercase; }
    .adv-editor-title { font-size: 2rem; font-weight: 800; color: #f0f1f2; margin: 0 0 16px; line-height: 1.15; letter-spacing: -0.02em; }
    .adv-editor-desc { font-size: 1rem; color: #7aa3c0; line-height: 1.65; margin: 0 0 36px; }
    .adv-feature-list { list-style: none; padding: 0; margin: 0 0 40px; display: flex; flex-direction: column; gap: 14px; }
    .adv-feature-item { display: flex; align-items: center; gap: 10px; font-size: 0.9375rem; color: #c5deff; }
    .adv-check-icon { color: #3ee8c8; font-size: 1.1rem; flex-shrink: 0; }
    .adv-cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 28px; border-radius: 10px;
      background: #0056b3; color: #fff; font-size: 0.9375rem; font-weight: 700;
      text-decoration: none; transition: background 150ms, transform 150ms, box-shadow 150ms;
      box-shadow: 0 4px 14px rgba(0,86,179,0.4);
    }
    .adv-cta-btn:hover { background: #003f87; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,86,179,0.5); }

    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

    @media (max-width: 1100px) {
      .tools-grid { grid-template-columns: repeat(3, 1fr); }
      .tools-inner { padding: 48px 32px; }
    }

    @media (max-width: 900px) {
      .tools-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .tools-inner { padding: 40px 24px; }
      .adv-editor-inner { grid-template-columns: 1fr; gap: 40px; }
      .adv-editor-section { padding: 56px 24px; }
    }

    @media (max-width: 768px) {
      .hero { padding: 40px 20px 36px; }
      .hero-title { font-size: 1.875rem; }
      .tools-inner { padding: 32px 20px; }
    }

    @media (max-width: 480px) {
      .tools-grid { grid-template-columns: 1fr; gap: 12px; }
      .tool-card { padding: 24px 20px 20px; }
      .tool-icon { font-size: 1.75rem; }
      .hero-title { font-size: 1.625rem; }
    }
  `],
})
export class LandingComponent {
  private readonly router = inject(Router);
  readonly darkModeService = inject(DarkModeService);

  readonly options = CONVERSION_OPTIONS;
  readonly tabIcon = CONVERSION_ICONS;
  readonly meta = CONVERSION_META;

  openEditor(opt: ConversionOption): void {
    this.router.navigate(['/editor'], { queryParams: { type: opt.value } });
  }
}
