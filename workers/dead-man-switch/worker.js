// Dead Man's Switch - Cloudflare Worker
// Handles all API endpoints and scheduling logic

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // API Routes only - no HTML

            if (path === '/api/create' && request.method === 'POST') {
                return await handleCreateSwitch(request, env, corsHeaders);
            }

            if (path.startsWith('/api/verify/') && request.method === 'POST') {
                return await handleVerify(request, env, corsHeaders);
            }

            if (path.startsWith('/api/check/') && request.method === 'GET') {
                return await handleCheckStatus(request, env, corsHeaders);
            }

            if (path === '/api/trigger-check' && request.method === 'POST') {
                // For testing - manually trigger a check
                return await handleManualTrigger(request, env, corsHeaders);
            }

            // NEW: Get encrypted data for decryption (used by frontend)
            if (path.startsWith('/api/decrypt/') && request.method === 'GET') {
                const switchId = path.split('/')[3];
                return await handleGetDecryptData(request, env, corsHeaders, switchId);
            }

            if (path === '/api/cron-check-all' && request.method === 'POST') {
                return await handleExternalCron(request, env, corsHeaders);
            }

            return new Response(JSON.stringify({
                status: 'online',
                message: 'Dead Man\'s Switch API',
                version: '2.0.0'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    },
};

// 🆕 Handle external cron trigger (from cron-job.org)
async function handleExternalCron(request, env, corsHeaders) {
    // Security: Verify the secret token
    const authHeader = request.headers.get('Authorization');

    // Check if CRON_SECRET is set
    if (!env.CRON_SECRET) {
        return new Response(JSON.stringify({
            error: 'CRON_SECRET not set in worker',
            help: 'Run: wrangler secret put CRON_SECRET'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const expectedToken = `Bearer ${env.CRON_SECRET}`;

    // Debug logging (remove in production)
    console.log('Received auth header:', authHeader);
    console.log('Expected format: Bearer YOUR_SECRET');

    if (authHeader !== expectedToken) {
        return new Response(JSON.stringify({
            error: 'Unauthorized - Invalid token',
            receivedHeader: authHeader ? 'Header received (check format)' : 'No Authorization header',
            expectedFormat: 'Bearer YOUR_SECRET_TOKEN'
        }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Check all switches
    await checkAllSwitches(env);

    return new Response(JSON.stringify({
        success: true,
        message: 'All switches checked successfully',
        timestamp: new Date().toISOString()
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Get decrypt data (API endpoint for frontend)
async function handleGetDecryptData(request, env, corsHeaders, switchId) {
    const switchDataRaw = await env.DEAD_MAN_SWITCH.get(`switch:${switchId}`);

    if (!switchDataRaw) {
        return new Response(JSON.stringify({ error: 'Switch not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const switchData = JSON.parse(switchDataRaw);

    if (!switchData.triggered) {
        return new Response(JSON.stringify({
            error: 'Switch not triggered yet',
            status: 'active'
        }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Return the encrypted data for client-side decryption
    return new Response(JSON.stringify({
        success: true,
        encryptedSecret: switchData.encryptedSecret,
        recipientEmail: switchData.recipientEmail,
        triggeredAt: switchData.triggeredAt || Date.now()
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Generate unique ID
function generateId() {
    return crypto.randomUUID();
}

// Generate secure token for verification
async function generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Create a new dead man's switch
async function handleCreateSwitch(request, env, corsHeaders) {
    const data = await request.json();
    const { encryptedSecret, ownerEmail, recipientEmail, checkInterval, salt, iv } = data;

    // Validation
    if (!encryptedSecret || !ownerEmail || !recipientEmail || !checkInterval || !salt || !iv) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const switchId = generateId();
    const verificationToken = await generateToken();

    // Store in KV
    const switchData = {
        id: switchId,
        encryptedSecret,
        ownerEmail,
        recipientEmail,
        checkInterval, // in minutes
        salt,
        iv,
        verificationToken,
        lastCheckSent: Date.now(),
        lastVerified: Date.now(),
        createdAt: Date.now(),
        triggered: false,
        missedChecks: 0,
    };

    await env.DEAD_MAN_SWITCH.put(
        `switch:${switchId}`,
        JSON.stringify(switchData)
    );

    // Add to active switches list
    const activeSwitches = await getActiveSwitches(env);
    activeSwitches.push(switchId);
    await env.DEAD_MAN_SWITCH.put('active_switches', JSON.stringify(activeSwitches));

    // Send initial verification email
    await sendVerificationEmail(env, switchData, verificationToken);

    return new Response(JSON.stringify({
        success: true,
        switchId,
        message: 'Dead man\'s switch created. Check your email to verify.'
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Handle verification click
async function handleVerify(request, env, corsHeaders) {
    const url = new URL(request.url);
    const token = url.pathname.split('/').pop();
    const { switchId } = await request.json();

    const switchKey = `switch:${switchId}`;
    const switchDataRaw = await env.DEAD_MAN_SWITCH.get(switchKey);

    if (!switchDataRaw) {
        return new Response(JSON.stringify({ error: 'Switch not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const switchData = JSON.parse(switchDataRaw);

    if (switchData.verificationToken !== token) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (switchData.triggered) {
        return new Response(JSON.stringify({ error: 'Switch already triggered' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Update verification time and reset missed checks
    switchData.lastVerified = Date.now();
    switchData.missedChecks = 0;
    switchData.verificationToken = await generateToken(); // Generate new token for next check

    await env.DEAD_MAN_SWITCH.put(switchKey, JSON.stringify(switchData));

    return new Response(JSON.stringify({
        success: true,
        message: 'Verified! Your secret is safe.'
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Check status of a switch
async function handleCheckStatus(request, env, corsHeaders) {
    const url = new URL(request.url);
    const switchId = url.pathname.split('/').pop();

    const switchDataRaw = await env.DEAD_MAN_SWITCH.get(`switch:${switchId}`);

    if (!switchDataRaw) {
        return new Response(JSON.stringify({ error: 'Switch not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const switchData = JSON.parse(switchDataRaw);

    return new Response(JSON.stringify({
        id: switchData.id,
        ownerEmail: switchData.ownerEmail,
        recipientEmail: switchData.recipientEmail,
        checkInterval: switchData.checkInterval,
        lastVerified: switchData.lastVerified,
        triggered: switchData.triggered,
        missedChecks: switchData.missedChecks,
        createdAt: switchData.createdAt,
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Manual trigger for testing
async function handleManualTrigger(request, env, corsHeaders) {
    const { switchId } = await request.json();

    const switchKey = `switch:${switchId}`;
    const switchDataRaw = await env.DEAD_MAN_SWITCH.get(switchKey);

    if (!switchDataRaw) {
        return new Response(JSON.stringify({ error: 'Switch not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const switchData = JSON.parse(switchDataRaw);

    // Send verification email
    await sendVerificationEmail(env, switchData, switchData.verificationToken);

    return new Response(JSON.stringify({
        success: true,
        message: 'Verification email sent!'
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

// Get all active switches
async function getActiveSwitches(env) {
    const activeSwitchesRaw = await env.DEAD_MAN_SWITCH.get('active_switches');
    return activeSwitchesRaw ? JSON.parse(activeSwitchesRaw) : [];
}

// Check all switches (called by cron)
async function checkAllSwitches(env) {
    const activeSwitches = await getActiveSwitches(env);

    for (const switchId of activeSwitches) {
        const switchDataRaw = await env.DEAD_MAN_SWITCH.get(`switch:${switchId}`);
        if (!switchDataRaw) continue;

        const switchData = JSON.parse(switchDataRaw);
        if (switchData.triggered) continue;

        const now = Date.now();
        const intervalMs = switchData.checkInterval * 60 * 1000;
        const timeSinceLastCheck = now - switchData.lastCheckSent;

        // Time to send a check?
        if (timeSinceLastCheck >= intervalMs) {
            const timeSinceLastVerified = now - switchData.lastVerified;

            // If they haven't verified in time, increment missed checks
            if (timeSinceLastVerified >= intervalMs) {
                switchData.missedChecks += 1;

                // After 2 missed checks, trigger the switch
                if (switchData.missedChecks >= 2) {
                    await triggerSwitch(env, switchData);
                } else {
                    // Send another verification email
                    await sendVerificationEmail(env, switchData, switchData.verificationToken);
                    switchData.lastCheckSent = now;
                }
            } else {
                // They verified, send next check
                await sendVerificationEmail(env, switchData, switchData.verificationToken);
                switchData.lastCheckSent = now;
            }

            await env.DEAD_MAN_SWITCH.put(`switch:${switchId}`, JSON.stringify(switchData));
        }
    }
}

// Trigger the switch - send secret to recipient
async function triggerSwitch(env, switchData) {
    switchData.triggered = true;
    switchData.triggeredAt = Date.now();
    await env.DEAD_MAN_SWITCH.put(`switch:${switchData.id}`, JSON.stringify(switchData));

    // Send email to recipient with encrypted secret
    await sendSecretEmail(env, switchData);
}

// Send verification email
async function sendVerificationEmail(env, switchData, token) {
    // Links point to frontend, not worker
    const frontendUrl = env.FRONTEND_URL || 'https://workerscando.com/projects/dead-man-switch';
    const verifyUrl = `${frontendUrl}/verify?id=${switchData.id}&token=${token}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
        .header { background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .button { display: inline-block; background: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Dead Man's Switch</h1>
          <p>Proof of Life Check</p>
        </div>
        <div style="padding: 30px;">
          <h2>Are you still there?</h2>
          <p>This is your scheduled check-in for your Dead Man's Switch.</p>
          <p>Click the button below to confirm you're alive and well:</p>
          <div style="text-align: center;">
            <a href="${verifyUrl}" class="button">I'm Alive! ✓</a>
          </div>
          <div class="warning">
            <strong>⚠️ Important:</strong> If you don't click this link within the next check interval, your secret will be automatically sent to your designated recipient.
          </div>
          <p><strong>Your Switch Details:</strong></p>
          <ul>
            <li>Check Interval: Every ${switchData.checkInterval} minute(s)</li>
            <li>Recipient: ${switchData.recipientEmail}</li>
            <li>Missed Checks: ${switchData.missedChecks}/2</li>
          </ul>
        </div>
        <div class="footer">
          <p>Dead Man's Switch - Your secrets, safely guarded</p>
        </div>
      </div>
    </body>
    </html>
  `;

    // Using Resend API
    if (env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Dead Man\'s Switch <noreply@deadman.workerscando.com>',
                to: switchData.ownerEmail,
                subject: '🔐 Proof of Life Check - Dead Man\'s Switch',
                html: emailHtml,
            }),
        });
    }
}

// Send secret to recipient
async function sendSecretEmail(env, switchData) {
    const frontendUrl = env.FRONTEND_URL || 'https://workerscando.com/projects/dead-man-switch';
    const decryptUrl = `${frontendUrl}/decrypt?id=${switchData.id}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 12px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Dead Man's Switch Triggered</h1>
          <p>A secret has been released to you</p>
        </div>
        <div style="padding: 30px;">
          <div class="alert">
            <strong>Important Notice:</strong> Someone has designated you to receive their secret in the event they are unable to respond.
          </div>
          <p>A Dead Man's Switch has been triggered because the owner failed to respond to multiple check-ins.</p>
          <p>Click below to view the secret that has been entrusted to you:</p>
          <div style="text-align: center;">
            <a href="${decryptUrl}" class="button">View Secret 🔓</a>
          </div>
          <p><small>This link will allow you to decrypt and view the secret that was left for you.</small></p>
        </div>
        <div class="footer">
          <p>Dead Man's Switch - Secure secret transmission</p>
        </div>
      </div>
    </body>
    </html>
  `;

    if (env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Dead Man\'s Switch <noreply@deadman.workerscando.com>',
                to: switchData.recipientEmail,
                subject: '⚠️ Dead Man\'s Switch Triggered - Secret Released',
                html: emailHtml,
            }),
        });
    }
}
