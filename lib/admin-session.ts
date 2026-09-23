import { createHmac, timingSafeEqual } from "crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET!;

export function createAdminSession(username: string) {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

  const payload = `${username}.${expiresAt}`;

  const signature = createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function verifyAdminSession(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const [username, expiresAt, signature] = parts;

    if (!username || !expiresAt || !signature) {
      return false;
    }

    if (Date.now() > Number(expiresAt)) {
      return false;
    }

    const payload = `${username}.${expiresAt}`;

    const expectedSignature = createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");

    const actual = Buffer.from(signature, "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");

    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}