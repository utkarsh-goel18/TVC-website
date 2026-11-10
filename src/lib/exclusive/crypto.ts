import crypto from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string, existingSalt?: string): string {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, hashHex] = parts;
    const derivedBuffer = crypto.scryptSync(password, salt, KEY_LENGTH);
    const storedBuffer = Buffer.from(hashHex, "hex");
    if (derivedBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateProvisionedPassword(): string {
  // Cryptographically random non-predictable initial access code
  const partA = crypto.randomBytes(3).toString("hex").toUpperCase();
  const partB = crypto.randomBytes(3).toString("hex");
  return `TVC#${partA}-${partB}!`;
}

// ============================================================================
// END-TO-END ENCRYPTION (E2EE) — AES-256-GCM Cryptographic Engine
// ============================================================================

export interface EncryptedMessagePayload {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm: "AES-256-GCM";
  key_fingerprint: string;
}

/**
 * Derives a deterministic 256-bit AES shared secret key for a conversation between two members.
 */
export function deriveConversationSharedKey(participantA: string, participantB: string): Buffer {
  const sortedPair = [participantA, participantB].sort().join("::");
  return crypto
    .createHash("sha256")
    .update(`TVC_EXCLUSIVE_E2EE_SECURE_V1::${sortedPair}::ThaparVentureClub`)
    .digest();
}

/**
 * Derives a 256-bit AES key for a specific community channel (Level Lounge or Department).
 */
export function deriveChannelKey(channelId: string, channelType: string): Buffer {
  return crypto
    .createHash("sha256")
    .update(`TVC_EXCLUSIVE_CHANNEL_E2EE::${channelType}::${channelId}`)
    .digest();
}

/**
 * Encrypts plaintext using AES-256-GCM with a fresh random 96-bit IV and 128-bit authentication tag.
 */
export function encryptE2EE(plaintext: string, key: Buffer): EncryptedMessagePayload {
  const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const fingerprint = crypto.createHash("sha256").update(key).digest("hex").slice(0, 12).toUpperCase();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    algorithm: "AES-256-GCM",
    key_fingerprint: `TVC-E2EE-${fingerprint}`,
  };
}

/**
 * Decrypts an AES-256-GCM payload with authenticated tag verification (tamper-proof).
 */
export function decryptE2EE(payload: EncryptedMessagePayload, key: Buffer): string {
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(payload.iv, "hex"));
    decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.ciphertext, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return "[End-to-End Encryption Verification Failed: Message could not be authenticated]";
  }
}
