import { handleCORS } from '../../shared/cors';
import { errorResponse, jsonResponse } from '../../shared/response';

const generateId = (): string => Math.random().toString(36).substring(2, 10);

interface Env {
  HIREWIRE_DB: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = handleCORS(request);
    if (cors) return cors;

    if (path === '/register' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { webhookUrl?: string; name?: string };
        if (!body.webhookUrl?.trim()) {
          return errorResponse('Missing webhookUrl', 400);
        }
        if (!body.webhookUrl.includes('discord') || !body.webhookUrl.includes('webhooks')) {
          return errorResponse('Use a Discord webhook URL', 400);
        }

        const userId = generateId();
        await env.HIREWIRE_DB.put(
          userId,
          JSON.stringify({ webhook: body.webhookUrl.trim(), name: body.name || '' }),
        );

        return jsonResponse({
          success: true,
          userId,
          message: 'Registered',
          scriptUrl: `${url.origin}/widget.js?id=${userId}`,
        });
      } catch {
        return errorResponse('Invalid JSON body', 400);
      }
    }

    if (path === '/send' && request.method === 'POST') {
      const userId = url.searchParams.get('id');
      if (!userId) return errorResponse('Missing id', 400);

      const raw = await env.HIREWIRE_DB.get(userId);
      if (!raw) return errorResponse('User not found', 404);

      let email = '';
      let message = '';
      try {
        const body = (await request.json()) as { email?: string; message?: string };
        email = body.email?.trim() || '';
        message = body.message?.trim() || '';
      } catch {
        return errorResponse('Invalid JSON body', 400);
      }

      if (!email || !message) {
        return errorResponse('email and message required', 400);
      }

      const { webhook } = JSON.parse(raw) as { webhook: string };

      let discord: Response;
      try {
        discord = await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `**HireWire** — ${email}\n${message}`,
          }),
        });
      } catch {
        return errorResponse('Could not reach Discord', 502);
      }

      if (!discord.ok) {
        return errorResponse('Discord rejected the webhook (check URL)', 502);
      }

      return jsonResponse({ sent: true });
    }

    if (path === '/widget.js' && request.method === 'GET') {
      const userId = url.searchParams.get('id');
      if (!userId) return errorResponse('Missing id', 400);

      const script = `
(function(){
  window.HireWire = window.HireWire || {};
  window.HireWire.send = async function(email, message) {
    const res = await fetch("${url.origin}/send?id=${userId}", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message })
    });
    return res.json();
  };
})();
`;
      return new Response(script, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response('HireWire — POST /register, GET /widget.js?id=', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};
