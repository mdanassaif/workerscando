# WorkersCanDo - Backend Workers

This folder contains all Cloudflare Workers for the WorkersCanDo project.

## 📁 Structure

```
workers/
├── url-metadata/       # Tool 1: URL Metadata Extractor API
├── og-image/           # Tool 2: Dynamic OG Image Generator
├── url-shortener/      # Tool 3: URL Shortener with Analytics
├── shared/             # Shared utilities (CORS, responses, etc.)
├── package.json        # Root scripts for managing all workers
└── README.md           # This file
```

## 🚀 Quick Start

### Install all dependencies
```bash
npm run install:all
```

### Development (run one worker locally)
```bash
npm run dev:url-metadata      # http://localhost:8787
npm run dev:og-image          # http://localhost:8787
npm run dev:url-shortener     # http://localhost:8787
```

### Deploy

```bash
# Deploy a single worker
npm run deploy:url-metadata
npm run deploy:og-image
npm run deploy:url-shortener

# Deploy ALL workers
npm run deploy:all
```

## 🛠️ Adding a New Worker

1. Create a new folder:
   ```bash
   mkdir -p new-tool/src
   ```

2. Create the required files:
   - `src/index.ts` - Main worker logic
   - `wrangler.toml` - Cloudflare configuration
   - `package.json` - Dependencies

3. Add scripts to root `package.json`:
   ```json
   "dev:new-tool": "cd new-tool && npm run dev",
   "deploy:new-tool": "cd new-tool && npm run deploy"
   ```

4. Update `deploy:all` script to include the new worker.

## 📍 Deployed URLs

| Worker | URL |
|--------|-----|
| URL Metadata API | https://url-metadata-api.brogee9o9.workers.dev |
| OG Image Generator | https://og-image-generator.brogee9o9.workers.dev |
| URL Shortener | https://urlshortener.brogee9o9.workers.dev |

## 🔗 Shared Utilities

The `shared/` folder contains reusable code:

```typescript
import { corsHeaders, handleCORS } from '../shared';
import { jsonResponse, errorResponse } from '../shared';
```

## 📝 Template for New Worker

### `src/index.ts`
```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        }
      });
    }
    
    // Your API logic
    if (url.pathname === '/api/your-endpoint') {
      return new Response(JSON.stringify({ result: "Hello!" }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

### `wrangler.toml`
```toml
name = "your-worker-name"
main = "src/index.ts"
compatibility_date = "2024-01-01"
```

### `package.json`
```json
{
  "name": "your-worker-name",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^5.0.0",
    "wrangler": "^3.0.0"
  }
}
```
