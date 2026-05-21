import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConversionType } from '../models/converter.models';

@Injectable({ providedIn: 'root' })
export class ConverterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/converter`;

  convert(type: ConversionType, source: string | File): Observable<{ result: string } | ArrayBuffer> {
    const formData = new FormData();
    if (source instanceof File) {
      formData.append('file', source);
    } else {
      formData.append('content', source);
    }

    if (type === 'md-to-pdf' || type === 'md-to-docx' || type === 'md-to-epub') {
      return this.http.post(`${this.baseUrl}/${type}`, formData, { responseType: 'arraybuffer' });
    }
    return this.http.post<{ result: string }>(`${this.baseUrl}/${type}`, formData);
  }
}
