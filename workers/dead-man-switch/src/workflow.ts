import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { decrypt } from './utils/crypto';

interface Env {
    KV_BINDING: KVNamespace;  
    ENCRYPTION_SECRET: string;
    RESEND_API_KEY?: string;
}

interface CapsuleParams {
    secretId: string;
    userEmail: string;
    nextOfKinEmail: string;
    checkInDelay: string;
    checkInUrl: string;
    gracePeriod?: string;
}

export class DeadManSwitchWorkflow extends WorkflowEntrypoint<Env, CapsuleParams> {
    async run(event: WorkflowEvent<CapsuleParams>, step: WorkflowStep) {
        const { secretId, userEmail, nextOfKinEmail, checkInDelay, checkInUrl, gracePeriod } = event.payload;

        console.log(`[Workflow] Started - ID: ${event.id}, Delay: ${checkInDelay}`);

        // Step 1: Notify user that switch is armed
        await step.do("notify user armed", async () => {
            console.log(`[Workflow] Notifying user: ${userEmail}`);
            await this.sendEmail(
                userEmail,
                "Dead Man's Switch Armed",
                `<div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">🔒 Your Dead Man's Switch is Armed</h2>
                    <p>Your secret has been encrypted and stored securely.</p>
                    <p><strong>Check-in delay:</strong> ${checkInDelay}</p>
                    <p>You will receive a check-in request after this period. If you don't respond within the grace period, your secret will be sent to your designated recipient.</p>
                    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 0; color: #991b1b;"><strong>Important:</strong> Save your check-in link in a safe place.</p>
                    </div>
                </div>`
            );
        });

        // Step 2: Sleep for the specified delay period
        console.log(`[Workflow] Sleeping for: ${checkInDelay}`);
        await step.sleep("wait cycle", checkInDelay as any);

        console.log(`[Workflow] Woke up - sending check-in request`);

        // Step 3: Send check-in request to user
        await step.do("send check-in request", async () => {
            await this.sendEmail(
                userEmail,
                "⏰ Dead Man's Switch - Check-in Required",
                `<div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">⏰ Time to Check In!</h2>
                    <p>This is your scheduled check-in request.</p>
                    <p>Click the button below to confirm you're okay and disarm the switch:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${checkInUrl}" 
                           style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                            ✅ I'm Here - Check In Now
                        </a>
                    </div>
                    <p style="color: #71717a; font-size: 14px;">
                        If you don't check in within the grace period (${gracePeriod || "24 hours"}), your secret will be sent to your designated recipient.
                    </p>
                    <p style="color: #71717a; font-size: 14px;">
                        Check-in link: <a href="${checkInUrl}">${checkInUrl}</a>
                    </p>
                </div>`
            );
        });

        // Step 4: Wait for user to check in (or timeout)
        console.log(`[Workflow] Waiting for check-in event (timeout: ${gracePeriod || "24 hours"})`);
        
        const checkInEvent = await step.waitForEvent("wait for user click", {
            type: "user_checked_in",
            timeout: this.parseDuration(gracePeriod || "24 hours"),
        });

        // Step 5: Process the result
        if (checkInEvent) {
            // User checked in successfully - DISARM
            console.log(`[Workflow] Check-in received - disarming switch`);
            
            await step.do("disarm switch", async () => {
                await this.sendEmail(
                    userEmail,
                    "✅ Dead Man's Switch Disarmed",
                    `<div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">✅ Check-in Confirmed!</h2>
                        <p>Your check-in was received successfully.</p>
                        <p>The Dead Man's Switch has been <strong>disarmed</strong> and your secret remains secure.</p>
                        <p style="color: #71717a; font-size: 14px; margin-top: 20px;">
                            This workflow is now complete. If you want to set up a new switch, please create a new one.
                        </p>
                    </div>`
                );
            });

            console.log(`[Workflow] Switch disarmed successfully`);

        } else {
            // Timeout - TRIGGER THE SWITCH
            console.log(`[Workflow] Timeout reached - triggering switch`);
            
            await step.do("release the secret", async () => {
                // FIXED: Using KV_BINDING instead of KV
                const encryptedSecret = await this.env.KV_BINDING.get(secretId);
                let secret = "Error: Secret not found";

                if (encryptedSecret) {
                    const encryptionKey = this.env.ENCRYPTION_SECRET;
                    
                    if (!encryptionKey) {
                        secret = "CRITICAL ERROR: Encryption key missing. Cannot decrypt secret.";
                        console.error("[Workflow] Encryption key missing for secretId:", secretId);
                    } else {
                        try {
                            // Decrypt the secret
                            secret = await decrypt(encryptedSecret, encryptionKey);
                            console.log(`[Workflow] Secret decrypted successfully`);
                        } catch (e) {
                            secret = "CRITICAL ERROR: Decryption failed. Data may be corrupted.";
                            console.error("[Workflow] Decryption failed for secretId:", secretId, e);
                        }
                    }
                } else {
                    console.error("[Workflow] No encrypted secret found for secretId:", secretId);
                }

                // Send secret to recipient
                console.log(`[Workflow] Sending secret to recipient: ${nextOfKinEmail}`);
                
                await this.sendEmail(
                    nextOfKinEmail,
                    "🔓 Dead Man's Switch Triggered",
                    `<div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #dc2626;">🔓 Dead Man's Switch Activated</h2>
                        <p>This message was automatically sent because the sender did not check in within the specified time period.</p>
                        <div style="background: #fef2f2; border: 2px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #991b1b;">Secret Message:</h3>
                            <p style="font-family: monospace; background: white; padding: 15px; border-radius: 4px; word-break: break-word;">
                                ${secret}
                            </p>
                        </div>
                        <p style="color: #71717a; font-size: 14px;">
                            This is an automated message from the Dead Man's Switch system.
                        </p>
                    </div>`
                );

                // Notify the original user as well (if possible)
                await this.sendEmail(
                    userEmail,
                    "⚠️ Dead Man's Switch Triggered",
                    `<div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #dc2626;">⚠️ Your Dead Man's Switch Was Triggered</h2>
                        <p>You did not check in within the grace period.</p>
                        <p>Your secret has been sent to: <strong>${nextOfKinEmail}</strong></p>
                    </div>`
                );

                console.log(`[Workflow] Secret sent successfully to ${nextOfKinEmail}`);
            });
        }

        console.log(`[Workflow] Workflow completed`);
    }

