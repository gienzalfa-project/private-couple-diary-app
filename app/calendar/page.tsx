import Link from "next/link"
import { redirect } from "next/navigation"
import { displayName, getSession, type Author } from "@/lib/auth"
import { getStories } from "@/lib/stories"
import { AppHeader } from "@/components/app-header"
import { Clip } from "@/components/sticker"
import { StoryCalendar } from "@/components/story-calendar"

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" })
const dateKey = (date: Date) => dayFormat.format(date)
const pretty = (key: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${key}T12:00:00Z`))

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")
  const { date: picked } = await searchParams
  const selected = picked && /^\d{4}-\d{2}-\d{2}$/.test(picked) ? picked : null
  const stories = await getStories()
  const allGroups = Object.entries(Object.groupBy(stories, (story) => dateKey(story.createdAt)))
  const groups = selected ? allGroups.filter(([date]) => date === selected) : allGroups
  return (
    <>
      <AppHeader session={session} active="calendar" />
      <main className="px-4 pb-16 pt-6">
        <StoryCalendar storyDates={stories.map((story) => dateKey(story.createdAt))} selected={selected} />
        {selected && (
          <div className="mt-6 flex items-center justify-between px-1 text-sm">
            <span className="font-medium">Showing {pretty(selected)}</span>
            <Link href="/calendar" scroll={false} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">Show all</Link>
          </div>
        )}
        <div className="mt-6 flex flex-col gap-7">
          {selected && groups.length === 0 && (
            <section className="note note-pink">
              <Clip />
              <h2 className="mb-1 font-script text-4xl leading-none">{pretty(selected)}</h2>
              <p className="text-sm">No moments on this day.</p>
            </section>
          )}
          {groups.map(([date, items = []]) => (
            <section key={date} id={`day-${date}`} className="note note-pink scroll-mt-4">
              <Clip />
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-script text-4xl leading-none">{pretty(date)}</h2>
                <span className="text-[11px] font-medium uppercase tracking-wide">{items.length} {items.length === 1 ? "moment" : "moments"}</span>
              </div>
              <ul className="flex flex-col gap-3">
                {items.map((story) => {
                  const media = story.media[0]
                  const src = media ? `/api/media?path=${encodeURIComponent(media.blobPath)}` : null
                  return (
                    <li key={story.id}>
                      <Link href={`/story/${story.id}`} className="flex items-center gap-3">
                        {src ? (media.type === "video"
                          ? <video src={src} muted preload="metadata" className="h-12 w-[72px] shrink-0 rounded-lg bg-black object-cover" />
                          : <img src={src} alt="" className="h-12 w-[72px] shrink-0 rounded-lg object-cover" />) : <span className="h-12 w-[72px] shrink-0 rounded-lg bg-white/50" aria-hidden="true" />}
                        <span className="min-w-0 text-[13px] leading-tight">
                          <span className="block font-bold">{displayName(story.author as Author)}</span>
                          <span className="line-clamp-2">{story.body || "Shared a moment"}</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
