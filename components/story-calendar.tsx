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
      <span aria-hidden="true" className={cn("absolute top-[22px] z-10 h-2.5 w-4 -translate-x-1/2 rounded-full bg-[#0d0d10] shadow-[inset_0_2px_2px_rgba(0,0,0,.9),0_1px_0_rgba(255,255,255,.35)]", className)} />
      <svg aria-hidden="true" viewBox="0 0 14 52" className={cn("pointer-events-none absolute -top-[14px] z-20 h-[52px] w-3.5 -translate-x-1/2 overflow-visible drop-shadow-[0_3px_2px_rgba(0,0,0,.45)]", className)}>
        <rect x="2.5" y="2" width="9" height="46" rx="4.5" fill="none" stroke="#6b6e75" strokeWidth="3.6" />
        <rect x="2.5" y="2" width="9" height="46" rx="4.5" fill="none" stroke="#e9ebef" strokeWidth="1.6" />
        <rect x="1.9" y="3" width="1" height="40" rx=".5" fill="#ffffff" opacity=".85" />
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
    <section aria-labelledby="calendar-title" className="relative rounded-[24px] bg-[#4f90f5] px-2 pb-3 pt-7 shadow-[0_16px_32px_-14px_rgba(0,0,0,.7)]">
      <BinderRing className="left-[26%]" />
      <BinderRing className="right-[26%]" />
      <Sticker name="cat-peek" className="absolute -right-1 -top-9 w-16" />
      <div className="note note-yellow px-2 pb-3 pt-3">
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
