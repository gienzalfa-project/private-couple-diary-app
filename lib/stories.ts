import "server-only"

import { asc, desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { reactions, replies, stories, storyMedia } from "@/lib/db/schema"

export async function getStories() {
  const rows = await db.select().from(stories).orderBy(desc(stories.createdAt))
  return Promise.all(rows.map(async (story) => {
    const media = await db.select().from(storyMedia).where(eq(storyMedia.storyId, story.id)).orderBy(asc(storyMedia.position))
    const storyReactions = await db.select().from(reactions).where(eq(reactions.storyId, story.id)).orderBy(asc(reactions.createdAt))
    const [replyCount] = await db.select({ count: sql<number>`count(*)::int` }).from(replies).where(eq(replies.storyId, story.id))
    return { ...story, media, reactions: storyReactions, reactionCount: storyReactions.length, replyCount: replyCount.count }
  }))
}

export async function getStory(id: string) {
  const [story] = await db.select().from(stories).where(eq(stories.id, id)).limit(1)
  if (!story) return null
  const media = await db.select().from(storyMedia).where(eq(storyMedia.storyId, id)).orderBy(asc(storyMedia.position))
  const storyReactions = await db.select().from(reactions).where(eq(reactions.storyId, id)).orderBy(asc(reactions.createdAt))
  const storyReplies = await db.select().from(replies).where(eq(replies.storyId, id)).orderBy(asc(replies.createdAt))
  return { ...story, media, reactions: storyReactions, replies: storyReplies }
}
