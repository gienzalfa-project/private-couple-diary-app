"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { reactions, replies, stories, storyMedia } from "@/lib/db/schema"

export async function deleteStory(id: string) {
  const session = await getSession()
  if (!session) redirect("/login")
  const [story] = await db.select().from(stories).where(eq(stories.id, id)).limit(1)
  if (!story) redirect("/")
  if ((story.author as string) !== (session.author as string)) redirect(`/story/${id}`)
  await db.delete(reactions).where(eq(reactions.storyId, id))
  await db.delete(replies).where(eq(replies.storyId, id))
  await db.delete(storyMedia).where(eq(storyMedia.storyId, id))
  await db.delete(stories).where(eq(stories.id, id))
  revalidatePath("/")
  revalidatePath("/calendar")
  redirect("/")
}
