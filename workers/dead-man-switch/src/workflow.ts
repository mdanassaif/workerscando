import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { decrypt } from './utils/crypto';

interface Env {
    KV: KVNamespace;
    ENCRYPTION_SECRET?: string;
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

        // Step 1: Confirm the switch is armed
        await step.do("notify user armed", async () => {
            await this.sendEmail(userEmail, "Switch Armed. We will wait " + checkInDelay);
        });

        // Step 2: The Long Sleep
        // We stick to the user's logic: single check.

        await step.sleep("wait cycle", checkInDelay as any);

        // Step 3: check-in request
        await step.do("send check-in request", async () => {
            await this.sendEmail(userEmail, `Are you there? Click link to reset timer: <a href="${checkInUrl}">${checkInUrl}</a>`);
        });

        // Step 4: Wait for user click (Webhook)
        const checkInEvent = await step.waitForEvent("wait for user click", {
            type: "user_checked_in",
            timeout: gracePeriod || "24 hours",
        });

        // Step 5: Branching
        if (checkInEvent) {
            // User checked in
            await step.do("disarm switch", async () => {
                await this.sendEmail(userEmail, "Check-in confirmed. Switch disarmed.");
            });
        } else {
            // Timeout (Dead Man Switch Triggered)
            await step.do("release the secret", async () => {
                const encryptedSecret = await this.env.KV.get(secretId);
                let secret = "Error: Secret not found";

                if (encryptedSecret) {
                    const encryptionKey = this.env.ENCRYPTION_SECRET;
                    if (!encryptionKey) {
                        secret = "CRITICAL ERROR: Encryption key missing. Cannot decrypt secret.";
                    } else {
                        try {
                            // Decrypt immediately before sending
                            secret = await decrypt(encryptedSecret, encryptionKey);
                        } catch (e) {
                            secret = "CRITICAL ERROR: Decryption failed. Data may be corrupted.";
                        }
                    }
                }

                await this.sendEmail(
                    nextOfKinEmail,
                    `The switch was triggered. Here is the secret: ${secret}`
                );
            });
        }
    }

    async sendEmail(to: string, body: string) {
        console.log(`[Email Service] Sending email to: ${to}`);

        // If RESEND_API_KEY is configured, send real email.
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
                        subject: 'Dead Man Switch Notification',
                        html: `<p>${body}</p>`
                    })
                });

                if (!res.ok) {
                    console.error("Failed to send email via Resend", await res.text());
                }
            } catch (e) {
                console.error("Error sending email:", e);
            }
        }
    }
}
