"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"

export function DeleteStoryButton({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 text-xs font-medium text-[#9b1c2e]">
        <Trash2 className="size-3.5" aria-hidden="true" /> Delete post
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-medium">Delete this post?</span>
      <button type="button" disabled={pending} onClick={() => startTransition(async () => { await action() })} className="rounded-full bg-[#d6293e] px-3 py-1.5 font-semibold text-white disabled:opacity-60">
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="rounded-full bg-black/10 px-3 py-1.5 font-medium">Cancel</button>
    </div>
  )
}
