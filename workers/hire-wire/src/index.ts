const generateId = (): string => Math.random().toString(36).substring(2, 8);

interface Env {
	HIREWIRE_DB: KVNamespace;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS Headers
		const headers: Record<string, string> = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		if (request.method === "OPTIONS") return new Response(null, { headers });

		// 1. REGISTER USER
		if (path === "/register" && request.method === "POST") {
			try {
				const { webhookUrl, name } = await request.json();
				if (!webhookUrl) return new Response("Missing Webhook", { status: 400, headers });

				const userId = generateId(); 
        
				// SAVE TO DATABASE (Using the new name HIREWIRE_DB)
				await env.HIREWIRE_DB.put(userId, JSON.stringify({ webhook: webhookUrl, name }));

				return new Response(JSON.stringify({
					success: true,
					userId: userId,
					message: "Account created!",
					scriptUrl: `${url.origin}/widget.js?id=${userId}`
				}), { headers: { ...headers, "Content-Type": "application/json" } });
			} catch (e: any) {
				return new Response(`Error: ${e.message}`, { status: 500, headers });
			}
		}

		// 2. SEND MESSAGE
		if (path.endsWith("/send") && request.method === "POST") {
			const userId = url.searchParams.get("id");
			if (!userId) return new Response("Missing user id", { status: 400, headers });

			// GET FROM DATABASE
			const user = await env.HIREWIRE_DB.get(userId);
			if (!user) return new Response("User not found", { status: 404, headers });

			const { webhook } = JSON.parse(user);
			const { email, message } = await request.json();

			await fetch(webhook, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: `⚡ **HireWire Alert!**\n📧 **From:** ${email}\n💬 **Msg:** ${message}`
				})
			});

			return new Response(JSON.stringify({ sent: true }), { headers });
		}

		// 3. SERVE THE WIDGET SCRIPT
		if (path === "/widget.js") {
			const userId = url.searchParams.get("id");
			const script = `
				console.log("⚡ HireWire Active: ${userId}");
				window.HireWire = {
					send: async function(email, message) {
						const res = await fetch("${url.origin}/send?id=${userId}", {
							method: "POST",
							body: JSON.stringify({ email, message })
						});
						return res.json();
					}
				};
			`;
			return new Response(script, { headers: { "Content-Type": "application/javascript", ...headers }});
		}

		return new Response("HireWire API is Live ⚡", { headers });
	}
};
