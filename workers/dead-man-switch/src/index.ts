import { Hono } from 'hono';
import { Workflow } from '@cloudflare/workers-types';
import { encrypt } from './utils/crypto';

export { DeadManSwitchWorkflow } from './workflow';

interface Env {
    DEAD_MAN_SWITCH_WORKFLOW: Workflow;
    KV: KVNamespace;
    ENCRYPTION_SECRET?: string;
    RESEND_API_KEY?: string;
}

interface ArmRequest {
    secret: string;
    userEmail: string;
    nextOfKinEmail: string;
    checkInDelay?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('/*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
    if (c.req.method === 'OPTIONS') {
        return c.text('', 204);
    }
    await next();
});

app.get('/', (c) => {
    return c.text('Dead Man Switch System Online');
});

// Endpoint to ARM the switch
app.post('/arm', async (c) => {
    const body = await c.req.json<ArmRequest>();
    const { secret, userEmail, nextOfKinEmail, checkInDelay = "7 days" } = body;

    if (!secret || !userEmail || !nextOfKinEmail) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    const encryptionKey = c.env.ENCRYPTION_SECRET;
    if (!encryptionKey) {
        // Return 500 but log helpful message. 
        return c.json({ error: "Server Configuration Error: ENCRYPTION_SECRET not set" }, 500);
    }

    const id = crypto.randomUUID();
    const secretId = `secret-${id}`;
    const workflowId = `switch-${id}`;

    try {
        // Encrypt the secret
        const encryptedSecret = await encrypt(secret, encryptionKey);

        // Store the encrypted secret
        await c.env.KV.put(secretId, encryptedSecret);

        const checkInUrl = `${new URL(c.req.url).origin}/check-in/${workflowId}`;

         
        const gracePeriod = checkInDelay.toLowerCase() === "1 minute" ? "2 minutes" : "24 hours";

        // Start the workflow
        const instance = await c.env.DEAD_MAN_SWITCH_WORKFLOW.create({
            id: workflowId,
            params: {
                secretId,
                userEmail,
                nextOfKinEmail,
                checkInDelay,
                checkInUrl,
                gracePeriod
            }
        });

        return c.json({
            message: "Dead Man's Switch Armed (Encrypted)",
            workflowId: workflowId,
            checkInUrl: `${new URL(c.req.url).origin}/check-in/${workflowId}`
        });
    } catch (e: any) {
        return c.json({ error: "Failed to arm switch", details: e.message }, 500);
    }
});

// Endpoint to CHECK IN
app.get('/check-in/:workflowId', async (c) => {
    const workflowId = c.req.param('workflowId');

    try {
        const instance = await c.env.DEAD_MAN_SWITCH_WORKFLOW.get(workflowId);

        // Send the check-in event
        await instance.sendEvent({
            type: "user_checked_in",
            payload: {}
        });

        return c.text("Check-in successful! The timer has been stopped (disarmed).");
    } catch (e: any) {
        return c.json({ error: "Failed to process check-in", details: e.message }, 500);
    }
});

export default app;
