"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Play, X } from "lucide-react"

export function ZoomableMedia({ src, type, alt, className }: { src: string; type: "image" | "video"; alt: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const isVideo = type === "video"

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false) }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={isVideo ? "Play video larger" : "View photo larger"} className="relative block size-full cursor-zoom-in">
        {isVideo
          ? <video src={`${src}#t=0.1`} muted playsInline preload="metadata" className={className} />
          : <img src={src} alt={alt} className={className} />}
        {isVideo && (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-black/55 text-white"><Play className="size-6 fill-current" /></span>
          </span>
        )}
      </button>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={isVideo ? "Video" : "Photo"} onClick={() => setOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex size-10 items-center justify-center rounded-full bg-white/15 text-white">
            <X className="size-5" />
          </button>
          {isVideo
            ? <video src={src} controls autoPlay playsInline onClick={(event) => event.stopPropagation()} className="max-h-full max-w-full rounded-lg bg-black" />
            : <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} className="max-h-full max-w-full rounded-lg object-contain" />}
        </div>,
        document.body,
      )}
    </>
  )
}
