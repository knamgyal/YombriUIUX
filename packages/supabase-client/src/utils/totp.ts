import { createHmac } from 'crypto';

export function generateTotpCode(
  secret: string,
  time: Date = new Date(),
  stepSeconds: number = 30,
  digits: number = 6,
  windowOffset: number = 0
): number {
  const counter = Math.floor(time.getTime() / 1000 / stepSeconds) + windowOffset;

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const secretBuffer = Buffer.from(secret, 'hex');

  const hmac = createHmac('sha1', secretBuffer);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;

  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);

  return otp;
}

export function validateTotpCode(
  secret: string,
  code: number,
  time: Date = new Date(),
  windowCount: number = 2
): boolean {
  for (let i = 0; i < windowCount; i++) {
    const expectedCode = generateTotpCode(secret, time, 30, 6, i);
    if (expectedCode === code) {
      return true;
    }
  }
  return false;
}