    /**
     * Parse duration string ( 
     */
    private parseDuration(duration: string): number {
        const units: { [key: string]: number } = {
            ms: 1,
            milliseconds: 1,
            s: 1000,
            seconds: 1000,
            m: 60 * 1000,
            minutes: 60 * 1000,
            h: 60 * 60 * 1000,
            hours: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
            days: 24 * 60 * 60 * 1000,
        };

        const match = duration.trim().match(/^(\d+)\s*(\w+)$/);
        if (!match) {
            console.warn(`[Workflow] Invalid duration format: ${duration}, defaulting to 24 hours`);
            return 24 * 60 * 60 * 1000;
        }

        const [, value, unit] = match;
        const multiplier = units[unit.toLowerCase()];

        if (!multiplier) {
            console.warn(`[Workflow] Unknown time unit: ${unit}, defaulting to 24 hours`);
            return 24 * 60 * 60 * 1000;
        }

        return parseInt(value) * multiplier;
    }

    /**
     * Send email using Resend API
     */
    async sendEmail(to: string, subject: string, body: string) {
        console.log(`[Email] Sending to: ${to}, Subject: ${subject}`);

        // If RESEND_API_KEY is configured 
        if (this.env.RESEND_API_KEY) {
            try {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.env.RESEND_API_KEY}`
                    },
                    body: JSON.stringify({
                        from: 'Dead Man Switch <alert@deadman.workerscando.com>',
                        to: to,
                        subject: subject,
                        html: body
                    })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`[Email] Failed to send via Resend to ${to}:`, errorText);
                    // Don't throw 
                    return false;
                } else {
                    const result = await res.json() as { id: string };
                    console.log(`[Email] Sent successfully to ${to}, ID:`, result.id);
                    return true;
                }
            } catch (e) {
                console.error(`[Email] Error sending to ${to}:`, e);
                // Don't throw  
                return false;
            }
        } else {
            console.warn(`[Email] RESEND_API_KEY not set. Would have sent to ${to}`);
            console.warn(`[Email] Subject: ${subject}`);
            console.warn(`[Email] Body: ${body.substring(0, 100)}...`);
            return true; // Treat as success for testing without API key
        }
    }
}