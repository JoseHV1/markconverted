export type ConversionType = 'md-to-html' | 'md-to-txt' | 'md-to-pdf' | 'md-to-docx' | 'md-to-epub' | 'pdf-to-md' | 'html-to-md' | 'docx-to-md';

export interface ConversionOption {
  value: ConversionType;
  label: string;
  inputType: 'markdown' | 'pdf' | 'html' | 'docx';
  outputType: 'html' | 'txt' | 'pdf' | 'docx' | 'epub' | 'md';
  outputMime: string;
  outputExtension: string;
}

export const CONVERSION_OPTIONS: ConversionOption[] = [
  { value: 'md-to-html',  label: 'Markdown → HTML',  inputType: 'markdown', outputType: 'html',  outputMime: 'text/html',                   outputExtension: 'html' },
  { value: 'md-to-txt',   label: 'Markdown → TXT',   inputType: 'markdown', outputType: 'txt',   outputMime: 'text/plain',                  outputExtension: 'txt'  },
  { value: 'md-to-pdf',   label: 'Markdown → PDF',   inputType: 'markdown', outputType: 'pdf',   outputMime: 'application/pdf',             outputExtension: 'pdf'  },
  { value: 'md-to-docx',  label: 'Markdown → DOCX',  inputType: 'markdown', outputType: 'docx',  outputMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', outputExtension: 'docx' },
  { value: 'md-to-epub',  label: 'Markdown → EPUB',  inputType: 'markdown', outputType: 'epub',  outputMime: 'application/epub+zip',        outputExtension: 'epub' },
  { value: 'pdf-to-md',   label: 'PDF → Markdown',   inputType: 'pdf',      outputType: 'md',    outputMime: 'text/plain',                  outputExtension: 'md'   },
  { value: 'html-to-md',  label: 'HTML → Markdown',  inputType: 'html',     outputType: 'md',    outputMime: 'text/plain',                  outputExtension: 'md'   },
  { value: 'docx-to-md',  label: 'DOCX → Markdown',  inputType: 'docx',     outputType: 'md',    outputMime: 'text/plain',                  outputExtension: 'md'   },
];
