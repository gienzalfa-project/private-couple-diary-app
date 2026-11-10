"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { replies } from "@/lib/db/schema"

export async function deleteReply(storyId: string, replyId: string) {
  const session = await getSession()
  if (!session) redirect("/login")
  const [reply] = await db.select().from(replies).where(eq(replies.id, replyId)).limit(1)
  if (!reply || reply.storyId !== storyId) return
  if ((reply.author as string) !== (session.author as string)) return
  await db.delete(replies).where(eq(replies.id, replyId))
  revalidatePath(`/story/${storyId}`)
  revalidatePath("/")
  revalidatePath("/calendar")
}
