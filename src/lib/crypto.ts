// lib/crypto.ts
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = process.env
  .COOKIE_ENCRYPTION_KEY!.padEnd(32, "0")
  .slice(0, 32); // Ensures 32-byte key

const iv = crypto.randomBytes(16);

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(encryptedText: string) {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
