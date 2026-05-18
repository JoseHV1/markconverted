import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ConverterService } from './converter.service';

const memory = { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } };

@Controller('converter')
export class ConverterController {
  constructor(private readonly converterService: ConverterService) {}

  @Post('md-to-html')
  @UseInterceptors(FileInterceptor('file', memory))
  async mdToHtml(
    @Body('content') content: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const markdown = this.resolveText(content, file);
    const result = await this.converterService.mdToHtml(markdown);
    return { result };
  }

  @Post('md-to-txt')
  @UseInterceptors(FileInterceptor('file', memory))
  async mdToTxt(
    @Body('content') content: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const markdown = this.resolveText(content, file);
    const result = await this.converterService.mdToTxt(markdown);
    return { result };
  }

  @Post('md-to-pdf')
  @UseInterceptors(FileInterceptor('file', memory))
  async mdToPdf(
    @Body('content') content: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const markdown = this.resolveText(content, file);
    const pdfBuffer = await this.converterService.mdToPdf(markdown);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post('md-to-docx')
  @UseInterceptors(FileInterceptor('file', memory))
  async mdToDocx(
    @Body('content') content: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const markdown = this.resolveText(content, file);
    const docxBuffer = await this.converterService.mdToDocx(markdown);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="document.docx"',
      'Content-Length': docxBuffer.length,
    });
    res.end(docxBuffer);
  }

  @Post('md-to-epub')
  @UseInterceptors(FileInterceptor('file', memory))
  async mdToEpub(
    @Body('content') content: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const markdown = this.resolveText(content, file);
    const epubBuffer = await this.converterService.mdToEpub(markdown);
    res.set({
      'Content-Type': 'application/epub+zip',
      'Content-Disposition': 'attachment; filename="document.epub"',
      'Content-Length': epubBuffer.length,
    });
    res.end(epubBuffer);
  }

  @Post('html-to-md')
  @UseInterceptors(FileInterceptor('file', memory))
  async htmlToMd(
    @Body('content') content: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const html = this.resolveText(content, file);
    const result = await this.converterService.htmlToMd(html);
    return { result };
  }

  @Post('pdf-to-md')
  @UseInterceptors(FileInterceptor('file', memory))
  async pdfToMd(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('PDF file is required');
    if (file.mimetype !== 'application/pdf')
      throw new BadRequestException('File must be a PDF');
    const result = await this.converterService.pdfToMd(file.buffer);
    return { result };
  }

  @Post('docx-to-md')
  @UseInterceptors(FileInterceptor('file', memory))
  async docxToMd(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('DOCX file is required');
    const validMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!validMimes.includes(file.mimetype))
      throw new BadRequestException('File must be a .docx or .doc Word document');
    const result = await this.converterService.docxToMd(file.buffer);
    return { result };
  }

  private resolveText(content: string, file?: Express.Multer.File): string {
    if (file) return file.buffer.toString('utf-8');
    if (content) return content;
    throw new BadRequestException('Provide either a file or content text');
  }
}
