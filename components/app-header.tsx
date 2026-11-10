import Link from "next/link"
import { Wordmark } from "@/components/sticker"
import { cn } from "@/lib/utils"

type Session = { author: string; name: string }

export function AppHeader({ session, active, back = false }: { session: Session; active?: "latest" | "calendar" | "new" | "settings"; back?: boolean }) {
  return (
    <header className="px-4 pb-3 pt-5">
      <div className="flex items-center justify-center gap-3">
        <Link href="/" aria-label="yap yap! home"><Wordmark className="text-6xl" /></Link>
      </div>
      {back ? null : (
        <div className="mt-4 flex items-center gap-3">
          <Link href="/settings" aria-label={`${session.name}, settings and sign out`} className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#17171a]", active === "settings" && "ring-2 ring-[#ffd84d]")}>
            {session.name.slice(0, 1).toUpperCase()}
          </Link>
          <span className="h-5 w-px bg-white/30" aria-hidden="true" />
          <nav aria-label="Main" className="flex items-center gap-4 text-[13px] font-medium">
            {([["latest", "Latest", "/"], ["calendar", "Calendar", "/calendar"]] as const).map(([id, label, href]) => (
              <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={cn("border-b-2 pb-0.5", active === id ? "border-[#ffd84d] text-white" : "border-transparent text-white/70")}>{label}</Link>
            ))}
          </nav>
          <Link href="/new" className="ml-auto rounded-full bg-[#2f7cf6] px-3.5 py-1.5 text-xs font-semibold text-white">+ New</Link>
        </div>
      )}
    </header>
  )
}
