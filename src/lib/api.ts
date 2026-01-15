// API endpoints - proxied through Vercel rewrites to Cloudflare Workers
export const API = {
  METADATA: '/api/metadata',
  OG_IMAGE: '/api/og-image',
} as const;
