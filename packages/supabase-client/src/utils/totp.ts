// packages/supabase-client/src/utils/totp.ts
import { base32 } from '@scure/base';
import { hmacSha1 } from './crypto';

export type TotpOptions = {
  stepSeconds?: number;
  digits?: number;
  timestampMs?: number;
};

export function generateTotp(secretBase32: string, opts: TotpOptions = {}): string {
  const stepSeconds = opts.stepSeconds ?? 30;
  const digits = opts.digits ?? 6;
  const timestampMs = opts.timestampMs ?? Date.now();
  const counter = Math.floor(timestampMs / 1000 / stepSeconds);

  const msg = new Uint8Array(8);
  let x = counter;
  for (let i = 7; i >= 0; i--) {
    msg[i] = x & 0xff;
    x = Math.floor(x / 256);
  }

  const key = base32.decode(secretBase32.replace(/=+$/g, '').toUpperCase());
  const digest = hmacSha1(key, msg);

  const offset = digest[digest.length - 1] & 0x0f;
  const binCode =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const mod = 10 ** digits;
  return (binCode % mod).toString().padStart(digits, '0');
}

export function verifyTotp(
  secretBase32: string,
  code: string,
  opts: TotpOptions & { window?: number } = {}
): boolean {
  const window = opts.window ?? 1;
  const now = opts.timestampMs ?? Date.now();
  const stepMs = (opts.stepSeconds ?? 30) * 1000;

  for (let w = -window; w <= window; w++) {
    const candidate = generateTotp(secretBase32, { ...opts, timestampMs: now + w * stepMs });
    if (candidate === code) return true;
  }
  return false;
}
