"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Sticker } from "@/components/sticker"
import { cn } from "@/lib/utils"

const dateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function BinderRing({ className }: { className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={cn("absolute top-[46px] z-10 h-3.5 w-7 -translate-x-1/2 rounded-full bg-[#0b1224] shadow-[inset_0_3px_4px_rgba(0,0,0,.95),0_1px_0_rgba(255,255,255,.5)]", className)} />
      <svg aria-hidden="true" viewBox="0 0 22 69" className={cn("pointer-events-none absolute -top-[16px] z-20 h-[69px] w-[22px] -translate-x-1/2 overflow-visible drop-shadow-[0_3px_3px_rgba(0,0,0,.5)]", className)}>
        <defs>
          <linearGradient id="ring-metal" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#7d8087" />
            <stop offset=".3" stopColor="#f8f9fb" />
            <stop offset=".6" stopColor="#b7bac2" />
            <stop offset="1" stopColor="#5f626a" />
          </linearGradient>
        </defs>
        <path d="M1 11a10 10 0 0 1 20 0V69H1Z" fill="url(#ring-metal)" />
        <path d="M8 12a3 3 0 0 1 6 0V69H8Z" fill="#202228" />
        <path d="M3.6 12V60" stroke="#ffffff" strokeOpacity=".8" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M18.6 14V60" stroke="#3b3e45" strokeOpacity=".6" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </>
  )
}

export function StoryCalendar({ storyDates, selected = null }: { storyDates: string[]; selected?: string | null }) {
  const start = selected ?? storyDates[0]
  const initial = start ? new Date(`${start}T12:00:00`) : new Date()
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
            const isSelected = date === selected
            return (
              <Link
                key={date}
                href={isSelected ? "/calendar" : `/calendar?date=${date}`}
                scroll={false}
                aria-current={isSelected ? "date" : undefined}
                aria-label={has ? `${day}, has moments` : `${day}, no moments`}
                className="flex flex-col items-center py-0.5"
              >
                <span className={cn("flex size-7 items-center justify-center rounded-full text-[13px]", isToday && "bg-[#ff5fa2] font-bold text-white", isSelected && "ring-2 ring-[#17171a]")}>{day}</span>
                <span className={cn("mt-0.5 size-1 rounded-full", has ? "bg-black" : "bg-transparent")} aria-hidden="true" />
              </Link>
            )
          })}
        </div>
        <Sticker name="star" className="absolute -bottom-3 -right-2 w-7" />
      </div>
    </section>
  )
}
