import { handleCORS } from '../../shared/cors';
import { errorResponse, jsonResponse } from '../../shared/response';

const MAX_HOPS = 20;

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

interface TraceResult {
  final_url: string;
  total_hops: number;
  total_ms: number;
  has_downgrade: boolean;
  hops: Hop[];
  error?: string;
}

function getParams(url: string): Record<string, string> {
  try {
    const params: Record<string, string> = {};
    new URL(url).searchParams.forEach((v, k) => { params[k] = v; });
    return params;
  } catch {
    return {};
  }
}

function diffParams(prev: Record<string, string>, curr: Record<string, string>) {
  return {
    added: Object.keys(curr).filter(k => !(k in prev)),
    removed: Object.keys(prev).filter(k => !(k in curr)),
  };
}

function isDowngrade(from: string, to: string): boolean {
  try {
    return new URL(from).protocol === 'https:' && new URL(to).protocol === 'http:';
  } catch {
    return false;
  }
}

function resolveLocation(location: string, base: string): string {
  if (location.startsWith('http://') || location.startsWith('https://')) return location;
  try { return new URL(location, base).toString(); } catch { return location; }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const cors = handleCORS(request);
    if (cors) return cors;

    if (request.method !== 'POST') return errorResponse('POST only', 405);

    let target: string;
    try {
      const body = (await request.json()) as { url?: string };
      target = body.url?.trim() ?? '';
    } catch {
      return errorResponse('Invalid JSON', 400);
    }

    if (!target) return errorResponse('Missing url', 400);
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    try { new URL(target); } catch { return errorResponse('Invalid URL', 400); }

    const hops: Hop[] = [];
    let current = target;
    let prevParams: Record<string, string> = {};
    let hasDowngrade = false;
    const startTime = Date.now();

    for (let i = 0; i < MAX_HOPS; i++) {
      const t0 = Date.now();
      let status = 0;
      let locationHeader: string | null = null;

      try {
        const res = await fetch(current, {
          method: 'GET',
          redirect: 'manual',
          headers: { 'User-Agent': 'WorkersCanDo-RedirectTracer/1.0' },
        });
        status = res.status;
        locationHeader = res.headers.get('location');
      } catch {
        hops.push({
          url: current, status: 0,
          duration_ms: Date.now() - t0,
          location_header: null,
          params: getParams(current),
          added_params: [], removed_params: [], is_downgrade: false,
        });
        break;
      }

      const currParams = getParams(current);
      const { added, removed } = diffParams(prevParams, currParams);
      const downgrade = i > 0 && isDowngrade(hops[i - 1].url, current);
      if (downgrade) hasDowngrade = true;

      hops.push({
        url: current, status,
        duration_ms: Date.now() - t0,
        location_header: locationHeader,
        params: currParams,
        added_params: added,
        removed_params: removed,
        is_downgrade: downgrade,
      });

      prevParams = currParams;

      if (status < 300 || status >= 400 || !locationHeader) break;

      const next = resolveLocation(locationHeader, current);
      if (next === current) break;
      current = next;
    }

    return jsonResponse({
      final_url: current,
      total_hops: hops.length,
      total_ms: Date.now() - startTime,
      has_downgrade: hasDowngrade,
      hops,
    } satisfies TraceResult);
  },
};
