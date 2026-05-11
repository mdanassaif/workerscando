import { handleCORS, corsHeaders } from '../../shared/cors';

interface Env {
  AI: {
    run(model: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  };
}

// Strip HTML tags and collapse whitespace to get readable article text
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const cors = handleCORS(req);
    if (cors) return cors;

    const url = new URL(req.url);

    if (url.pathname === '/' || url.pathname === '') {
      if (req.method !== 'POST') {
        return json({ name: 'WebDigest', usage: 'POST / with { url }' });
      }

      let body: { url?: string; brief?: boolean };
      try {
        body = await req.json() as { url?: string; brief?: boolean };
      } catch {
        return json({ error: 'Invalid JSON body' }, 400);
      }

      const target = body.url?.trim();
      if (!target) return json({ error: 'Missing url field' }, 400);

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(target);
      } catch {
        return json({ error: 'Invalid URL' }, 400);
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return json({ error: 'Only http/https URLs are supported' }, 400);
      }

      // Fetch the webpage
      let html: string;
      try {
        const pageRes = await fetch(target, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WorkersCanDo-WebDigest/1.0)',
            Accept: 'text/html,application/xhtml+xml',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(10_000),
        });

        if (!pageRes.ok) {
          return json({ error: `Could not fetch the page (HTTP ${pageRes.status})` }, 422);
        }

        const ct = pageRes.headers.get('content-type') || '';
        if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
          return json({ error: 'URL does not point to an HTML page' }, 422);
        }

        html = await pageRes.text();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return json({ error: `Failed to fetch page: ${msg}` }, 422);
      }

      // Extract plain text and truncate for AI token limits
      const text = extractText(html);
      if (text.length < 100) {
        return json({ error: 'Page has too little readable text to summarize' }, 422);
      }

      const brief = Boolean(body.brief);
      // BART max input is ~1024 tokens (~4000 chars); Llama can handle more
      const summaryInput = text.slice(0, 3500);
      const takeawayInput = text.slice(0, brief ? 2000 : 4000);

      // --- Summarize with BART ---
      let summary: string;
      try {
        const bartResult = await env.AI.run('@cf/facebook/bart-large-cnn', {
          input_text: summaryInput,
          max_length: brief ? 128 : 256,
        });
        // BART returns { summary: string } — never JSON.parse it
        summary = (bartResult.summary as string) ?? '';
        if (!summary) throw new Error('Empty summary from model');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Model error';
        return json({ error: `Summarization failed: ${msg}` }, 500);
      }

      // --- Key takeaways with Llama ---
      let takeaways: string;
      try {
        const llamaResult = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            {
              role: 'system',
              content:
                'You are a concise content analyst. Given article text, output exactly 4 key takeaways as plain bullet points, one per line, starting each line with "- ". No intro sentence, no extra text.',
            },
            {
              role: 'user',
              content: `Article text:\n\n${takeawayInput}`,
            },
          ],
          max_tokens: 300,
        });
        // Llama returns { response: string } — it's plain text, not JSON
        const raw = (llamaResult.response as string) ?? '';
        if (!raw) throw new Error('Empty response from model');

        // Normalise: keep only lines that look like bullets or numbered items
        takeaways = raw
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0)
          .slice(0, 6)
          .join('\n');
      } catch (e) {
        // Takeaways are optional — fall back to empty rather than failing the whole request
        takeaways = '';
      }

      return json({ url: target, summary, takeaways });
    }

    return json({ error: 'Not found' }, 404);
  },
};
