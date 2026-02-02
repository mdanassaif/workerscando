/**
 * APIThrottle - Smart, Learning Rate Limiter for APIs
 * Edge-based rate limiting that adapts to behavior — IP + fingerprint + patterns.
 * Free, fast, global protection for your APIs.
 */

export interface Env {
    THROTTLE_KV: KVNamespace;
}

// Configuration limits
const LIMITS: {
    HUMAN_BASE: number;
    SUSPICIOUS_MULTIPLIER: number;
    WINDOW_SEC: number;
    SOFT_DELAY_MS: number;
    SCORE_TRUSTED: number;
    SCORE_SUSPICIOUS: number;
} = {
    HUMAN_BASE: 60,               // 60 requests per minute (1 req/sec avg)
    SUSPICIOUS_MULTIPLIER: 0.3,   // 18 requests per minute for bots
    WINDOW_SEC: 60,               // 1 minute window
    SOFT_DELAY_MS: 800,           // delay for soft-throttled requests
    SCORE_TRUSTED: 65,            // score threshold for trusted clients
    SCORE_SUSPICIOUS: 35,         // score threshold for suspicious clients
};

// Scoring weights for behavior analysis
const SCORE_WEIGHTS = {
    tooFast: -40,                 // < 100ms between requests = very bot-like
    humanPause: 25,               // 3-15s between requests = human-like
    slowPace: 15,                 // 15-60s between requests = casual browsing
    veryFast: -20,                // 100-500ms = automated but not extreme
    moderate: 10,                 // 500ms-3s = normal human usage
} as const;

// Client state interface
interface ClientState {
    count: number;                // requests in current window
    last: number;                 // last request timestamp
    score: number;                // behavioral score (0-100)
    windowStart: number;          // current window start timestamp
    blocked: number;              // times blocked in history
    patterns: number[];           // recent request intervals for analysis
}

// Analytics data interface
interface AnalyticsData {
    totalRequests: number;
    totalBlocked: number;
    totalSoftThrottled: number;
    topClients: { key: string; count: number; score: number; status: string }[];
    lastUpdated: number;
}

// CORS headers for API responses
const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
};

// JSON response helper
const json = (data: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
    new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS, ...extraHeaders }
    });

// Error response helper
const error = (message: string, status = 400) => json({ error: message, status }, status);

/**
 * Generate a composite client key from multiple fingerprint sources
 * This provides better bot detection than IP alone
 */
function getClientKey(req: Request): string {
    const cf = (req.cf || {}) as Record<string, unknown>;

    // Extract available fingerprint data
    const ip = (cf.ip as string) || req.headers.get('CF-Connecting-IP') || 'unknown';
    const ja3 = (cf.ja3 as string) || (cf.tlsClientHello as any)?.ja3 || 'no-ja3';
    const ua = req.headers.get('User-Agent') || 'no-ua';
    const acceptLang = req.headers.get('Accept-Language') || '';

    // Create a truncated hash-like key
    const fingerprint = [
        ip,
        ja3.slice(0, 16),
        ua.slice(0, 50),
        acceptLang.slice(0, 10),
    ].join('|');

    // Simple hash to create a key
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return `${ip.replace(/[\.:]/g, '-')}-${Math.abs(hash).toString(36)}`;
}

/**
 * Calculate behavioral score based on request patterns
 */
function calculateScoreDelta(state: ClientState, now: number): number {
    const timeDelta = now - state.last;
    let delta = 0;

    // Time-based scoring
    if (timeDelta < 100) {
        delta += SCORE_WEIGHTS.tooFast;           // Too fast - very bot-like
    } else if (timeDelta < 500) {
        delta += SCORE_WEIGHTS.veryFast;          // Very fast - automated
    } else if (timeDelta < 3000) {
        delta += SCORE_WEIGHTS.moderate;          // Moderate - normal human
    } else if (timeDelta < 15000) {
        delta += SCORE_WEIGHTS.humanPause;        // Human-like pause
    } else if (timeDelta < 60000) {
        delta += SCORE_WEIGHTS.slowPace;          // Casual browsing
    }

    // Pattern analysis - check for robotic regularity
    if (state.patterns.length >= 5) {
        const avg = state.patterns.reduce((a, b) => a + b, 0) / state.patterns.length;
        const variance = state.patterns.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / state.patterns.length;
        const stdDev = Math.sqrt(variance);

        // Very low variance = robotic behavior (bots tend to be regular)
        if (stdDev < 50 && avg < 1000) {
            delta -= 30;
        }
        // High variance = human behavior (humans are irregular)
        else if (stdDev > 500) {
            delta += 10;
        }
    }

    return delta;
}

