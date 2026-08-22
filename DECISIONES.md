# Decisiones de arquitectura — MarkConvert

Este documento no arranca desde cero como el de otros proyectos hermanos: cuando se retomó este trabajo, `back/` y `front/` ya existían con una base funcional (conversión Markdown↔HTML/TXT/PDF/DOCX/EPUB, más OCR e importación desde PDF/DOCX). Lo que sigue documenta la arquitectura tal como se encontró, y sobre todo el trabajo real hecho después: migrarlo a este VPS, containerizarlo, y los bugs concretos que salieron a la luz en el proceso — varios de ellos llevaban tiempo ahí, sin que nadie los hubiera detectado porque el proyecto no tiene tests automatizados.

## 1. Qué es este proyecto

Un conversor de documentos multi-formato con interfaz web: Markdown → HTML, TXT, PDF, DOCX o EPUB; y en la otra dirección, PDF, DOCX o una imagen (vía OCR) → Markdown. Front en Angular, back en Nest, sin base de datos — cada conversión es una petición sin estado que sube el archivo/texto, lo transforma en memoria, y devuelve el resultado en la misma respuesta.

## 2. Arquitectura del backend (`back/src/converter/`)

Un único `ConverterController` expone un endpoint por formato de salida (`POST /api/v1/converter/md-to-html`, `md-to-txt`, `md-to-pdf`, `md-to-docx`, `md-to-epub`, `html-to-md`, `pdf-to-md`, `docx-to-md`) y `ConverterService` concentra toda la lógica de conversión real:

- **Markdown → HTML/TXT**: `marked`, con un `Renderer` custom para TXT que aplana las etiquetas HTML a texto plano legible en vez de solo hacer strip de tags.
- **Markdown → PDF**: renderiza el HTML resultante con **Puppeteer** controlando un Chromium headless real (`page.pdf()`) — es decir, el PDF es literalmente una página web impresa, no un generador de PDF "a mano" con coordenadas. Esto da estilos CSS reales gratis, a cambio de necesitar un navegador completo corriendo en el servidor.
- **Markdown → DOCX**: `html-to-docx` sobre el mismo HTML intermedio.
- **Markdown → EPUB**: `epub-gen-memory`, igual, reutilizando el HTML ya generado.
- **HTML → Markdown**: `turndown`.
- **PDF/DOCX/Imagen → Markdown**: `pdf-parse` (extracción de texto), `mammoth` (DOCX→HTML→Markdown vía Turndown) y `tesseract.js` (OCR) respectivamente, seguido de un post-proceso propio (`textToMarkdown`) que intenta inferir estructura (títulos en mayúsculas, listas con viñetas Unicode, etc.) sobre texto plano sin ninguna marca de formato.

**Por qué HTML como formato intermedio para PDF/DOCX/EPUB:** los tres reutilizan la misma conversión Markdown→HTML de `marked` en vez de generar cada formato de salida directamente desde el Markdown — un solo parser, tres renderizadores distintos sobre su resultado.

## 3. Migración de Vercel a este VPS (Docker + Coolify)

El proyecto corría con el front en Vercel llamando a un backend expuesto en este VPS vía PM2 + Apache sobre un dominio gratuito (`markconverted.zapto.org`). El trabajo de esta ronda fue traer también el front aquí y ponerlo todo bajo el mismo esquema que el resto de proyectos del VPS: Docker Compose + Coolify (build y deploy automático por webhook) + Apache como puerta de entrada real con SSL.

Esto expuso un problema real de infraestructura, no de código: **`@sparticuz/chromium`** (el paquete de Chromium que usa Puppeteer) está compilado específicamente para el runtime de AWS Lambda/Vercel — en un contenedor Docker genérico (`node:22-slim`) falla al arrancar porque le faltan librerías de sistema (`libnss3.so` y otras que Lambda trae preinstaladas). La solución no fue instalar esas librerías sueltas una por una, sino instalar **Chromium real de Debian vía `apt`** dentro del Dockerfile y apuntar `PUPPETEER_EXECUTABLE_PATH` a ese binario — de hecho `.env.example` ya traía ese nombre de variable documentado como comentario, señal de que alguien ya había anticipado este problema sin llegar a resolverlo.

