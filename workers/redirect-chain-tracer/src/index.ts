export interface Env {}

interface Hop {
  url: string;
  status: number;
  duration_ms: number;
  location_header: string | null;
  params: Record<string, string>;
  added_params: string[];
  removed_params: string[];
  is_downgrade: boolean;
}

interface TraceResponse {
  final_url: string;
  total_hops: number;
  total_ms: number;
  has_downgrade: boolean;
  hops: Hop[];
  error?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let targetUrl = '';
      if (request.method === 'POST') {
        const body = await request.json() as { url?: string };
        targetUrl = body.url || '';
      } else if (request.method === 'GET') {
        const parsedUrl = new URL(request.url);
        targetUrl = parsedUrl.searchParams.get('url') || '';
      }

      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const hops: Hop[] = [];
      let currentUrl = targetUrl;
      let previousUrl = '';
      const MAX_HOPS = 20;

      let totalDuration = 0;
      let hasDowngrade = false;

      const getParams = (urlString: string) => {
        try {
          const u = new URL(urlString);
          const params: Record<string, string> = {};
          u.searchParams.forEach((val, key) => { params[key] = val; });
          return params;
        } catch {
          return {};
        }
      };

      for (let i = 0; i < MAX_HOPS; i++) {
        const start = Date.now();
        let res: Response;
        
        try {
          res = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Worker (workerscando.com)'
            }
          });
        } catch (err: any) {
          const duration = Date.now() - start;
          hops.push({
             url: currentUrl,
             status: 0,
             duration_ms: duration,
             location_header: null,
             params: getParams(currentUrl),
             added_params: [],
             removed_params: [],
             is_downgrade: false
          });
          return new Response(JSON.stringify({ 
             hops: hops,
             error: err.message || 'Fetch failed',
             total_hops: hops.length,
             total_ms: totalDuration + duration,
             final_url: currentUrl,
             has_downgrade: hasDowngrade
          }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }});
        }

        const duration = Date.now() - start;
        totalDuration += duration;
        
        const currentParams = getParams(currentUrl);
        const addedParams: string[] = [];
        const removedParams: string[] = [];
        let isDowngrade = false;

        if (previousUrl) {
           const prevParams = getParams(previousUrl);
           const currentKeys = Object.keys(currentParams);
           const prevKeys = Object.keys(prevParams);
           
           for (const k of currentKeys) {
             if (!prevKeys.includes(k) || currentParams[k] !== prevParams[k]) {
               addedParams.push(k);
             }
           }
           for (const k of prevKeys) {
             if (!currentKeys.includes(k)) {
               removedParams.push(k);
             }
           }

           if (previousUrl.startsWith('https://') && currentUrl.startsWith('http://')) {
             isDowngrade = true;
             hasDowngrade = true;
           }
        }

        const locationHeader = res.headers.get('location');

        const hop: Hop = {
          url: currentUrl,
          status: res.status,
          duration_ms: duration,
          location_header: locationHeader,
          params: currentParams,
          added_params: addedParams,
          removed_params: removedParams,
          is_downgrade: isDowngrade
        };

        hops.push(hop);

        if (res.status >= 300 && res.status < 400 && locationHeader) {
          try {
            const nextUrl = new URL(locationHeader, currentUrl).href;
            previousUrl = currentUrl;
            currentUrl = nextUrl;
          } catch (e) {
            break;
          }
        } else {
          break;
        }
      }

      const responsePayload: TraceResponse = {
        final_url: currentUrl,
        total_hops: hops.length,
        total_ms: totalDuration,
        has_downgrade: hasDowngrade,
        hops
      };

      return new Response(JSON.stringify(responsePayload), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message || 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
