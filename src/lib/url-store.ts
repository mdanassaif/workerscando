// Shared storage for URL shortener
// Supports both in-memory (dev) and Cloudflare KV (production)
// Automatically falls back to in-memory if Cloudflare KV is not configured

import { 
  isCloudflareKVConfigured, 
  getUrlFromCloudflareKV, 
  saveUrlToCloudflareKV, 
  incrementClickCloudflareKV 
} from './url-store-cloudflare';

export interface UrlData {
  originalUrl: string;
  createdAt: number;
  clicks: number;
  analytics: Array<{
    timestamp: number;
    ip?: string;
    userAgent?: string;
    referer?: string;
  }>;
}

// Shared URL store - used as fallback when Cloudflare KV is not configured
export const urlStore = new Map<string, UrlData>();

// Check if we should use Cloudflare KV
const useCloudflareKV = isCloudflareKVConfigured();

// Get URL data (uses KV if configured, otherwise in-memory)
export async function getUrlData(slug: string): Promise<UrlData | null> {
  if (useCloudflareKV) {
    return await getUrlFromCloudflareKV(slug);
  }
  return urlStore.get(slug) || null;
}

// Save URL data (uses KV if configured, otherwise in-memory)
export async function saveUrlData(slug: string, data: UrlData): Promise<void> {
  if (useCloudflareKV) {
    await saveUrlToCloudflareKV(slug, data);
  } else {
    urlStore.set(slug, data);
  }
}

// Increment click and add analytics
export async function incrementClick(slug: string, analytics: UrlData['analytics'][0]): Promise<void> {
  if (useCloudflareKV) {
    await incrementClickCloudflareKV(slug, analytics);
  } else {
    const data = urlStore.get(slug);
    if (!data) {
      throw new Error('Short link not found');
    }
    data.clicks += 1;
    data.analytics.push(analytics);
    // Keep only last 1000 analytics entries
    if (data.analytics.length > 1000) {
      data.analytics = data.analytics.slice(-1000);
    }
    urlStore.set(slug, data);
  }
}

// Generate a short ID
export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
