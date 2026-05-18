import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { Marked, Renderer } from 'marked';
import TurndownService from 'turndown';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require('pdf-parse/lib/pdf-parse.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HTMLtoDOCX = require('html-to-docx');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth') as { convertToHtml(input: { buffer: Buffer }): Promise<{ value: string }> };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { EPub } = require('epub-gen-memory') as { EPub: new (opts: object, chapters: object[]) => { genEpub(): Promise<Buffer> } };
import * as puppeteer from 'puppeteer-core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chromium = require('@sparticuz/chromium') as {
  args: string[];
  defaultViewport: puppeteer.Viewport;
  executablePath: () => Promise<string>;
  headless: boolean;
};

@Injectable()
export class ConverterService {
  private readonly logger = new Logger(ConverterService.name);
  private readonly marked = new Marked();
  private readonly txtMarked = this.buildTxtMarked();
  private readonly turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  async mdToHtml(markdown: string): Promise<string> {
    return this.marked.parse(markdown) as string;
  }

  async mdToTxt(markdown: string): Promise<string> {
    const html = await this.txtMarked.parse(markdown);
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  async mdToPdf(markdown: string): Promise<Buffer> {
    const html = this.marked.parse(markdown) as string;
    const fullHtml = this.wrapHtml(html);

    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? await chromium.executablePath(),
        headless: true,
      });
      const page = await browser.newPage();
      page.setDefaultTimeout(30_000);
      page.setDefaultNavigationTimeout(30_000);
      await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 30_000 });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true,
      });
      return Buffer.from(pdf);
    } catch (err) {
      this.logger.error('PDF generation failed', err);
      throw new InternalServerErrorException('PDF generation failed');
    } finally {
      try { if (browser) await browser.close(); } catch { /* ignore */ }
    }
  }

  async mdToDocx(markdown: string): Promise<Buffer> {
    const html = this.marked.parse(markdown) as string;
    const fullHtml = this.wrapHtml(html);
    try {
      const buffer = await HTMLtoDOCX(fullHtml, null, {
        table: { row: { cantSplit: true } },
        footer: false,
        pageNumber: false,
        font: 'Calibri',
        fontSize: 24,
        margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      });
      return Buffer.from(buffer);
    } catch (err) {
      this.logger.error('DOCX generation failed', err);
      throw new InternalServerErrorException('DOCX generation failed');
    }
  }

  async pdfToMd(pdfBuffer: Buffer): Promise<string> {
    let data: { text: string };
    try {
      data = await pdfParse(pdfBuffer);
    } catch (err) {
      this.logger.error('PDF parse failed', err);
      throw new InternalServerErrorException(
        'Could not parse PDF. Ensure the file has a text layer.',
      );
    }
    const extracted = data.text.trim();
    if (!extracted || extracted.length < 10) {
      throw new BadRequestException(
        'No readable text found. This PDF appears to be image-based or scanned. Try an OCR tool first.',
      );
    }
    return this.textToMarkdown(extracted);
  }

  async docxToMd(docxBuffer: Buffer): Promise<string> {
    let html: string;
    try {
      const { value } = await mammoth.convertToHtml({ buffer: docxBuffer });
      html = value;
    } catch (err) {
      this.logger.error('DOCX parse failed', err);
      throw new InternalServerErrorException('Could not read the DOCX file.');
    }
    if (!html.trim()) {
      throw new BadRequestException('The Word document appears to be empty.');
    }
    return this.htmlToMd(html);
  }

  async mdToEpub(markdown: string): Promise<Buffer> {
    const titleMatch = markdown.match(/^# (.+)/m);
    const bookTitle = titleMatch ? titleMatch[1].trim() : 'Document';
    const chapters = this.splitIntoEpubChapters(markdown);
    try {
      const epub = new EPub(
        { title: bookTitle, author: 'MarkConvert', lang: 'en', appendChapterTitles: false },
        chapters,
      );
      const buffer = await epub.genEpub();
      return Buffer.from(buffer);
    } catch (err) {
      this.logger.error('EPUB generation failed', err);
      throw new InternalServerErrorException('EPUB generation failed');
    }
  }

  async htmlToMd(html: string): Promise<string> {
    try {
      return this.turndown.turndown(html);
    } catch (err) {
      this.logger.error('HTML to Markdown conversion failed', err);
      throw new InternalServerErrorException('HTML to Markdown conversion failed');
    }
  }

  private splitIntoEpubChapters(markdown: string): Array<{ title: string; content: string }> {
    const mapSections = (sections: string[], regex: RegExp, fallback: string) =>
      sections.map(section => {
        const match = section.match(regex);
        return { title: match ? match[1].trim() : fallback, content: this.marked.parse(section) as string };
      });

    const h1Sections = markdown.split(/(?=^# )/m).filter(s => s.trim());
    if (h1Sections.length > 1) return mapSections(h1Sections, /^# (.+)/, 'Chapter');

    const h2Sections = markdown.split(/(?=^## )/m).filter(s => s.trim());
    if (h2Sections.length > 1) return mapSections(h2Sections, /^## (.+)/, 'Section');

    return [{ title: 'Content', content: this.marked.parse(markdown) as string }];
  }

  private buildTxtMarked(): Marked {
    const renderer = new Renderer();
    renderer.heading = ({ text }) => `${text}\n`;
    renderer.paragraph = ({ text }) => `${text}\n\n`;
    renderer.strong = ({ text }) => text;
    renderer.em = ({ text }) => text;
    renderer.codespan = ({ text }) => text;
    renderer.code = ({ text }) => `${text}\n\n`;
    renderer.link = ({ text }) => text;
    renderer.image = () => '';
    renderer.list = (token) => token.items.map(item => `- ${item.text}\n`).join('') + '\n';
    renderer.listitem = ({ text }) => `- ${text}\n`;
    renderer.blockquote = ({ text }) => `${text}\n`;
    renderer.hr = () => '\n---\n';
    renderer.br = () => '\n';
    renderer.table = ({ header, rows }) => `${header}\n${rows}\n`;
    renderer.tablerow = ({ text }) => `${text}\n`;
    renderer.tablecell = ({ text }) => `${text}\t`;
    return new Marked({ renderer });
  }

  private textToMarkdown(text: string): string {
    const lines = text.split('\n').map((l) => l.trimEnd());
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) { result.push(''); continue; }

      if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && trimmed.length > 2) {
        result.push(`## ${this.titleCase(trimmed)}`);
        continue;
      }

      const nextLine = lines[i + 1]?.trim() ?? '';
      if (trimmed.length < 60 && nextLine === '') {
        result.push(`### ${trimmed}`);
        i++;
        continue;
      }

      if (/^[•‣◦⁃∙\-\*]\s/.test(trimmed)) {
        result.push(`- ${trimmed.replace(/^[•‣◦⁃∙\-\*]\s+/, '')}`);
        continue;
      }

      if (/^\d+[\.\)]\s/.test(trimmed)) { result.push(trimmed); continue; }

      result.push(trimmed);
    }

    return result.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  private titleCase(text: string): string {
    return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private wrapHtml(body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 100%; }
    h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
    code { background: #f6f8fa; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1em; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f6f8fa; font-weight: 600; }
    img { display: none; }
  </style>
</head>
<body>${body}</body>
</html>`;
  }
}
