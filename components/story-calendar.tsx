"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Sticker } from "@/components/sticker"
import { cn } from "@/lib/utils"

const dateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function BinderRing({ className }: { className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={cn("absolute top-[46px] z-10 h-3.5 w-6 -translate-x-1/2 rounded-full bg-[#0b1224] shadow-[inset_0_3px_4px_rgba(0,0,0,.95),0_1px_0_rgba(255,255,255,.5)]", className)} />
      <svg aria-hidden="true" viewBox="0 0 20 70" className={cn("pointer-events-none absolute -top-[16px] z-20 h-[70px] w-5 -translate-x-1/2 overflow-visible drop-shadow-[0_3px_3px_rgba(0,0,0,.5)]", className)}>
        <defs>
          <linearGradient id="ring-metal" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#8e9199" />
            <stop offset=".35" stopColor="#f7f8fa" />
            <stop offset=".65" stopColor="#b4b7bf" />
            <stop offset="1" stopColor="#6c6f77" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="14" height="62" rx="7" fill="none" stroke="#4d5056" strokeWidth="5.6" />
        <rect x="3" y="3" width="14" height="62" rx="7" fill="none" stroke="url(#ring-metal)" strokeWidth="4" />
        <path d="M3.5 12 V52" stroke="#ffffff" strokeOpacity=".8" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </>
  )
}

export function StoryCalendar({ storyDates }: { storyDates: string[] }) {
  const initial = storyDates[0] ? new Date(`${storyDates[0]}T12:00:00`) : new Date()
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [today, setToday] = useState("")
  useEffect(() => {
    const now = new Date()
    setToday(dateKey(now.getFullYear(), now.getMonth(), now.getDate()))
  }, [])
  const dates = useMemo(() => new Set(storyDates), [storyDates])
  const first = month.getDay()
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((first + total) / 7) * 7 }, (_, i) => {
    const day = i - first + 1
    return day > 0 && day <= total ? day : null
  })
  const shift = (offset: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1))

  return (
    <section aria-labelledby="calendar-title" className="relative rounded-[24px] bg-[#4f90f5] px-2 pb-3 pt-10 shadow-[0_16px_32px_-14px_rgba(0,0,0,.7)]">
      <BinderRing className="left-[28%]" />
      <BinderRing className="left-[72%]" />
      <Sticker name="cat-peek" className="absolute -right-1 -top-9 w-16" />
      <div aria-hidden="true" className="absolute inset-x-4 bottom-1 h-6 rounded-b-[20px] bg-[#e7cb80]" />
      <div className="note note-yellow" style={{ paddingTop: 34 }}>
        <div className="mb-2 flex items-center justify-between">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="flex size-9 items-center justify-center"><ChevronLeft className="size-5" /></button>
          <h2 id="calendar-title" className="whitespace-nowrap font-script text-[34px] leading-none">{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month)}</h2>
          <button type="button" onClick={() => shift(1)} aria-label="Next month" className="flex size-9 items-center justify-center"><ChevronRight className="size-5" /></button>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] font-medium">
          {weekdays.map((day) => <span key={day} className="py-1">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, index) => {
            if (!day) return <span key={`blank-${index}`} />
            const date = dateKey(month.getFullYear(), month.getMonth(), day)
            const has = dates.has(date)
            const isToday = date === today
            const content = (
              <>
                <span className={cn("flex size-7 items-center justify-center rounded-full text-[13px]", isToday && "bg-[#ff5fa2] font-bold text-white")}>{day}</span>
                <span className={cn("mt-0.5 size-1 rounded-full", has ? "bg-black" : "bg-transparent")} aria-hidden="true" />
              </>
            )
            return has
              ? <a key={date} href={`#day-${date}`} aria-label={`${day}, has moments`} className="flex flex-col items-center py-0.5">{content}</a>
              : <span key={date} className="flex flex-col items-center py-0.5">{content}</span>
          })}
        </div>
        <Sticker name="star" className="absolute -bottom-3 -right-2 w-7" />
      </div>
    </section>
  )
}
