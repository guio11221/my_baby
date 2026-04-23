import "server-only";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session";

async function getCookieJar() {
  // Next versions differ: cookies() can be sync or async.
  return await Promise.resolve(cookies());
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function signToken(raw: string): string {
  // HMAC is only used to make it harder to forge random tokens in the cookie.
  // Actual validity is checked in DB (session record + expiry).
  const secret = requireEnv("SESSION_SECRET");
  const mac = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return `${raw}.${mac}`;
}

function verifySignedToken(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx <= 0) return null;
  const raw = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const secret = requireEnv("SESSION_SECRET");
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return raw;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<void> {
  const raw = crypto.randomBytes(32).toString("hex");
  const token = signToken(raw);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  await prisma.session.create({
    data: {
      token: raw,
      userId,
      expiresAt,
    },
  });

  const jar = await getCookieJar();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await getCookieJar();
  const signed = jar.get(SESSION_COOKIE)?.value;
  if (signed) {
    const raw = verifySignedToken(signed);
    if (raw) {
      await prisma.session.deleteMany({ where: { token: raw } });
    }
  }

  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const jar = await getCookieJar();
  const signed = jar.get(SESSION_COOKIE)?.value;
  if (!signed) return null;

  const raw = verifySignedToken(signed);
  if (!raw) {
    jar.delete(SESSION_COOKIE);
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: raw },
    include: { user: true },
  });

  if (!session) {
    jar.delete(SESSION_COOKIE);
    return null;
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.deleteMany({ where: { token: raw } });
    jar.delete(SESSION_COOKIE);
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
