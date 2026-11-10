"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"

export function DeleteStoryButton({
  action,
  label = "Delete post",
  question = "Delete this post?",
  compact = false,
}: {
  action: () => Promise<void>
  label?: string
  question?: string
  compact?: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const text = compact ? "text-[11px]" : "text-xs"
  const pad = compact ? "px-2.5 py-1" : "px-3 py-1.5"

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`flex items-center gap-1.5 rounded-full bg-black/10 ${pad} ${text} font-medium text-[#9b1c2e]`}>
        <Trash2 className={compact ? "size-3" : "size-3.5"} aria-hidden="true" /> {label}
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${text}`}>
      <span className="font-medium">{question}</span>
      <button type="button" disabled={pending} onClick={() => startTransition(async () => { await action() })} className={`rounded-full bg-[#d6293e] ${pad} font-semibold text-white disabled:opacity-60`}>
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)} className={`rounded-full bg-black/10 ${pad} font-medium`}>Cancel</button>
    </div>
  )
}
