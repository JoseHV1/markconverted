export type ConversionType = 'md-to-html' | 'md-to-txt' | 'md-to-pdf' | 'md-to-docx' | 'image-to-md' | 'pdf-to-md' | 'html-to-md' | 'docx-to-md';

export interface ConversionOption {
  value: ConversionType;
  label: string;
  inputType: 'markdown' | 'pdf' | 'html' | 'docx' | 'image';
  outputType: 'html' | 'txt' | 'pdf' | 'docx' | 'md';
  outputMime: string;
  outputExtension: string;
}

export const CONVERSION_OPTIONS: ConversionOption[] = [
  { value: 'md-to-html',   label: 'Markdown → HTML',   inputType: 'markdown', outputType: 'html', outputMime: 'text/html',                   outputExtension: 'html' },
  { value: 'md-to-txt',    label: 'Markdown → TXT',    inputType: 'markdown', outputType: 'txt',  outputMime: 'text/plain',                  outputExtension: 'txt'  },
  { value: 'md-to-pdf',    label: 'Markdown → PDF',    inputType: 'markdown', outputType: 'pdf',  outputMime: 'application/pdf',             outputExtension: 'pdf'  },
  { value: 'md-to-docx',   label: 'Markdown → DOCX',   inputType: 'markdown', outputType: 'docx', outputMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', outputExtension: 'docx' },
  { value: 'image-to-md',  label: 'Images → Markdown', inputType: 'image',    outputType: 'md',   outputMime: 'text/plain',                  outputExtension: 'md'   },
  { value: 'pdf-to-md',    label: 'PDF → Markdown',    inputType: 'pdf',      outputType: 'md',   outputMime: 'text/plain',                  outputExtension: 'md'   },
  { value: 'html-to-md',   label: 'HTML → Markdown',   inputType: 'html',     outputType: 'md',   outputMime: 'text/plain',                  outputExtension: 'md'   },
  { value: 'docx-to-md',   label: 'DOCX → Markdown',   inputType: 'docx',     outputType: 'md',   outputMime: 'text/plain',                  outputExtension: 'md'   },
];