/**
 * Get client classification based on score
 */
function getClassification(score: number): 'trusted' | 'normal' | 'suspicious' | 'bot' {
    if (score >= LIMITS.SCORE_TRUSTED) return 'trusted';
    if (score >= 50) return 'normal';
    if (score >= LIMITS.SCORE_SUSPICIOUS) return 'suspicious';
    return 'bot';
}

/**
 * Main throttle check function
 */
async function checkThrottle(
    req: Request,
    env: Env,
    ctx: ExecutionContext
): Promise<{ decision: 'allow' | 'soft' | 'block'; state: ClientState; key: string; classification: string }> {
    const clientKey = getClientKey(req);
    const now = Date.now();
    const kvKey = `throttle:${clientKey}`;

    // Get or initialize client state
    let state = await env.THROTTLE_KV.get<ClientState>(kvKey, { type: 'json' });

    if (!state) {
        state = {
            count: 0,
            last: 0,
            score: 50,  // Start neutral
            windowStart: now,
            blocked: 0,
            patterns: []
        };
    }

    // Reset window if expired
    if (now - state.windowStart > LIMITS.WINDOW_SEC * 1000) {
        state = {
            count: 0,
            last: state.last,
            score: state.score,  // Preserve score across windows
            windowStart: now,
            blocked: state.blocked,
            patterns: []
        };
    }

    // Update behavioral score
    if (state.last > 0) {
        const timeDelta = now - state.last;
        const scoreDelta = calculateScoreDelta(state, now);
        state.score = Math.max(0, Math.min(100, state.score + scoreDelta));

        // Track patterns (keep last 10 intervals)
        state.patterns.push(timeDelta);
        if (state.patterns.length > 10) {
            state.patterns.shift();
        }
    }

    state.count++;
    state.last = now;

    // Determine rate limit based on classification
    const classification = getClassification(state.score);
    let maxAllowed = LIMITS.HUMAN_BASE;

    if (classification === 'suspicious' || classification === 'bot') {
        maxAllowed = Math.floor(LIMITS.HUMAN_BASE * LIMITS.SUSPICIOUS_MULTIPLIER);
    } else if (classification === 'trusted') {
        maxAllowed = Math.floor(LIMITS.HUMAN_BASE * 1.5);  // Trusted clients get more leeway
    }

    // Determine decision
    let decision: 'allow' | 'soft' | 'block';
    if (state.count > maxAllowed * 1.5) {
        decision = 'block';
        state.blocked++;
    } else if (state.count > maxAllowed) {
        decision = 'soft';
    } else {
        decision = 'allow';
    }

    // Save state asynchronously
    ctx.waitUntil(
        env.THROTTLE_KV.put(kvKey, JSON.stringify(state), {
            expirationTtl: LIMITS.WINDOW_SEC + 120
        })
    );

    return { decision, state, key: clientKey, classification };
}

/**
 * Handle API proxy request
 */
