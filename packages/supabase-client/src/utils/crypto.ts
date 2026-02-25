// packages/supabase-client/src/utils/crypto.ts
import { Buffer } from 'buffer';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha1 } from '@noble/hashes/legacy.js';

export function base64UrlEncode(buffer: Buffer | Uint8Array): string {
  const b = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  return b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding === 2) base64 += '==';
  else if (padding === 3) base64 += '=';
  return Buffer.from(base64, 'base64');
}

// HMAC primitives (pure JS; v2 import paths with .js) [page:17]
export function hmacSha1(key: Uint8Array, msg: Uint8Array): Uint8Array {
  return hmac(sha1, key, msg);
}

export function hmacSha256Bytes(key: Uint8Array, msg: Uint8Array): Uint8Array {
  return hmac(sha256, key, msg);
}

// Back-compat helper (keeps your existing signature returning Buffer)
export function hmacSha256(data: string | Buffer, secret: string): Buffer {
  const msg = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  const key = Buffer.from(secret, 'utf8');
  return Buffer.from(hmacSha256Bytes(key, msg));
}

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
