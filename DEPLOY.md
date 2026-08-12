# Desplegar MarkConvert

Este proyecto se despliega como un recurso **Docker Compose** en Coolify (usa `docker-compose.yml` en la raíz, define los servicios `back` y `front`). Ya está configurado y corriendo en paralelo al despliegue viejo — falta solo el corte final del dominio.

## Estado actual

- **Producción real (en vivo)**: `back` corriendo vía **PM2** (`markconverted-back`, puerto 3010), servido por Apache en `https://markconverted.zapto.org`. El **front real está en Vercel** (u otro dominio), llamando a este backend vía CORS — no lo toques.
- **Nuevo despliegue (Docker + Coolify)**: corriendo en paralelo, puertos fijos `3012` (back) y `3013` (front), sin tráfico público todavía.
- Coolify reconstruye y redespliega automáticamente en cada `git push origin main` (webhook ya configurado y probado).

## Arquitectura (tras el corte)

```
internet → Apache (80/443, mismo cert existente) → 127.0.0.1:3012 (back) / 127.0.0.1:3013 (front)
                                                              ↑
                                              contenedores Docker gestionados por Coolify
```

## 1. Verificar el nuevo despliegue en paralelo

```bash
curl http://127.0.0.1:3012/api/v1/health
curl -X POST http://127.0.0.1:3012/api/v1/converter/md-to-pdf \
  -H "Content-Type: application/json" -d '{"content":"# prueba"}' -o /tmp/test.pdf
curl http://127.0.0.1:3013/
```

## 2. Corte del backend (reemplazar PM2 por Docker)

Cuando estés listo, edita el vhost existente (`/etc/apache2/sites-available/markconverted.conf` y `markconverted-le-ssl.conf`) — **solo cambia el puerto**, de `3010` a `3012`:

```bash
sudo sed -i 's/127\.0\.0\.1:3010/127.0.0.1:3012/g' /etc/apache2/sites-available/markconverted.conf /etc/apache2/sites-available/markconverted-le-ssl.conf
sudo systemctl reload apache2
```

Verifica que responda igual que antes:

```bash
curl -I https://markconverted.zapto.org/api/v1/health
```

Solo cuando confirmes que todo funciona bien, detén el proceso PM2 viejo (no antes — así tienes rollback instantáneo con solo revertir el `sed` y recargar Apache):

```bash
pm2 stop markconverted-back
pm2 delete markconverted-back
```

## 3. Front (opcional — decide si migrar de Vercel al VPS)

El front nuevo (contenedor `front`, puerto `3013`) está listo pero **no reemplaza Vercel automáticamente** — esa es una decisión aparte. Si en algún momento quieres servirlo desde aquí en vez de Vercel:

1. Crea un registro DNS para el subdominio que quieras usar (ej. `app.markconverted.zapto.org`), apuntando a `147.93.3.184`.
2. Vhost de Apache proxy a `127.0.0.1:3013`, más `sudo certbot --apache -d <dominio>`.
3. `front/src/environments/environment.prod.ts` ya apunta a `https://markconverted.zapto.org/api/v1` (el backend), así que no necesita cambios — solo asegúrate de que `CORS_ORIGIN` en Coolify incluya el nuevo dominio del front si decides usarlo.

## Flujo de trabajo día a día

```
código local → git push origin main → Coolify reconstruye y redespliega automáticamente
```

El webhook (`github.com/JoseHV1/markconverted` → Settings → Webhooks) ya está activo y probado end-to-end. Cada push a `main` dispara el deploy solo.
