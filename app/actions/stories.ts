"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { reactions, replies } from "@/lib/db/schema"

const reactionSchema = z.enum(["angry", "happy", "sad", "love", "lol", "poop"])

export async function toggleReaction(storyId: string, value: string) {
  const session = await requireSession()
  const reaction = reactionSchema.parse(value)
  const condition = and(eq(reactions.storyId, storyId), eq(reactions.author, session.author), eq(reactions.reaction, reaction))
  const [existing] = await db.select({ id: reactions.id }).from(reactions).where(condition).limit(1)
  if (existing) await db.delete(reactions).where(eq(reactions.id, existing.id))
  else await db.insert(reactions).values({ storyId, author: session.author, reaction })
  revalidatePath(`/story/${storyId}`)
  revalidatePath("/")
}

export async function addReply(storyId: string, formData: FormData) {
  const session = await requireSession()
  const body = z.string().trim().min(1).max(1000).parse(formData.get("body"))
  await db.insert(replies).values({ storyId, author: session.author, body })
  revalidatePath(`/story/${storyId}`)
  revalidatePath("/")
}
