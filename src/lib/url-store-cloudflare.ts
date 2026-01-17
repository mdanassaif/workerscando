// Cloudflare KV storage implementation for Next.js API routes
// This uses Cloudflare's REST API to access KV from Next.js

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

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const KV_NAMESPACE_ID = process.env.KV_NAMESPACE_ID;

// Check if Cloudflare KV is configured
export const isCloudflareKVConfigured = () => {
  return !!(CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_API_TOKEN && KV_NAMESPACE_ID);
};

// Get URL data from Cloudflare KV
export async function getUrlFromCloudflareKV(slug: string): Promise<UrlData | null> {
  if (!isCloudflareKVConfigured()) {
    throw new Error('Cloudflare KV is not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and KV_NAMESPACE_ID environment variables.');
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/url:${slug}`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch from KV: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data as UrlData;
  } catch (error) {
    console.error('Error fetching from Cloudflare KV:', error);
    throw error;
  }
}

// Save URL data to Cloudflare KV
export async function saveUrlToCloudflareKV(slug: string, data: UrlData): Promise<void> {
  if (!isCloudflareKVConfigured()) {
    throw new Error('Cloudflare KV is not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and KV_NAMESPACE_ID environment variables.');
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/url:${slug}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save to KV: ${response.status} ${error}`);
    }
  } catch (error) {
    console.error('Error saving to Cloudflare KV:', error);
    throw error;
  }
}

// Increment click count and add analytics
export async function incrementClickCloudflareKV(slug: string, analytics: UrlData['analytics'][0]): Promise<void> {
  const data = await getUrlFromCloudflareKV(slug);
  
  if (!data) {
    throw new Error('Short link not found');
  }
  
  data.clicks += 1;
  data.analytics.push(analytics);
  
  // Keep only last 1000 analytics entries
  if (data.analytics.length > 1000) {
    data.analytics = data.analytics.slice(-1000);
  }
  
  await saveUrlToCloudflareKV(slug, data);
}
