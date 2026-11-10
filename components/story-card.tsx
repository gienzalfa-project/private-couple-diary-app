import Link from "next/link"
import { MessageCircle, Send } from "lucide-react"
import { displayName, type Author } from "@/lib/auth"
import { moods } from "@/lib/moods"
import { ReactionBar } from "@/components/reaction-bar"
import { Clip, Sticker } from "@/components/sticker"
import { cn } from "@/lib/utils"

type Story = {
  id: string
  author: string
  body: string | null
  mood: string | null
  createdAt: Date
  media: Array<{ id: string; type: string; blobPath: string }>
  reactions: Array<{ author: string; reaction: string }>
  replyCount: number
}

const formatDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).formatToParts(date)
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  return `${pick("day")} ${pick("month")} ${pick("year")}`
}

export function StoryCard({ story, viewer, detail = false }: { story: Story; viewer: string; detail?: boolean }) {
  const name = displayName(story.author as Author)
  const mood = moods.find((item) => item.id === story.mood)
  const isFirst = story.author === "a"
  return (
    <article className={cn("note", isFirst ? "note-green" : "note-pink")}>
      <span aria-hidden="true" className={cn("absolute -right-2 top-20 -z-10 h-14 w-5 rounded-r-xl", isFirst ? "bg-[#ff9ccb]" : "bg-[#ffe27a]")} />
      <Clip />
      <Sticker name="star" className="absolute -right-3 -top-4 z-10 w-8 rotate-12" />
      <div className="mb-3 flex items-start gap-2 pl-1">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ffc94a] text-base font-semibold shadow-sm" aria-hidden="true">{name.slice(0, 1)}</span>
        <h2 className="mt-1.5 min-w-0 truncate text-base font-semibold">{name}</h2>
        <div className="ml-auto flex flex-col items-end gap-1 pt-1">
          <time dateTime={story.createdAt.toISOString()} className="text-[11px] font-medium uppercase tracking-wide">{formatDate(story.createdAt)}</time>
          {mood ? <span className="flex items-center gap-1 rounded-full bg-[#ffe69a] px-2 py-0.5 text-[11px] font-medium shadow-sm"><span aria-hidden="true">{mood.emoji}</span>{mood.label}</span> : null}
        </div>
        <Sticker name="cat-sit" className="mt-3 w-5 shrink-0" />
      </div>
      {story.media.length ? (
        <div className={cn("mb-3 grid gap-1.5 overflow-hidden rounded-2xl", story.media.length > 1 && "grid-cols-2")}>
          {story.media.map((media) => {
            const src = `/api/media?path=${encodeURIComponent(media.blobPath)}`
            return media.type === "video"
              ? <video key={media.id} controls playsInline preload="metadata" className="aspect-[4/3] size-full bg-black object-cover" src={src} />
              : <img key={media.id} className="aspect-[4/3] size-full object-cover" src={src} alt={`Photo shared by ${name}`} />
          })}
        </div>
      ) : null}
      {story.body ? <p className="mb-3 whitespace-pre-wrap text-[15px] leading-snug">{story.body}</p> : null}
      <ReactionBar storyId={story.id} viewer={viewer} initialReactions={story.reactions} />
      <div className="mt-3 flex items-center gap-3 text-sm font-medium">
        <span className="flex items-center gap-1"><MessageCircle className="size-4" aria-hidden="true" />{story.replyCount}<span className="sr-only"> replies</span></span>
      </div>
      {detail ? null : (
        <Link href={`/story/${story.id}`} className="mt-3 flex items-center justify-between border-b-2 border-black/30 pb-1.5 text-sm text-black/60">
          Write a reply…<Send className="size-4" aria-hidden="true" />
        </Link>
      )}
    </article>
  )
}
