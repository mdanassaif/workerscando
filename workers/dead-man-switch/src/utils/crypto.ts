import { Buffer } from 'node:buffer';

export async function encrypt(text: string, secretKey: string): Promise<string> {
    const key = await importKey(secretKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

    // Convert to hex for storage
    const ivHex = Buffer.from(iv).toString('hex');
    const cipherHex = Buffer.from(ciphertext).toString('hex');
    return `${ivHex}:${cipherHex}`;
}

export async function decrypt(encryptedText: string, secretKey: string): Promise<string> {
    const [ivHex, cipherHex] = encryptedText.split(':');
    if (!ivHex || !cipherHex) throw new Error("Invalid encrypted format");

    const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
    const ciphertext = new Uint8Array(Buffer.from(cipherHex, 'hex'));
    const key = await importKey(secretKey);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
}

async function importKey(secretKey: string) {
    // Hash the string to ensure it's 256-bit
    const enc = new TextEncoder();
    const keyData = await crypto.subtle.digest('SHA-256', enc.encode(secretKey));
    return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
