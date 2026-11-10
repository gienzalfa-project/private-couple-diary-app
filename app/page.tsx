import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getStories } from "@/lib/stories"
import { AppHeader } from "@/components/app-header"
import { Clip, Sticker } from "@/components/sticker"
import { StoryCard } from "@/components/story-card"
import { cn } from "@/lib/utils"

const filters = [["all", "All"], ["a", "Gienzalfa"], ["b", "Raehan"]] as const

export default async function HomePage({ searchParams }: { searchParams: Promise<{ person?: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")
  const all = await getStories()
  const { person } = await searchParams
  const current = person === "a" || person === "b" ? person : "all"
  const stories = current === "all" ? all : all.filter((story) => story.author === current)
  return (
    <>
      <AppHeader session={session} active="latest" />
      <main className="px-4 pb-16 pt-1">
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium" aria-label="Filter moments">
          {filters.map(([id, label], index) => (
            <span key={id} className="flex items-center gap-2">
              {index ? <span className="text-white/40" aria-hidden="true">/</span> : null}
              <Link href={id === "all" ? "/" : `/?person=${id}`} aria-current={current === id ? "page" : undefined} className={cn("rounded-full px-3 py-1", current === id ? "bg-white font-bold text-[#17171a]" : "text-white/80")}>{label}</Link>
            </span>
          ))}
          <Sticker name="star" className="ml-auto w-5 opacity-80" />
        </nav>
        {stories.length ? (
          <div className="flex flex-col gap-8">{stories.map((story) => <StoryCard key={story.id} story={story} viewer={session.author} />)}</div>
        ) : all.length === 0 ? (
          <section className="note note-blue px-6 py-8 text-center">
            <Clip />
            <Sticker name="cat-peek" className="mx-auto mb-2 w-20" />
            <h2 className="font-script text-5xl">Your first yap?</h2>
            <p className="mt-2 text-sm">A photo, a video, or whatever’s on your mind.</p>
            <Link href="/new" className="mt-5 inline-flex h-11 items-center rounded-full bg-[#202022] px-6 text-sm font-semibold text-white">+ New moment</Link>
          </section>
        ) : (
          <section className="note note-blue px-6 py-8 text-center">
            <Clip />
            <Sticker name="cat-peek" className="mx-auto mb-2 w-20" />
            <h2 className="font-script text-5xl">No yaps here yet.</h2>
          </section>
        )}
      </main>
    </>
  )
}
