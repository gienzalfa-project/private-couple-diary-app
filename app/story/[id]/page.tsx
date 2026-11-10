import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { addReply } from "@/app/actions/stories"
import { deleteStory } from "@/app/actions/delete-story"
import { deleteReply } from "@/app/actions/delete-reply"
import { displayName, getSession, type Author } from "@/lib/auth"
import { getStory } from "@/lib/stories"
import { AppHeader } from "@/components/app-header"
import { Clip } from "@/components/sticker"
import { StoryCard } from "@/components/story-card"
import { DeleteStoryButton } from "@/components/delete-story-button"

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")
  const { id } = await params
  const story = await getStory(id)
  if (!story) notFound()
  const mine = (story.author as string) === (session.author as string)
  return (
    <>
      <AppHeader session={session} back />
      <main className="flex flex-col gap-7 px-4 pb-16 pt-2">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to moments" className="flex size-9 items-center justify-center"><ArrowLeft className="size-5" /></Link>
          <h1 className="text-lg font-medium">Moment</h1>
        </div>
        <div className="relative">
          <StoryCard story={{ ...story, replyCount: story.replies.length }} viewer={session.author} detail />
          {mine && (
            <div className="absolute bottom-3 right-3.5 z-10">
              <DeleteStoryButton action={deleteStory.bind(null, id)} />
            </div>
          )}
        </div>
        <section className="note note-blue" aria-labelledby="replies-title">
          <Clip />
          <h2 id="replies-title" className="mb-3 font-script text-4xl leading-none">Replies</h2>
          <ul className="mb-4 flex flex-col gap-3">
            {story.replies.length ? story.replies.map((reply) => (
              <li key={reply.id} className="rounded-2xl bg-white/70 px-3 py-2 text-sm">
                <span className="block text-xs font-bold">{displayName(reply.author as Author)}</span>
                <span className="whitespace-pre-wrap">{reply.body}</span>
                {(reply.author as string) === (session.author as string) && (
                  <div className="mt-1 flex justify-end">
                    <DeleteStoryButton compact label="Delete comment" question="Delete this comment?" action={deleteReply.bind(null, id, reply.id)} />
                  </div>
                )}
              </li>
            )) : <li className="text-sm">No replies yet.</li>}
          </ul>
          <form action={addReply.bind(null, id)} className="flex items-center gap-2 border-b border-black/50 pb-1">
            <label htmlFor="body" className="sr-only">Write a reply</label>
            <input id="body" name="body" maxLength={1000} required autoComplete="off" placeholder="Write a reply…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/60" />
            <button type="submit" aria-label="Send reply" className="flex size-9 items-center justify-center"><Send className="size-4" /></button>
          </form>
        </section>
      </main>
    </>
  )
}
