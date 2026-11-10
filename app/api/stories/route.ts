import { NextResponse } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { stories, storyMedia } from "@/lib/db/schema"
import { notifyPartner } from "@/lib/notifications"

const schema = z.object({
  body: z.string().trim().max(4000).default(""),
  mood: z.enum(["happy", "sad", "laugh", "lol", "angry"]).optional(),
  media: z
    .array(
      z.object({
        pathname: z.string().regex(/^stories\/[A-Za-z0-9-]+\.[A-Za-z0-9]{1,5}$/),
        type: z.enum(["image", "video"]),
        duration: z.number().min(0).max(60),
      }),
    )
    .max(4)
    .default([]),
})

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: "Something in this moment doesn’t look right." }, { status: 400 })
    const { body, mood, media } = parsed.data
    if (!body && media.length === 0) return NextResponse.json({ error: "Add a note or a photo or video." }, { status: 400 })

    const [story] = await db.insert(stories).values({ author: session.author, body, mood }).returning({ id: stories.id })
    if (media.length) {
      await db.insert(storyMedia).values(
        media.map((item, position) => ({
          storyId: story.id,
          type: item.type,
          blobPath: item.pathname,
          durationSeconds: item.type === "video" ? Math.ceil(item.duration) : null,
          position,
        })),
      )
    }
    await notifyPartner(session.author, story.id)
    return NextResponse.json({ id: story.id })
  } catch (error) {
    console.error("Story save failed:", error)
    return NextResponse.json({ error: "We couldn’t save that story. Please try again." }, { status: 500 })
  }
}
