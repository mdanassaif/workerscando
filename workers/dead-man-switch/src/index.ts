import { Hono, Context } from 'hono';
import { encrypt } from './utils/crypto';

export { DeadManSwitchWorkflow } from './workflow';

interface Env {
    DEAD_MAN_SWITCH_WORKFLOW: Workflow;
    KV_BINDING: KVNamespace;
    ENCRYPTION_SECRET: string;
    RESEND_API_KEY?: string;
}

interface Workflow {
    create(options: { id: string; params: unknown }): Promise<void>;
    get(id: string): Promise<WorkflowInstance | null>;
}

interface WorkflowInstance {
    sendEvent(event: { type: string; payload: unknown }): Promise<void>;
    status(): Promise<{ status: string }>;
}

interface ArmRequest {
    secret: string;
    userEmail: string;
    nextOfKinEmail: string;
    checkInDelay?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('/*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
    if (c.req.method === 'OPTIONS') return c.body(null, 204);
    await next();
});

app.get('/', (c) => c.json({ status: 'online', service: 'Dead Man Switch', version: '1.0.1' }));

app.post('/arm', async (c) => {
    try {
        const body = await c.req.json<ArmRequest>();
        const { secret, userEmail, nextOfKinEmail, checkInDelay = "7 days" } = body;

        if (!secret || !userEmail || !nextOfKinEmail) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail) || !emailRegex.test(nextOfKinEmail)) {
            return c.json({ error: "Invalid email format" }, 400);
        }

        const encryptionKey = c.env.ENCRYPTION_SECRET;
        if (!encryptionKey || encryptionKey.length < 16) {
            return c.json({ error: "Server configuration error" }, 500);
        }

        const id = crypto.randomUUID();
        const secretId = `secret-${id}`;
        const workflowId = `switch-${id}`;
        const encryptedSecret = await encrypt(secret, encryptionKey);

        await c.env.KV_BINDING.put(secretId, encryptedSecret);

        const origin = new URL(c.req.url).origin;
        const checkInUrl = `${origin}/check-in/${workflowId}`;

        
        // Cloudflare Workflows have a 5-minute execution timeout
        const delayLower = checkInDelay.toLowerCase();
        let gracePeriod = "24 hours";
        
        if (delayLower.includes("second") || delayLower.includes("minute")) {
            gracePeriod = "2 minutes"; // 1min + 2min = 3min 
        } else if (delayLower.includes("hour")) {
            gracePeriod = "1 hour";
        }

        console.log(`[DeadManSwitch] Arming - ID: ${workflowId}, Delay: ${checkInDelay}, Grace: ${gracePeriod}`);

        await c.env.DEAD_MAN_SWITCH_WORKFLOW.create({
            id: workflowId,
            params: { secretId, userEmail, nextOfKinEmail, checkInDelay, checkInUrl, gracePeriod }
        });

        return c.json({
            success: true,
            message: "Dead Man's Switch Armed Successfully",
            workflowId,
            checkInUrl,
            checkInDelay,
            gracePeriod
        }, 201);

    } catch (e: unknown) {
        console.error("[DeadManSwitch] Failed:", e);
        return c.json({ error: "Failed to arm switch", details: e instanceof Error ? e.message : String(e) }, 500);
    }
});

app.get('/check-in/:workflowId', async (c) => {
    const workflowId = c.req.param('workflowId');
    try {
        const instance = await c.env.DEAD_MAN_SWITCH_WORKFLOW.get(workflowId);
        if (!instance) {
            return c.html('<html><body style="font-family: system-ui; max-width: 600px; margin: 100px auto; text-align: center;"><h1>❌ Invalid Link</h1></body></html>', 404);
        }

        await instance.sendEvent({ type: "user_checked_in", payload: { timestamp: new Date().toISOString() } });

        return c.html(`<html><head><style>body{font-family:system-ui;max-width:600px;margin:100px auto;text-align:center;padding:20px}.success{background:#10b981;color:white;padding:60px 40px;border-radius:20px;box-shadow:0 10px 40px rgba(16,185,129,0.3)}h1{margin:0 0 20px 0;font-size:48px}p{font-size:18px;opacity:0.9;margin:0}</style></head><body><div class="success"><h1>✅ Check-in Successful!</h1><p>Switch disarmed. Your secret is safe.</p></div></body></html>`);

    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        return c.html(`<html><body style="font-family:system-ui;max-width:600px;margin:100px auto;text-align:center;"><h1>❌ Check-in Failed</h1><p>${errorMessage}</p></body></html>`, 500);
    }
});

app.get('/status/:workflowId', async (c: Context<{ Bindings: Env }>) => {
    try {
        const instance = await c.env.DEAD_MAN_SWITCH_WORKFLOW.get(c.req.param('workflowId'));
        if (!instance) return c.json({ error: "Workflow not found" }, 404);
        const status = await instance.status();
        return c.json({ workflowId: c.req.param('workflowId'), status: status.status, details: status });
    } catch (e: unknown) {
        return c.json({ error: "Failed to get status", details: e instanceof Error ? e.message : String(e) }, 500);
    }
});

export default app;