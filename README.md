# MarkConvert

Document converter for developers and writers. Convert between Markdown, HTML, PDF, DOCX, TXT and EPUB — no signup, no file storage.

## Structure

```
markconverted/
├── front/   Angular 20 SPA
└── back/    NestJS 11 API (serverless via Vercel)
```

## Local development

**Backend** (runs on port 3001):
```bash
cd back
npm install
npm run start:dev
```

**Frontend** (runs on port 4200):
```bash
cd front
npm install
ng serve
```

The Angular dev server proxies API calls to `http://localhost:3001` via `environment.ts`.

## Supported conversions

| Input | Output |
|-------|--------|
| Markdown | HTML, TXT, PDF, DOCX, EPUB |
| PDF | Markdown |
| HTML | Markdown |
| DOCX | Markdown |

## Deployment

Deployed as a monorepo on Vercel. The root `vercel.json` wires the Angular SPA and the NestJS serverless function together under a single domain.

Set the following environment variable in Vercel:
- `CORS_ORIGIN` — your Vercel deployment URL (or `*` for open access)
