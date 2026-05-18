# MarkConvert — Frontend

Angular 20 SPA. Part of the MarkConvert monorepo.

## Development

```bash
npm install
ng serve        # http://localhost:4200
ng build        # production build → dist/markconvert-front/browser
```

## Environment files

| File | Used for |
|------|----------|
| `environment.ts` | Local dev — points to `http://localhost:3001/api/v1` |
| `environment.prod.ts` | Production — uses relative `/api/v1`|
