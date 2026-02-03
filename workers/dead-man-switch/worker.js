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

            // Get encrypted data for decryption (used by frontend)
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

// Handle external cron trigger (from cron-job.org)
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

    if (authHeader !== expectedToken) {
        return new Response(JSON.stringify({
            error: 'Unauthorized - Invalid token'
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

// Send verification email - clean professional design
async function sendVerificationEmail(env, switchData, token) {
    const frontendUrl = env.FRONTEND_URL || 'https://workerscando.com/projects/dead-man-switch';
    const verifyUrl = `${frontendUrl}/verify?id=${switchData.id}&token=${token}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181B; max-width: 600px; margin: 0 auto; padding: 0; background: #F4F4F5; }
        .container { background: #FFFFFF; margin: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #F97316; color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .content h2 { margin: 0 0 16px; font-size: 20px; color: #18181B; }
        .content p { margin: 0 0 16px; color: #52525B; }
        .button { display: inline-block; background: #F97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }
        .button:hover { background: #EA580C; }
        .button-container { text-align: center; margin: 32px 0; }
        .info-box { background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 6px; padding: 16px; margin: 24px 0; }
        .info-box p { margin: 0; color: #9A3412; font-size: 14px; }
        .details { background: #FAFAFA; border-radius: 6px; padding: 16px; margin: 24px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E5E5; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #71717A; font-size: 14px; }
        .details-value { color: #18181B; font-size: 14px; font-weight: 500; }
        .footer { padding: 24px; text-align: center; border-top: 1px solid #E5E5E5; }
        .footer p { margin: 0; color: #A1A1AA; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Dead Man's Switch</h1>
        </div>
        <div class="content">
          <h2>Check-In Required</h2>
          <p>This is your scheduled check-in. Click the button below to confirm you're still active and keep your secret safe.</p>
          
          <div class="button-container">
            <a href="${verifyUrl}" class="button">Confirm I'm Active</a>
          </div>
          
          <div class="info-box">
            <p><strong>Important:</strong> If you don't respond within the next check interval, your secret will be sent to your designated recipient.</p>
          </div>
          
          <div class="details">
            <div class="details-row">
              <span class="details-label">Check Interval</span>
              <span class="details-value">Every ${switchData.checkInterval} minute(s)</span>
            </div>
            <div class="details-row">
              <span class="details-label">Recipient</span>
              <span class="details-value">${switchData.recipientEmail}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Missed Checks</span>
              <span class="details-value">${switchData.missedChecks} of 2</span>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>Dead Man's Switch by WorkersCanDo</p>
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
                subject: 'Check-In Required - Dead Man\'s Switch',
                html: emailHtml,
            }),
        });
    }
}

// Send secret to recipient - clean professional design
async function sendSecretEmail(env, switchData) {
    const frontendUrl = env.FRONTEND_URL || 'https://workerscando.com/projects/dead-man-switch';
    const decryptUrl = `${frontendUrl}/decrypt?id=${switchData.id}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181B; max-width: 600px; margin: 0 auto; padding: 0; background: #F4F4F5; }
        .container { background: #FFFFFF; margin: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: #DC2626; color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .content h2 { margin: 0 0 16px; font-size: 20px; color: #18181B; }
        .content p { margin: 0 0 16px; color: #52525B; }
        .button { display: inline-block; background: #DC2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }
        .button:hover { background: #B91C1C; }
        .button-container { text-align: center; margin: 32px 0; }
        .alert-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 6px; padding: 16px; margin: 24px 0; }
        .alert-box p { margin: 0; color: #991B1B; font-size: 14px; }
        .footer { padding: 24px; text-align: center; border-top: 1px solid #E5E5E5; }
        .footer p { margin: 0; color: #A1A1AA; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Secret Released</h1>
        </div>
        <div class="content">
          <h2>A Secret Has Been Entrusted to You</h2>
          
          <div class="alert-box">
            <p><strong>Notice:</strong> This secret was released because the owner failed to respond to multiple check-ins.</p>
          </div>
          
          <p>Someone designated you to receive their encrypted secret in the event they are unable to respond. Click the button below to view and decrypt the message.</p>
          
          <div class="button-container">
            <a href="${decryptUrl}" class="button">View Secret</a>
          </div>
          
          <p style="font-size: 14px; color: #71717A;">The secret is encrypted and will be decrypted in your browser for security.</p>
        </div>
        <div class="footer">
          <p>Dead Man's Switch by WorkersCanDo</p>
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
                subject: 'Secret Released - Dead Man\'s Switch',
                html: emailHtml,
            }),
        });
    }
}
