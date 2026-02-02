import { Buffer } from 'node:buffer';

/**
 * Encrypt text using AES-GCM encryption
 * @param text - The plaintext to encrypt
 * @param secretKey - The encryption key (will be hashed to ensure proper length)
 * @returns Encrypted text in format "iv:ciphertext" (both hex encoded)
 */
export async function encrypt(text: string, secretKey: string): Promise<string> {
    try {
        // Import the encryption key
        const key = await importKey(secretKey);
        
        // Generate random IV (12 bytes for GCM)
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Encode the plaintext
        const encoded = new TextEncoder().encode(text);
        
        // Encrypt
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv }, 
            key, 
            encoded
        );

        // Convert to hex for storage
        const ivHex = Buffer.from(iv).toString('hex');
        const cipherHex = Buffer.from(ciphertext).toString('hex');
        
        // Return in format "iv:ciphertext"
        return `${ivHex}:${cipherHex}`;
    } catch (e) {
        console.error('[Crypto] Encryption failed:', e);
        throw new Error(`Encryption failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
}

/**
 * Decrypt text using AES-GCM decryption
 * @param encryptedText - The encrypted text in format "iv:ciphertext"
 * @param secretKey - The encryption key used for encryption
 * @returns Decrypted plaintext
 */
export async function decrypt(encryptedText: string, secretKey: string): Promise<string> {
    try {
        // Split the encrypted text into IV and ciphertext
        const [ivHex, cipherHex] = encryptedText.split(':');
        
        if (!ivHex || !cipherHex) {
            throw new Error("Invalid encrypted format - expected 'iv:ciphertext'");
        }

        // Convert from hex back to bytes
        const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
        const ciphertext = new Uint8Array(Buffer.from(cipherHex, 'hex'));
        
        // Import the encryption key
        const key = await importKey(secretKey);

        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv }, 
            key, 
            ciphertext
        );
        
        // Decode and return
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error('[Crypto] Decryption failed:', e);
        throw new Error(`Decryption failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
}

/**
 * Import a key for AES-GCM encryption/decryption
 * Hashes the secret key to ensure it's exactly 256 bits
 * @param secretKey - The secret key string
 * @returns CryptoKey for use with Web Crypto API
 */
async function importKey(secretKey: string): Promise<CryptoKey> {
    try {
        // Encode the secret key
        const enc = new TextEncoder();
        const encoded = enc.encode(secretKey);
        
        // Hash to ensure it's 256-bit (SHA-256)
        const keyData = await crypto.subtle.digest('SHA-256', encoded);
        
        // Import as AES-GCM key
        return await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    } catch (e) {
        console.error('[Crypto] Key import failed:', e);
        throw new Error(`Key import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
}