import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { stories, storyMedia } from "@/lib/db/schema"
import { notifyPartner } from "@/lib/notifications"

const textSchema = z.string().trim().max(4000)
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"])
const allowedVideos = new Set(["video/mp4", "video/webm", "video/quicktime"])

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const form = await request.formData()
    const body = textSchema.parse(form.get("body") || "")
    const mood = z.enum(["happy", "sad", "laugh", "lol", "angry"]).optional().parse(String(form.get("mood") || "") || undefined)
    const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0)
    if (!body && files.length === 0) return NextResponse.json({ error: "Add a note or a photo or video." }, { status: 400 })
    if (files.length > 4) return NextResponse.json({ error: "Choose up to 4 files." }, { status: 400 })

    const durations = form.getAll("durations").map(Number)
    for (const [index, file] of files.entries()) {
      const image = allowedImages.has(file.type)
      const video = allowedVideos.has(file.type)
      if (!image && !video) return NextResponse.json({ error: `${file.name} is not a supported file.` }, { status: 400 })
      if (file.size > (video ? 50 : 10) * 1024 * 1024) return NextResponse.json({ error: `${file.name} is too large.` }, { status: 400 })
      if (video && (!Number.isFinite(durations[index]) || durations[index] > 20)) return NextResponse.json({ error: `${file.name} must be 20 seconds or shorter.` }, { status: 400 })
    }

    const [story] = await db.insert(stories).values({ author: session.author, body, mood }).returning({ id: stories.id })
    await Promise.all(files.map(async (file, position) => {
      const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin"
      const path = `stories/${story.id}/${crypto.randomUUID()}.${extension}`
      const blob = await put(path, file, { access: "private", addRandomSuffix: false })
      await db.insert(storyMedia).values({ storyId: story.id, type: file.type.startsWith("video/") ? "video" : "image", blobPath: blob.pathname, durationSeconds: file.type.startsWith("video/") ? Math.ceil(durations[position]) : null, position })
    }))
    await notifyPartner(session.author, story.id)
    return NextResponse.json({ id: story.id })
  } catch (error) {
    console.error("Story save failed:", error)
    return NextResponse.json({ error: "We couldn’t save that story. Please try again." }, { status: 500 })
  }
}