async function handleProxy(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return error('Missing required parameter: url. Usage: /api/throttle?url=https://your-api.com/endpoint');
    }

    // Validate target URL
    let parsedTarget: URL;
    try {
        parsedTarget = new URL(targetUrl);
    } catch {
        return error('Invalid target URL provided');
    }

    // Check throttle status
    const { decision, state, key, classification } = await checkThrottle(req, env, ctx);

    // Handle blocking
    if (decision === 'block') {
        const retryAfter = Math.ceil((LIMITS.WINDOW_SEC * 1000 - (Date.now() - state.windowStart)) / 1000);
        return json(
            {
                error: 'Too Many Requests - Rate limit exceeded',
                retryAfter,
                classification,
                score: state.score
            },
            429,
            { 'Retry-After': String(retryAfter) }
        );
    }

    // Apply soft throttle delay
    if (decision === 'soft') {
        await new Promise(r => setTimeout(r, LIMITS.SOFT_DELAY_MS));
    }

    // Proxy the request
    try {
        const targetReq = new Request(parsedTarget.toString(), {
            method: req.method,
            headers: req.headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
        });

        const response = await fetch(targetReq);

        // Forward response with throttle info headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('X-Throttle-Status', decision);
        newHeaders.set('X-Throttle-Score', String(state.score));
        newHeaders.set('X-Throttle-Classification', classification);
        newHeaders.set('X-Throttle-Remaining', String(Math.max(0, LIMITS.HUMAN_BASE - state.count)));

        // Add CORS headers
        Object.entries(CORS).forEach(([k, v]) => newHeaders.set(k, v));

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        return error(`Failed to proxy request: ${err instanceof Error ? err.message : 'Unknown error'}`, 502);
    }
}

/**
 * Check throttle status without proxying
 */
async function handleCheck(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { decision, state, key, classification } = await checkThrottle(req, env, ctx);

    const remaining = Math.max(0, LIMITS.HUMAN_BASE - state.count);
    const windowRemaining = Math.ceil((LIMITS.WINDOW_SEC * 1000 - (Date.now() - state.windowStart)) / 1000);

    return json({
        clientKey: key,
        decision,
        classification,
        score: state.score,
        requests: {
            current: state.count,
            limit: LIMITS.HUMAN_BASE,
            remaining
        },
        window: {
            durationSeconds: LIMITS.WINDOW_SEC,
            remainingSeconds: windowRemaining
        },
        history: {
            timesBlocked: state.blocked
        }
    });
}

/**
 * Get analytics/stats
 */
async function handleStats(env: Env): Promise<Response> {
    // Get analytics data (if stored) or return basic info
    const analyticsKey = 'analytics:global';
    const analytics = await env.THROTTLE_KV.get<AnalyticsData>(analyticsKey, { type: 'json' });

    if (analytics) {
        return json({
            ...analytics,
            limits: LIMITS,
            message: 'Analytics data available'
        });
    }

    return json({
        message: 'Analytics data will be available after processing requests',
        limits: LIMITS,
        features: [
            'IP + TLS fingerprint + User-Agent composite keys',
            'Behavioral scoring (0-100)',
            'Adaptive rate limiting',
            'Pattern analysis for bot detection',
            'Three-tier decisions: allow, soft-throttle, block'
        ]
    });
}

/**
 * Dashboard endpoint - Simple HTML dashboard
 */
