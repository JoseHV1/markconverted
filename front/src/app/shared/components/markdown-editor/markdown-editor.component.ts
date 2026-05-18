import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, OnChanges, OnDestroy, SimpleChanges,
  ViewChild, ElementRef,
} from '@angular/core';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { placeholder } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  template: `<div #host class="cm-host"></div>`,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      flex-direction: column;
    }
    .cm-host {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .cm-host ::ng-deep .cm-editor {
      flex: 1;
      height: 100%;
      outline: none;
    }
    .cm-host ::ng-deep .cm-scroller {
      overflow: auto;
      min-height: 360px;
    }
  `],
})
export class MarkdownEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('host') hostRef!: ElementRef<HTMLDivElement>;

  @Input() value = '';
  @Input() darkMode = false;
  @Input() inputType: 'markdown' | 'html' = 'markdown';
  @Input() placeholderText = '';

  @Output() valueChange = new EventEmitter<string>();

  private view: EditorView | null = null;
  private readonly themeCompartment       = new Compartment();
  private readonly languageCompartment    = new Compartment();
  private readonly placeholderCompartment = new Compartment();
  private skipEmit = false;

  private readonly lightTheme = EditorView.theme({
    '&': {
      background: '#ffffff',
      color: '#191c1d',
      fontSize: '0.8125rem',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    '.cm-content': {
      padding: '18px',
      lineHeight: '1.7',
      caretColor: '#0056b3',
    },
    '.cm-focused': { outline: 'none' },
    '.cm-gutters': {
      background: '#f3f4f5',
      color: '#727784',
      border: 'none',
      borderRight: '1px solid #e7e8e9',
      fontSize: '0.75rem',
      paddingRight: '8px',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#0056b3' },
    '.cm-selectionBackground': { background: '#d7e2ff' },
    '&.cm-focused .cm-selectionBackground': { background: '#bbd0ff' },
    '.cm-activeLine': { background: 'rgba(0,86,179,0.03)' },
    '.cm-activeLineGutter': { background: 'rgba(0,86,179,0.05)' },
    '.cm-placeholder': { color: '#727784', fontStyle: 'italic' },
    '.cm-lineNumbers .cm-gutterElement': { minWidth: '2.5em' },
  });

  private readonly darkOverride = EditorView.theme({
    '&': { background: '#061e38' },
    '.cm-gutters': { background: '#041527', borderRight: '1px solid #143558' },
    '.cm-activeLine': { background: 'rgba(61,159,255,0.04)' },
    '.cm-activeLineGutter': { background: 'rgba(61,159,255,0.07)' },
  });

  ngAfterViewInit(): void {
    this.view = new EditorView({
      state: EditorState.create({
        doc: this.value,
        extensions: [
          basicSetup,
          EditorView.lineWrapping,
          this.lightTheme,
          this.languageCompartment.of(this.getLanguage()),
          this.themeCompartment.of(this.getDarkExtensions()),
          this.placeholderCompartment.of(placeholder(this.placeholderText)),
          EditorView.updateListener.of(update => {
            if (update.docChanged && !this.skipEmit) {
              this.valueChange.emit(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: this.hostRef.nativeElement,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.view) return;

    if (changes['darkMode']) {
      this.view.dispatch({
        effects: this.themeCompartment.reconfigure(this.getDarkExtensions()),
      });
    }

    if (changes['inputType']) {
      this.view.dispatch({
        effects: this.languageCompartment.reconfigure(this.getLanguage()),
      });
    }

    if (changes['placeholderText']) {
      this.view.dispatch({
        effects: this.placeholderCompartment.reconfigure(
          placeholder(this.placeholderText as string),
        ),
      });
    }

    if (changes['value']) {
      const newVal: string = changes['value'].currentValue ?? '';
      const current = this.view.state.doc.toString();
      if (current !== newVal) {
        this.skipEmit = true;
        this.view.dispatch({
          changes: { from: 0, to: current.length, insert: newVal },
        });
        this.skipEmit = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }

  private getLanguage() {
    return this.inputType === 'html' ? html() : markdown();
  }

  private getDarkExtensions() {
    return this.darkMode ? [oneDark, this.darkOverride] : [];
  }
}
