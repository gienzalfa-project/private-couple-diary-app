import { and, eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { reactions } from "@/lib/db/schema"

const allowedReactions = ["angry", "happy", "sad", "love", "lol", "poop"]

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: storyId } = await context.params
  const body = await request.json().catch(() => null)
  const reaction = typeof body?.reaction === "string" ? body.reaction : ""
  if (!allowedReactions.includes(reaction)) return NextResponse.json({ error: "Invalid reaction" }, { status: 400 })

  const existing = await db.select({ id: reactions.id }).from(reactions).where(and(eq(reactions.storyId, storyId), eq(reactions.author, session.author), eq(reactions.reaction, reaction))).limit(1)
  if (existing[0]) {
    await db.delete(reactions).where(eq(reactions.id, existing[0].id))
  } else {
    await db.insert(reactions).values({ storyId, author: session.author, reaction })
  }

  const updated = await db.select({ author: reactions.author, reaction: reactions.reaction }).from(reactions).where(eq(reactions.storyId, storyId))
  return NextResponse.json({ reactions: updated })
}
