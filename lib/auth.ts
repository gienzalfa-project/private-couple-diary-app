import "server-only"

import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import { and, eq, gt } from "drizzle-orm"
import { cookies, headers } from "next/headers"
import { db } from "@/lib/db"
import { loginAttempts, sessions } from "@/lib/db/schema"

export type Author = "a" | "b"
const COOKIE_NAME = "story_session"
const SESSION_DAYS = 30

function hash(value: string) {
  return createHash("sha256").update(`${process.env.SESSION_SECRET}:${value}`).digest("hex")
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function displayName(author: Author) {
  return author === "a" ? process.env.PERSON_A_NAME || "Person A" : process.env.PERSON_B_NAME || "Person B"
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  const [session] = await db.select().from(sessions).where(and(eq(sessions.tokenHash, hash(token)), gt(sessions.expiresAt, new Date()))).limit(1)
  return session ? { author: session.author as Author, name: displayName(session.author as Author) } : null
}

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  return session
}

export async function createSession(author: Author) {
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000)
  await db.insert(sessions).values({ tokenHash: hash(token), author, expiresAt })
  ;(await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/", expires: expiresAt })
}

export async function destroySession() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hash(token)))
  store.delete(COOKIE_NAME)
}

export async function verifyCredentials(name: string, password: string) {
  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  const key = hash(ip)
  const [limit] = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1)
  if (limit?.blockedUntil && limit.blockedUntil > new Date()) return null

  const candidates: Array<{ author: Author; name: string; password: string }> = [
    { author: "a", name: process.env.PERSON_A_NAME || "", password: process.env.PERSON_A_PASSWORD || "" },
    { author: "b", name: process.env.PERSON_B_NAME || "", password: process.env.PERSON_B_PASSWORD || "" },
  ]
  const author = candidates.find((candidate) => safeEqual(name.trim().toLocaleLowerCase(), candidate.name.trim().toLocaleLowerCase()) && safeEqual(password, candidate.password))?.author ?? null
  if (author) {
    await db.delete(loginAttempts).where(eq(loginAttempts.key, key))
    return author
  }

  const attempts = (limit?.attempts ?? 0) + 1
  const blockedUntil = attempts >= 8 ? new Date(Date.now() + 15 * 60_000) : null
  if (limit) await db.update(loginAttempts).set({ attempts, blockedUntil, updatedAt: new Date() }).where(eq(loginAttempts.key, key))
  else await db.insert(loginAttempts).values({ key, attempts, blockedUntil })
  return null
}
