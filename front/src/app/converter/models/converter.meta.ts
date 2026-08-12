import { ConversionType } from './converter.models';

export const CONVERSION_ICONS: Record<ConversionType, string> = {
  'md-to-html':  'bi-code-slash',
  'md-to-txt':   'bi-file-text-fill',
  'md-to-pdf':   'bi-file-earmark-pdf-fill',
  'md-to-docx':  'bi-file-earmark-word-fill',
  'md-to-epub':  'bi-book-half',
  'pdf-to-md':   'bi-markdown-fill',
  'html-to-md':  'bi-filetype-html',
  'docx-to-md':  'bi-file-earmark-word-fill',
};

export interface ConversionMeta {
  bg: string;
  fg: string;
  desc: string;
  shadow: string;
}

export const CONVERSION_META: Record<ConversionType, ConversionMeta> = {
  'md-to-html':  { bg: '#e3edfa', fg: '#0056b3', desc: 'Convert Markdown to a web-ready HTML document',    shadow: 'rgba(0,86,179,0.28)'   },
  'md-to-txt':   { bg: '#e0f5f3', fg: '#00897b', desc: 'Strip formatting, get clean plain text',            shadow: 'rgba(0,137,123,0.28)'  },
  'md-to-pdf':   { bg: '#fde8e8', fg: '#d32f2f', desc: 'Export your Markdown as a printable PDF',           shadow: 'rgba(211,47,47,0.28)'  },
  'md-to-docx':  { bg: '#d9e6f7', fg: '#003f87', desc: 'Export your Markdown as a Word DOCX document',     shadow: 'rgba(0,63,135,0.28)'   },
  'md-to-epub':  { bg: '#fff8e1', fg: '#b45309', desc: 'Export your Markdown as a readable EPUB ebook',     shadow: 'rgba(180,83,9,0.28)'   },
  'pdf-to-md':   { bg: '#e0f5f3', fg: '#007a6e', desc: 'Extract and convert PDF text to Markdown',          shadow: 'rgba(0,122,110,0.28)'  },
  'html-to-md':  { bg: '#fff3e0', fg: '#e65100', desc: 'Convert HTML markup to clean Markdown',             shadow: 'rgba(230,81,0,0.28)'   },
  'docx-to-md':  { bg: '#d9e6f7', fg: '#1a56b0', desc: 'Convert Word documents to clean Markdown',          shadow: 'rgba(26,86,176,0.28)'  },
};
