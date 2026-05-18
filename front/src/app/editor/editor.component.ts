import {
  Component, OnInit, OnDestroy, signal, computed, inject, SecurityContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { ConverterService } from '../converter/services/converter.service';
import {
  CONVERSION_OPTIONS, ConversionOption, ConversionType,
} from '../converter/models/converter.models';
import { CONVERSION_ICONS, CONVERSION_META } from '../converter/models/converter.meta';
import { DarkModeService } from '../shared/services/dark-mode.service';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { ToastService } from '../shared/components/toast/toast.service';
import { MarkdownEditorComponent } from '../shared/components/markdown-editor/markdown-editor.component';
import { SiteHeaderComponent } from '../shared/components/site-header/site-header.component';
import { HistoryEntry, STORAGE_KEYS } from '../shared/models/history-entry.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent, MarkdownEditorComponent, SiteHeaderComponent],
  host: { '[class.dark-mode]': 'darkModeService.darkMode()' },
  template: `
<app-site-header activePage="editor"></app-site-header>

<div class="stats-bar">
  <div class="stats-left">
    @if (!isFileInput) {
      <span class="stat"><span class="stat-num">{{ wordCount }}</span> Words</span>
      <span class="stat-div" aria-hidden="true"></span>
      <span class="stat"><span class="stat-num">{{ charCount }}</span> Chars</span>
      <span class="stat-div" aria-hidden="true"></span>
      <span class="stat"><span class="stat-num">{{ lineCount }}</span> Lines</span>
      @if (wordCount > 0) {
        <span class="stat-div" aria-hidden="true"></span>
        <span class="stat">
          <i class="bi bi-clock" aria-hidden="true"></i>&nbsp;{{ readingTime }} min read
        </span>
      }
    } @else if (opt) {
      <span class="stat conversion-name">
        <i class="bi {{ tabIcon[opt.value] }}" [style.color]="meta[opt.value].fg" aria-hidden="true"></i>&nbsp;
        {{ opt.label }}
      </span>
    }
  </div>
  <div class="stats-right">
    @if (!isFileInput && markdownText().length > 0) {
      <button class="toolbar-btn" (click)="clearInput()" aria-label="Clear editor">
        <i class="bi bi-trash3" aria-hidden="true"></i>
        Clear
      </button>
    }
    @if (!isLive && opt) {
      <button class="toolbar-convert-btn"
              [disabled]="!canConvert() || loading()"
              [style.background]="canConvert() && !loading() ? meta[opt.value].fg : ''"
              [style.box-shadow]="canConvert() && !loading() ? '0 4px 16px ' + meta[opt.value].shadow : 'none'"
              (click)="convert()"
              title="Convert (Ctrl+Enter)">
        @if (loading()) {
          <span class="btn-spinner" role="status" aria-hidden="true"></span>
          Converting…
        } @else {
          <i class="bi bi-arrow-right-circle-fill" aria-hidden="true"></i>
          Convert
        }
      </button>
    }
  </div>
</div>

@if (opt) {
<div class="editor-body">
  <div class="panels-row" [style]="'--split: ' + panelSplit() + '%'">

    <div class="panel panel-left">
      <div class="panel-head">
        <div class="panel-title">
          <i class="bi {{ inputIcon }}" [style.color]="meta[opt.value].fg" aria-hidden="true"></i>
          <span>{{ inputLabel }}</span>
        </div>
      </div>
      <div class="panel-body">
        @if (isFileInput) {
          <div class="drop-zone"
               [class.drag-over]="isDragging()"
               tabindex="0" role="button"
               [attr.aria-label]="opt.inputType === 'docx' ? 'Drop DOCX or click to browse' : 'Drop PDF or click to browse'"
               (click)="fileInput.click()"
               (keydown.enter)="fileInput.click()"
               (dragover)="$event.preventDefault(); isDragging.set(true)"
               (dragleave)="isDragging.set(false)"
               (drop)="onDrop($event)">
            @if (uploadedFile()) {
              <i class="bi {{ opt.inputType === 'docx' ? 'bi-file-earmark-word-fill' : 'bi-file-earmark-pdf-fill' }} dz-icon {{ opt.inputType === 'docx' ? 'docx-icon' : 'pdf-icon' }}" aria-hidden="true"></i>
              <p class="dz-filename">{{ uploadedFile()!.name }}</p>
              <span class="dz-size">{{ formatSize(uploadedFile()!.size) }}</span>
              <button class="secondary-btn" style="margin-top:8px" (click)="$event.stopPropagation(); fileInput.click()">
                <i class="bi bi-arrow-repeat"></i> Replace
              </button>
            } @else {
              <i class="bi bi-cloud-arrow-up dz-icon dz-icon-empty" aria-hidden="true"></i>
              <p class="dz-label">{{ opt.inputType === 'docx' ? 'Drop your DOCX here' : 'Drop your PDF here' }}</p>
              <span class="dz-hint">or click to browse · max 20 MB</span>
              <button class="secondary-btn" style="margin-top:12px" (click)="$event.stopPropagation(); fileInput.click()">
                <i class="bi bi-folder2-open"></i> Choose file
              </button>
            }
            @if (isDragging()) {
              <div class="dz-overlay" aria-hidden="true">
                <i class="bi bi-file-earmark-arrow-down-fill"></i> Release to upload
              </div>
            }
            <input #fileInput type="file"
                   [accept]="opt.inputType === 'docx' ? '.docx,.doc' : '.pdf'"
                   class="sr-only" aria-hidden="true"
                   (change)="onFileChange($event)" />
          </div>
        } @else {
          <div class="md-wrap"
               (dragover)="onMdDragOver($event)"
               (dragleave)="onMdDragLeave($event)"
               (drop)="onMdDrop($event)">
            <app-markdown-editor
              [value]="markdownText()"
              (valueChange)="onMarkdownChange($event)"
              [darkMode]="darkModeService.darkMode()"
              [inputType]="opt.inputType === 'html' ? 'html' : 'markdown'"
              [placeholderText]="opt.inputType === 'html' ? '<h1>Hello World</h1>\n\nPaste your HTML here…' : '# Hello World\n\nPaste or type your Markdown here…'"
            ></app-markdown-editor>
            @if (isDraggingMd()) {
              <div class="md-drop-overlay" aria-hidden="true">
                <i class="bi bi-file-earmark-text-fill"></i>
                {{ opt.inputType === 'html' ? 'Drop your .html file' : 'Drop your .md or .txt file' }}
              </div>
            }
          </div>
        }
      </div>
    </div>

    <div class="resize-handle"
         (mousedown)="startResize($event)"
         (dblclick)="resetSplit()"
         role="separator" aria-orientation="vertical"
         title="Drag to resize · Double-click to reset">
      <div class="resize-grip"></div>
    </div>

    <div class="panel panel-right" aria-live="polite" aria-atomic="true">
      <div class="panel-head">
        <div class="panel-title">
          <i class="bi {{ outputIcon() }}" [style.color]="meta[opt.value].fg" aria-hidden="true"></i>
          <span>{{ outputLabel() }}</span>
        </div>
        @if (result() || livePreview()) {
          <div class="panel-actions">
            <input type="text" class="filename-input"
                   [ngModel]="outputFilename()"
                   (ngModelChange)="outputFilename.set($event)"
                   [placeholder]="defaultFilename()"
                   aria-label="Output filename" />
            @if (opt.outputType !== 'pdf' && opt.outputType !== 'docx' && opt.outputType !== 'epub') {
              <button class="icon-btn" [class.icon-btn-success]="copied()" (click)="copyResult()"
                      [attr.aria-label]="copied() ? 'Copied!' : 'Copy to clipboard'">
                <i class="bi" [class.bi-clipboard]="!copied()" [class.bi-clipboard-check-fill]="copied()" aria-hidden="true"></i>
              </button>
            }
            <button class="icon-btn icon-btn-download" (click)="download()"
                    aria-label="Download result" title="Download (Ctrl+S)">
              <i class="bi bi-download" aria-hidden="true"></i>
            </button>
          </div>
        }
      </div>
      <div class="panel-body">
        @if (loading()) {
          <div class="panel-state">
            <div class="spinner" role="status" aria-label="Converting…"
                 [style.border-top-color]="meta[opt.value].fg"></div>
            <p class="state-label">Converting…</p>
          </div>
        } @else if (errorMsg()) {
          <div class="error-box" role="alert">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            {{ errorMsg() }}
          </div>
        } @else if (result()) {
          @if (opt.outputType === 'pdf' || opt.outputType === 'docx' || opt.outputType === 'epub') {
            <div class="panel-state">
              <i class="bi bi-file-earmark-check-fill state-check"
                 [style.color]="meta[opt.value].fg" aria-hidden="true"></i>
              <p class="state-label">{{ opt.outputType.toUpperCase() }} ready!</p>
              <p class="state-sub">Download started automatically.<br>Use the button above to download again.</p>
            </div>
          } @else if (opt.outputType === 'html') {
            <div class="ptabs" role="tablist">
              <button class="ptab" [class.ptab-on]="previewMode()==='preview'"
                      role="tab" [attr.aria-selected]="previewMode()==='preview'"
                      (click)="previewMode.set('preview')">Preview</button>
              <button class="ptab" [class.ptab-on]="previewMode()==='source'"
                      role="tab" [attr.aria-selected]="previewMode()==='source'"
                      (click)="previewMode.set('source')">Source</button>
            </div>
            @if (previewMode() === 'preview') {
              <div class="html-preview" [innerHTML]="safeHtmlResult()"></div>
            } @else {
              <pre class="result-pre"><code>{{ result() }}</code></pre>
            }
          } @else {
            <pre class="result-pre"><code>{{ result() }}</code></pre>
          }
        } @else if (livePreview()) {
          <div class="ptabs" role="tablist">
            <button class="ptab" [class.ptab-on]="previewMode()==='preview'"
                    role="tab" [attr.aria-selected]="previewMode()==='preview'"
                    (click)="previewMode.set('preview')">
              Preview <span class="live-badge">LIVE</span>
            </button>
            <button class="ptab" [class.ptab-on]="previewMode()==='source'"
                    role="tab" [attr.aria-selected]="previewMode()==='source'"
                    (click)="previewMode.set('source')">Source</button>
          </div>
          @if (previewMode() === 'preview') {
            <div class="html-preview" [innerHTML]="safeHtmlPreview()"></div>
          } @else {
            <pre class="result-pre"><code>{{ livePreview() }}</code></pre>
          }
        } @else {
          <div class="panel-state">
            <i class="bi bi-arrow-left-circle state-empty" aria-hidden="true"></i>
            <p class="state-label">
              @if (opt.outputType === 'html' && opt.inputType === 'markdown') {
                Start typing to see a live preview
              } @else {
                Output will appear here
              }
            </p>
          </div>
        }
      </div>
    </div>

  </div><!-- /panels-row -->
</div><!-- /editor-body -->
}

<app-toast />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: #f8f9fa;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      transition: background 250ms, color 250ms;
    }

    :host.dark-mode { background: #010d1f; color: #e2eeff; }



    :host.dark-mode .stats-bar { background: #041527; border-bottom-color: #143558; }
    :host.dark-mode .stat { color: #4d7a9a; }
    :host.dark-mode .stat-num { color: #3d9fff; }
    :host.dark-mode .stat-div { background: #143558; }
    :host.dark-mode .toolbar-btn { border-color: #143558; color: #4d7a9a; background: transparent; }
    :host.dark-mode .toolbar-btn:hover { border-color: #1e4d7a; color: #ffb4ab; background: rgba(186,26,26,0.12); }

    :host.dark-mode .editor-body { background: #010d1f; }
    :host.dark-mode .panel { background: #061e38; border-color: #143558; }
    :host.dark-mode .panel-head { background: #041527; border-color: #143558; }
    :host.dark-mode .panel-title { color: #c5deff; }
    :host.dark-mode .resize-grip { background: #143558; }
    :host.dark-mode .resize-handle:hover .resize-grip { background: #3d9fff; }
    :host.dark-mode .resize-handle:hover { background: rgba(61,159,255,0.06); }
    :host.dark-mode .drop-zone { border-color: #143558; }
    :host.dark-mode .drop-zone:hover,
    :host.dark-mode .drop-zone.drag-over { background: rgba(0,86,179,0.15); border-color: #3d9fff; }
    :host.dark-mode .dz-icon-empty { color: #2d5578; }
    :host.dark-mode .dz-label, :host.dark-mode .dz-filename { color: #c5deff; }
    :host.dark-mode .dz-hint { color: #3a6385; }
    :host.dark-mode .result-pre { background: #041527; color: #c5deff; }
    :host.dark-mode .html-preview { color: #c5deff; }
    :host.dark-mode .ptabs { border-color: #143558; }
    :host.dark-mode .ptab { color: #3a6385; }
    :host.dark-mode .ptab-on { color: #3d9fff; border-bottom-color: #3d9fff; }
    :host.dark-mode .panel-state .state-label { color: #c5deff; }
    :host.dark-mode .state-sub { color: #4d7a9a; }
    :host.dark-mode .state-empty { color: #143558; }
    :host.dark-mode .error-box { background: rgba(186,26,26,0.15); color: #ffb4ab; border-color: rgba(186,26,26,0.3); }
    :host.dark-mode .icon-btn { border-color: #143558; color: #4d7a9a; }
    :host.dark-mode .icon-btn:hover { border-color: #1e4d7a; color: #c5deff; background: #082448; }
    :host.dark-mode .secondary-btn { border-color: #143558; background: #061e38; color: #4d7a9a; }
    :host.dark-mode .secondary-btn:hover { border-color: #1e4d7a; color: #c5deff; }
    :host.dark-mode .filename-input { background: #061e38; border-color: #143558; color: #c5deff; }
    :host.dark-mode .filename-input::placeholder { color: #2d5578; }

    .stats-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 48px; flex-shrink: 0;
      background: #f3f4f5; border-bottom: 1px solid #c2c6d4;
      transition: background 250ms, border-color 250ms;
    }

    .stats-left {
      display: flex; align-items: center; gap: 16px; overflow: hidden;
    }

    .stat {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 0.8125rem; color: #424752; white-space: nowrap;
      transition: color 250ms;
    }

    .stat-num {
      font-weight: 700; color: #0056b3;
      transition: color 250ms;
    }

    .stat-div {
      width: 1px; height: 16px; background: #c2c6d4; flex-shrink: 0;
      transition: background 250ms;
    }

    .conversion-name {
      font-weight: 600; font-size: 0.9rem; gap: 8px;
    }

    .stats-right {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 16px;
    }

    .toolbar-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; height: 32px;
      border: 1px solid #c2c6d4; border-radius: 6px;
      background: transparent; color: #424752;
      font-size: 0.8125rem; cursor: pointer;
      transition: border-color 150ms, color 150ms, background 150ms;
    }
    .toolbar-btn:hover { border-color: #ba1a1a; color: #ba1a1a; background: #ffdad640; }

    .toolbar-convert-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 0 20px; height: 34px;
      border: none; border-radius: 100px;
      background: #0056b3; color: #ffffff;
      font-size: 0.875rem; font-weight: 700; cursor: pointer;
      transition: background 150ms, filter 150ms, transform 100ms, box-shadow 150ms;
      letter-spacing: 0.01em;
    }
    .toolbar-convert-btn:hover:not([disabled]) { filter: brightness(1.08); transform: translateY(-1px); }
    .toolbar-convert-btn[disabled] { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none !important; }

    .btn-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .editor-body {
      flex: 1; overflow: hidden; display: flex;
      transition: background 250ms;
    }

    .panels-row {
      display: flex; flex: 1; --split: 50%;
    }

    .panel {
      background: #ffffff; border: 0; border-right: 1px solid #c2c6d4;
      overflow: hidden; display: flex; flex-direction: column;
      box-shadow: none; transition: background 250ms, border-color 250ms; min-width: 0;
    }
    .panel-left { flex: 0 0 var(--split); }
    .panel-right { flex: 1 1 0; border-right: none; }

    .resize-handle {
      width: 10px; flex-shrink: 0; cursor: col-resize;
      display: flex; align-items: center; justify-content: center;
      background: transparent; transition: background 150ms;
    }
    .resize-handle:hover { background: rgba(0,86,179,0.07); }

    .resize-grip {
      width: 3px; height: 44px; border-radius: 3px;
      background: #c2c6d4; transition: background 150ms; pointer-events: none;
    }
    .resize-handle:hover .resize-grip { background: #0056b3; }

    .panel-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px; height: 44px; border-bottom: 1px solid #e7e8e9;
      background: #f3f4f5; flex-shrink: 0;
      transition: background 250ms, border-color 250ms;
    }

    .panel-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.875rem; font-weight: 600; color: #191c1d;
      transition: color 250ms;
    }
    .panel-title i { font-size: 1rem; }

    .panel-actions {
      display: flex; align-items: center; gap: 6px;
    }

    .panel-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    .drop-zone {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 40px 24px;
      text-align: center; position: relative; cursor: pointer;
      border: 2px dashed #c2c6d4;
      transition: border-color 150ms, background 150ms;
    }
    .drop-zone:hover, .drop-zone.drag-over, .drop-zone:focus-visible {
      border-color: #0056b3; background: #d7e2ff40; outline: none;
    }
    .dz-icon { font-size: 3rem; margin-bottom: 14px; }
    .dz-icon-empty { color: #c2c6d4; }
    .pdf-icon  { color: #ba1a1a; }
    .docx-icon { color: #003f87; }
    .dz-filename { font-weight: 600; color: #191c1d; margin: 0 0 4px; word-break: break-all; transition: color 250ms; }
    .dz-size { display: block; color: #16a34a; font-size: 0.85rem; font-weight: 500; }
    .dz-label { font-weight: 600; color: #191c1d; margin: 0 0 6px; font-size: 1rem; transition: color 250ms; }
    .dz-hint  { font-size: 0.8125rem; color: #727784; }
    .dz-overlay {
      position: absolute; inset: 0; background: rgba(0,86,179,0.88);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 1rem; font-weight: 600; pointer-events: none; gap: 8px;
    }

    .md-wrap {
      flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden;
    }
    .md-drop-overlay {
      position: absolute; inset: 0; background: rgba(0,86,179,0.88);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #fff; font-size: 1rem; font-weight: 600; gap: 12px;
      pointer-events: none; z-index: 10;
    }
    .md-drop-overlay i { font-size: 2.5rem; }

    .panel-state {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 48px 24px; text-align: center;
    }
    .spinner {
      width: 44px; height: 44px; border: 4px solid #c2c6d4; border-radius: 50%;
      animation: spin 0.7s linear infinite; margin-bottom: 18px;
    }
    .state-check { font-size: 3.5rem; margin-bottom: 14px; }
    .state-empty { font-size: 3rem; color: #c2c6d4; margin-bottom: 14px; }
    .state-label { font-size: 1rem; font-weight: 600; color: #191c1d; margin: 0 0 4px; transition: color 250ms; }
    .state-sub { font-size: 0.8125rem; color: #727784; margin: 0; }
    .error-box {
      display: flex; align-items: flex-start; gap: 10px; margin: 16px; padding: 14px 16px;
      border-radius: 8px; background: #ffdad6; color: #ba1a1a;
      font-size: 0.875rem; border: 1px solid #ffb4ab;
    }

    .ptabs {
      display: flex; border-bottom: 1px solid #c2c6d4; padding: 0 8px; flex-shrink: 0;
      transition: border-color 250ms;
    }
    .ptab {
      padding: 10px 16px; min-height: 42px; border: none;
      border-bottom: 2px solid transparent; background: transparent; color: #727784;
      font-size: 0.875rem; cursor: pointer; margin-bottom: -1px;
      transition: color 150ms, border-color 150ms;
    }
    .ptab-on { color: #0056b3; border-bottom-color: #0056b3; font-weight: 600; }
    .live-badge {
      display: inline-block; padding: 1px 6px; background: #22c55e;
      color: #fff; font-size: 0.6rem; font-weight: 700;
      border-radius: 4px; letter-spacing: 0.05em; margin-left: 5px; vertical-align: middle;
    }
    .html-preview { padding: 20px 24px; overflow: auto; flex: 1; color: #191c1d; transition: color 250ms; }
    .result-pre {
      flex: 1; margin: 0; padding: 16px 18px; overflow: auto; background: #f3f4f5;
      font-family: 'JetBrains Mono','Fira Code','Consolas',monospace;
      font-size: 0.8rem; line-height: 1.7; white-space: pre-wrap; word-break: break-word;
      color: #191c1d; transition: background 250ms, color 250ms;
    }

    .icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: 1px solid #c2c6d4; border-radius: 6px;
      background: transparent; color: #727784; cursor: pointer;
      transition: border-color 150ms, color 150ms, background 150ms;
    }
    .icon-btn:hover { border-color: #424752; color: #191c1d; background: #f3f4f5; }
    .icon-btn-success { border-color: #16a34a !important; color: #16a34a !important; background: #f0fdf4 !important; }
    .icon-btn-download { border-color: #acc7ff; color: #003f87; }
    .icon-btn-download:hover { border-color: #0056b3; background: #d7e2ff; color: #003f87; }

    .filename-input {
      height: 30px; border: 1px solid #c2c6d4; border-radius: 6px;
      padding: 0 10px; font-size: 0.8125rem; color: #191c1d; background: #fff;
      outline: none; min-width: 180px; max-width: 240px;
      transition: border-color 150ms, background 250ms, color 250ms;
    }
    .filename-input:focus { border-color: #0056b3; box-shadow: 0 0 0 3px rgba(0,86,179,0.12); }
    .filename-input::placeholder { color: #727784; }

    .secondary-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px;
      min-height: 38px; border: 1.5px solid #c2c6d4; border-radius: 6px;
      background: #fff; color: #424752; font-size: 0.875rem; cursor: pointer;
      transition: border-color 150ms, color 150ms, background 250ms;
    }
    .secondary-btn:hover { border-color: #424752; color: #191c1d; }

    .sr-only {
      position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }

    @media (max-width: 768px) {
      .stats-bar { padding: 0 16px; gap: 8px; }
      .stats-left { gap: 8px; }
      .stat-div { display: none; }
      .filename-input { min-width: 100px; }
    }
  `],
})
export class EditorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly converterService = inject(ConverterService);
  private readonly toastService = inject(ToastService);
  readonly darkModeService = inject(DarkModeService);

  opt: ConversionOption | null = null;
  loading      = signal(false);
  result       = signal<string | null>(null);
  pdfData      = signal<ArrayBuffer | null>(null);
  errorMsg     = signal<string | null>(null);
  markdownText = signal('');
  uploadedFile = signal<File | null>(null);
  isDragging   = signal(false);
  isDraggingMd = signal(false);
  livePreview  = signal<string | null>(null);
  previewMode  = signal<'preview' | 'source'>('preview');
  outputFilename = signal('');
  copied       = signal(false);
  panelSplit   = signal(50);

  wordCount = 0; charCount = 0; lineCount = 0; readingTime = 0;
  private previewTimer: ReturnType<typeof setTimeout> | null = null;
  private restoreTimer: ReturnType<typeof setTimeout> | null = null;

  get isFileInput(): boolean { return this.opt?.inputType === 'pdf' || this.opt?.inputType === 'docx'; }
  get isLive(): boolean { return this.opt?.outputType === 'html' && this.opt?.inputType === 'markdown'; }

  get inputLabel(): string {
    switch (this.opt?.inputType) {
      case 'pdf':  return 'PDF File';
      case 'docx': return 'DOCX File';
      case 'html': return 'HTML Input';
      default:     return 'Markdown Input';
    }
  }

  get inputIcon(): string {
    switch (this.opt?.inputType) {
      case 'pdf':  return 'bi-file-earmark-pdf-fill';
      case 'docx': return 'bi-file-earmark-word-fill';
      case 'html': return 'bi-filetype-html';
      default:     return 'bi-markdown-fill';
    }
  }

  readonly canConvert = computed(() => {
    if (!this.opt) return false;
    return this.isFileInput ? !!this.uploadedFile() : this.markdownText().trim().length > 0;
  });

  readonly defaultFilename = computed(() => `converted.${this.opt?.outputExtension ?? 'txt'}`);

  readonly outputIcon = computed(() => {
    const map: Record<string, string> = {
      html: 'bi-code-slash', txt: 'bi-file-text-fill',
      pdf: 'bi-file-earmark-pdf-fill', docx: 'bi-file-earmark-word-fill',
      epub: 'bi-book-half', md: 'bi-markdown-fill',
    };
    return map[this.opt?.outputType ?? ''] ?? 'bi-file';
  });

  readonly outputLabel = computed(() => {
    const map: Record<string, string> = {
      html: 'HTML Output', txt: 'Plain Text', pdf: 'PDF Output',
      docx: 'DOCX Output', epub: 'EPUB Output', md: 'Markdown Output',
    };
    return map[this.opt?.outputType ?? ''] ?? 'Output';
  });

  readonly safeHtmlResult = computed(() => {
    const r = this.result();
    if (!r || r === '__binary__') return '';
    return this.sanitizer.sanitize(SecurityContext.HTML, r) ?? '';
  });

  readonly safeHtmlPreview = computed(() => {
    const p = this.livePreview();
    if (!p) return '';
    return this.sanitizer.sanitize(SecurityContext.HTML, p) ?? '';
  });

  readonly tabIcon = CONVERSION_ICONS;
  readonly meta = CONVERSION_META;

  private readonly successMessages: Record<ConversionType, { title: string; message: string }> = {
    'md-to-html':  { title: 'HTML ready!',     message: 'Your Markdown has been converted to HTML.'     },
    'md-to-txt':   { title: 'TXT ready!',      message: 'Plain text output is ready.'                   },
    'md-to-pdf':   { title: 'PDF ready!',      message: 'Your PDF has been downloaded.'                 },
    'md-to-docx':  { title: 'DOCX ready!',     message: 'Your Word document has been downloaded.'       },
    'md-to-epub':  { title: 'EPUB ready!',     message: 'Your EPUB ebook has been downloaded.'          },
    'pdf-to-md':   { title: 'Markdown ready!', message: 'PDF text has been extracted as Markdown.'      },
    'html-to-md':  { title: 'Markdown ready!', message: 'HTML has been converted to Markdown.'          },
    'docx-to-md':  { title: 'Markdown ready!', message: 'Word document has been converted to Markdown.' },
  };

  private isResizing = false;
  private panelsRowEl: HTMLElement | null = null;

  private readonly onMouseMove = (e: MouseEvent): void => {
    if (!this.isResizing || !this.panelsRowEl) return;
    const rect = this.panelsRowEl.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    this.panelSplit.set(Math.max(25, Math.min(75, Math.round(pct))));
  };

  private readonly onMouseUp = (): void => {
    if (!this.isResizing) return;
    this.isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  private readonly onKeydown = (e: KeyboardEvent): void => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;
    if (e.key === 'Enter') { e.preventDefault(); if (this.canConvert() && !this.loading()) this.convert(); }
    if (e.key === 's' || e.key === 'S') { e.preventDefault(); if (this.result() || this.livePreview()) this.download(); }
  };

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type') as ConversionType | null;
    this.opt = CONVERSION_OPTIONS.find(o => o.value === type) ?? null;
    if (!this.opt) {
      this.router.navigate(['/']);
      return;
    }

    const pending = localStorage.getItem(STORAGE_KEYS.pendingRestore);
    if (pending) {
      localStorage.removeItem(STORAGE_KEYS.pendingRestore);
      try {
        const entry = JSON.parse(pending) as HistoryEntry;
        if (entry.type === this.opt.value) {
          // MarkdownEditorComponent needs one tick to mount before accepting value
          this.restoreTimer = setTimeout(() => this.onMarkdownChange(entry.input), 100);
        }
      } catch { /* ignore */ }
    }

    document.addEventListener('keydown', this.onKeydown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeydown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    if (this.previewTimer) clearTimeout(this.previewTimer);
    if (this.restoreTimer) clearTimeout(this.restoreTimer);
  }

  clearInput(): void {
    this.markdownText.set('');
    this.result.set(null);
    this.errorMsg.set(null);
    this.livePreview.set(null);
    this.wordCount = 0; this.charCount = 0; this.lineCount = 0; this.readingTime = 0;
  }

  onMarkdownChange(text: string): void {
    this.markdownText.set(text);
    const trimmed = text.trim();
    this.wordCount   = trimmed ? trimmed.split(/\s+/).length : 0;
    this.charCount   = text.length;
    this.lineCount   = text ? text.split('\n').length : 0;
    this.readingTime = Math.max(1, Math.ceil(this.wordCount / 200));

    if (this.opt?.outputType === 'html') {
      if (this.previewTimer) clearTimeout(this.previewTimer);
      if (text.trim()) {
        this.previewTimer = setTimeout(() => {
          this.livePreview.set(marked.parse(text) as string);
        }, 300);
      } else {
        this.livePreview.set(null);
      }
    } else {
      this.livePreview.set(null);
    }
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.setFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    const isDocx = this.opt?.inputType === 'docx';
    const validDocx = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (isDocx ? validDocx.includes(file.type) : file.type === 'application/pdf') {
      this.setFile(file);
    }
  }

  private setFile(file: File): void {
    this.uploadedFile.set(file);
    this.result.set(null);
    this.errorMsg.set(null);
  }

  onMdDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingMd.set(true);
  }

  onMdDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target.contains(event.relatedTarget as Node)) {
      this.isDraggingMd.set(false);
    }
  }

  onMdDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingMd.set(false);
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    const isHtml = this.opt?.inputType === 'html';
    const validMd   = name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.markdown');
    const validHtml = name.endsWith('.html') || name.endsWith('.htm');
    const valid = isHtml ? validHtml : validMd;
    if (!valid) {
      this.toastService.warning(
        isHtml ? 'Only .html files can be dropped here.' : 'Only .md and .txt files can be dropped here.',
        'Unsupported file type',
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.onMarkdownChange(text);
      this.toastService.info(`"${file.name}" loaded`, 'File imported');
    };
    reader.onerror = () => this.toastService.error('Could not read the file.', 'File error');
    reader.readAsText(file);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  convert(): void {
    const opt = this.opt;
    if (!opt || !this.canConvert() || this.loading()) return;
    this.loading.set(true);
    this.result.set(null);
    this.errorMsg.set(null);
    const source: string | File = this.isFileInput ? this.uploadedFile()! : this.markdownText();

    this.converterService.convert(opt.value, source).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (opt.outputType === 'pdf' || opt.outputType === 'docx' || opt.outputType === 'epub') {
          const buf = res as ArrayBuffer;
          this.pdfData.set(buf);
          this.triggerDownload(buf, opt);
          this.result.set('__binary__');
        } else {
          this.result.set((res as { result: string }).result);
        }
        const ok = this.successMessages[opt.value];
        this.toastService.success(ok.message, ok.title);
        this.saveToHistory(opt, source as string);
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.loading.set(false);
        const { title, message } = this.classifyError(err);
        this.errorMsg.set(message);
        this.toastService.error(message, title);
      },
    });
  }

  private triggerDownload(data: ArrayBuffer | string, opt: ConversionOption, customName?: string): void {
    const filename = customName || this.outputFilename().trim() || `converted.${opt.outputExtension}`;
    const blob = new Blob([data as BlobPart], { type: opt.outputMime });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
  }

  download(): void {
    const opt = this.opt;
    if (!opt) return;
    if (opt.outputType === 'pdf' || opt.outputType === 'docx' || opt.outputType === 'epub') {
      const buf = this.pdfData();
      if (buf) this.triggerDownload(buf, opt);
    } else {
      const content = this.result() || this.livePreview();
      if (content) this.triggerDownload(content, opt);
    }
  }

  copyResult(): void {
    const content = this.result() || this.livePreview();
    if (!content || content === '__binary__') return;
    navigator.clipboard.writeText(content).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  startResize(e: MouseEvent): void {
    e.preventDefault();
    this.panelsRowEl = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  resetSplit(): void { this.panelSplit.set(50); }

  private saveToHistory(opt: ConversionOption, input: string): void {
    if (this.isFileInput || typeof input !== 'string' || !input.trim()) return;
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      type: opt.value, label: opt.label,
      inputSnippet: input.trim().slice(0, 80).replace(/\s+/g, ' '),
      input: input.slice(0, 10_000),
      timestamp: Date.now(),
    };
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) ?? '[]');
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify([entry, ...existing].slice(0, 50)));
  }

  private classifyError(err: { status?: number; error?: { message?: string } }): { title: string; message: string } {
    const status = err?.status ?? 0;
    const backendMsg = err?.error?.message;
    if (status === 0)   return { title: 'Cannot reach server',  message: 'Check your connection and try again.' };
    if (status === 413) return { title: 'File too large',       message: 'The file exceeds the 20 MB limit.' };
    if (status === 422) return { title: 'Invalid input',        message: backendMsg || 'The content could not be processed. Check your input and try again.' };
    if (status === 429) return { title: 'Too many requests',    message: 'Slow down a bit — wait a moment before trying again.' };
    if (status >= 500)  return { title: 'Server error',         message: 'Something went wrong on our end. Please try again in a moment.' };
    return { title: 'Conversion failed', message: backendMsg || 'An unexpected error occurred. Please try again.' };
  }
}
