"use client"

import { useState } from "react"
import { reactionOptions } from "@/lib/moods"
import { cn } from "@/lib/utils"

type Reaction = { author: string; reaction: string }

export function ReactionBar({ storyId, viewer, initialReactions }: { storyId: string; viewer: string; initialReactions: Reaction[] }) {
  const [reactions, setReactions] = useState(initialReactions)
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function toggle(reaction: string) {
    setPending(reaction); setError("")
    const response = await fetch(`/api/stories/${storyId}/reactions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reaction }) })
    const result = await response.json().catch(() => null)
    if (!response.ok) setError(result?.error || "Could not save reaction.")
    else setReactions(result.reactions)
    setPending(null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1" role="group" aria-label="React to this moment">
        {reactionOptions.map(({ id, emoji, label }) => {
          const selected = reactions.some((item) => item.author === viewer && item.reaction === id)
          const count = reactions.filter((item) => item.reaction === id).length
          return (
            <button
              key={id}
              type="button"
              aria-label={count ? `${label}, ${count}` : label}
              aria-pressed={selected}
              disabled={pending !== null}
              onClick={() => toggle(id)}
              className={cn(
                "flex h-9 min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full px-1 text-base leading-none transition-transform active:scale-90 disabled:opacity-60",
                selected ? "bg-[#17171a]/85 text-white" : "bg-white/50",
              )}
            >
              <span aria-hidden="true">{emoji}</span>
              {count ? <span className="font-sans text-xs font-bold">{count}</span> : null}
            </button>
          )
        })}
      </div>
      {error ? <p className="text-xs font-medium text-red-800" role="alert">{error}</p> : null}
    </div>
  )
}