**Dominio del backend:** se migró de `markconverted.zapto.org` (dominio gratuito de terceros) a `api.markconverted.jose-hernandez.dev` (dominio propio), siguiendo la misma convención `api.<proyecto>.jose-hernandez.dev` que el resto de proyectos del VPS. El proceso PM2 viejo y el vhost de Apache que apuntaba a `zapto.org` se retiraron por completo una vez confirmado el corte — no quedó nada corriendo en paralelo "por si acaso".

## 4. Historial de git divergente (hallazgo real durante la migración)

Al copiar el proyecto a este VPS se encontró que el repo de GitHub (`JoseHV1/markconverted`) tenía commits reales (`change in api domain`, `changes in enviromentts and clean code`, `mobile desing fix`) que **nunca habían llegado al disco del VPS** — el código que corría en producción vía PM2 estaba desactualizado respecto a lo que ya existía en GitHub. Se hizo un merge real (no un `git push --force` sobre uno de los dos lados) resolviendo 13 conflictos archivo por archivo, prefiriendo en cada caso la versión de GitHub cuando representaba una mejora verificable (limpieza de `CommonModule` no usado ya que las plantillas usan `@if`/`@for` nativos de Angular, manejo defensivo de `localStorage` con `try/catch`, fix de memory leak en `EditorComponent` con `Subscription`/`copiedTimer` sin limpiar). El primer commit del repo, antes de este merge, solo contenía un `.gitignore` — todo el código real nunca se había subido.

## 5. Bugs reales encontrados al containerizar (no introducidos por la migración)

Ninguno de estos bugs lo causó Docker — estaban en el código antes, y no se habían detectado porque **no hay tests automatizados en este proyecto** (ver sección 6). Aparecieron en cuanto se intentó levantar el backend desde cero con `npm ci`, algo que aparentemente nunca se había vuelto a hacer desde que se instalaron las dependencias por primera vez:

- **`pdf-parse` v2**: el código hacía `require('pdf-parse/lib/pdf-parse.js')`, una ruta interna que existía en la v1 del paquete pero que la v2 (instalada según `package-lock.json`) ya no expone — v2 es una reescritura completa con una API de clase (`new PDFParse({ data }).getText()`). El `require` roto tronaba **al cargar el módulo**, es decir, tumbaba el arranque completo de la aplicación, no solo la conversión de PDF.
- **`esModuleInterop` faltante**: `tsconfig.json` tenía `allowSyntheticDefaultImports: true` pero no `esModuleInterop: true` — la primera solo relaja el chequeo de tipos de TypeScript, no cambia el JS que se emite. El resultado: `import TurndownService from 'turndown'` compilaba a un acceso a `.default` sobre un módulo CommonJS que no lo tiene, y `new TurndownService()` fallaba en runtime con "is not a constructor". Se agregó `esModuleInterop: true` al `tsconfig.json`.

Ambos bugs tumbaban el arranque completo del servidor, no una sola conversión — cualquier despliegue limpio (`npm ci` + build) sin código de por medio ya fallaba antes de llegar a servir una sola petición.

## 6. Limitaciones conocidas

- **Cero tests automatizados.** No hay ni un `.spec.ts` en `back/` ni en `front/`. Es la razón directa por la que los dos bugs de la sección 5 sobrevivieron sin detectarse: nadie corrió `npm ci` limpio con cobertura de arranque hasta esta migración. Es la deuda técnica más importante del proyecto.
- **Sin CORS configurable en runtime más allá de un único origen fijo** (`CORS_ORIGIN`): si en el futuro el front se sirve desde más de un dominio a la vez, el backend necesitará una lista de orígenes permitidos en vez de uno solo.
- **`textToMarkdown` (post-proceso de OCR/PDF/DOCX) es heurístico**, no un parser real: infiere títulos y listas por patrones de texto (mayúsculas, líneas cortas, viñetas Unicode) — funciona razonablemente en documentos con estructura simple, pero no reconstruye tablas ni formato complejo.
- **PDF vía Chromium real tiene costo de arranque**: cada conversión a PDF lanza un proceso de Chromium completo (`puppeteer.launch()` por request, sin pool de instancias reutilizables) — suficiente para el volumen actual, pero el primer punto a optimizar si el tráfico de conversión a PDF creciera.