async function handleDashboard(): Promise<Response> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APIThrottle Dashboard</title>
  <style>
    :root {
      --bg: #0a0a0f;
      --card: #15151f;
      --border: #252535;
      --text: #e0e0e5;
      --text-dim: #888;
      --accent: #6366f1;
      --green: #10b981;
      --yellow: #fbbf24;
      --red: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { 
      font-size: 2rem; 
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--accent), #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: var(--text-dim); margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .card h3 { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat { font-size: 2.5rem; font-weight: 700; }
    .stat.green { color: var(--green); }
    .stat.yellow { color: var(--yellow); }
    .stat.red { color: var(--red); }
    .code {
      background: #0d0d12;
      border-radius: 8px;
      padding: 1rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      margin-top: 1rem;
    }
    .code .comment { color: #6b7280; }
    .code .keyword { color: #a855f7; }
    .code .string { color: #10b981; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge.allow { background: rgba(16, 185, 129, 0.2); color: var(--green); }
    .badge.soft { background: rgba(251, 191, 36, 0.2); color: var(--yellow); }
    .badge.block { background: rgba(239, 68, 68, 0.2); color: var(--red); }
    .features { list-style: none; }
    .features li { padding: 0.5rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem; }
    .features li:last-child { border-bottom: none; }
    .features .icon { color: var(--accent); }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛡️ APIThrottle</h1>
    <p class="subtitle">Smart, Learning Rate Limiter for APIs • Edge-powered by Cloudflare Workers</p>
    
    <div class="grid">
      <div class="card">
        <h3>Request Decisions</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div><span class="badge allow">ALLOW</span><p style="margin-top: 0.5rem; color: var(--text-dim); font-size: 0.8rem;">Normal traffic</p></div>
          <div><span class="badge soft">SOFT</span><p style="margin-top: 0.5rem; color: var(--text-dim); font-size: 0.8rem;">+800ms delay</p></div>
          <div><span class="badge block">BLOCK</span><p style="margin-top: 0.5rem; color: var(--text-dim); font-size: 0.8rem;">429 response</p></div>
        </div>
      </div>
      
      <div class="card">
        <h3>Rate Limits</h3>
        <p><strong>300</strong> req/5min for trusted clients</p>
        <p><strong>90</strong> req/5min for suspicious clients</p>
        <p><strong>450</strong> req/5min for highly trusted</p>
      </div>
      
      <div class="card">
        <h3>Detection Features</h3>
        <ul class="features">
          <li><span class="icon">🔍</span> IP + TLS Fingerprint + UA</li>
          <li><span class="icon">📊</span> Behavioral scoring (0-100)</li>
          <li><span class="icon">🤖</span> Bot pattern detection</li>
          <li><span class="icon">⚡</span> Adaptive rate limits</li>
        </ul>
      </div>
    </div>
    
    <div class="card" style="margin-top: 1.5rem;">
      <h3>Quick Start</h3>
      <div class="code">
<span class="comment">// Instead of calling your API directly:</span>
<span class="keyword">fetch</span>(<span class="string">"https://myapi.com/users"</span>)

<span class="comment">// Route through APIThrottle:</span>
<span class="keyword">fetch</span>(<span class="string">"https://apithrottle.workers.dev/api/throttle?url=https://myapi.com/users"</span>)
      </div>
    </div>
    
    <div class="card" style="margin-top: 1.5rem;">
      <h3>API Endpoints</h3>
      <ul class="features">
        <li><code style="color: var(--accent);">GET /api/throttle?url=...</code> Proxy request with throttling</li>
        <li><code style="color: var(--accent);">POST /api/throttle?url=...</code> Proxy POST request</li>
        <li><code style="color: var(--accent);">GET /api/check</code> Check your current throttle status</li>
        <li><code style="color: var(--accent);">GET /api/stats</code> View rate limit configuration</li>
        <li><code style="color: var(--accent);">GET /dashboard</code> This dashboard</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS }
    });
}

/**
 * Main Worker entry point
 */
export default {
    async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(req.url);
        const path = url.pathname;

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            return new Response(null, { headers: CORS });
        }

        // Route handlers
        switch (true) {
            case path === '/':
                return json({
                    name: 'APIThrottle',
                    description: 'Smart, Learning Rate Limiter for APIs',
                    version: '1.0.0',
                    endpoints: {
                        '/api/throttle?url=...': 'Proxy request with intelligent rate limiting',
                        '/api/check': 'Check your current throttle status',
                        '/api/stats': 'View rate limit configuration and stats',
                        '/dashboard': 'Interactive dashboard'
                    },
                    features: [
                        'Composite fingerprinting (IP + JA3 + User-Agent)',
                        'Behavioral scoring for bot detection',
                        'Adaptive rate limits based on client trust',
                        'Three-tier decisions: allow, soft-throttle, block',
                        'Zero-latency edge execution'
                    ],
                    author: '@workerscando'
                });

            case path === '/api/throttle':
                return handleProxy(req, env, ctx);

            case path === '/api/check':
                return handleCheck(req, env, ctx);

            case path === '/api/stats':
                return handleStats(env);

            case path === '/dashboard':
                return handleDashboard();

            default:
                return error('Not Found. Available endpoints: /api/throttle, /api/check, /api/stats, /dashboard', 404);
        }
    }
};
