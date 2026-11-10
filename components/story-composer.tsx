"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function StoryComposer() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [body, setBody] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [durations, setDurations] = useState<number[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploading, setUploading] = useState(false)

  async function choose(next: FileList | null) {
    if (!next) return
    const selected = [...next].slice(0, 4)
    const measured = await Promise.all(selected.map((file) => file.type.startsWith("video/") ? new Promise<number>((resolve) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve(video.duration) }
      video.onerror = () => resolve(Number.POSITIVE_INFINITY)
      video.src = URL.createObjectURL(file)
    }) : Promise.resolve(0)))
    const tooLong = selected.find((file, index) => file.type.startsWith("video/") && measured[index] > 20)
    if (tooLong) { setError(`${tooLong.name} is longer than 20 seconds.`); return }
    setError(""); setFiles(selected); setDurations(measured)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSuccess(""); setUploading(true)
    const form = new FormData(); form.set("body", body)
    files.forEach((file) => form.append("files", file)); durations.forEach((duration) => form.append("durations", String(duration)))
    const response = await fetch("/api/stories", { method: "POST", body: form })
    const result = await response.json()
    setUploading(false)
    if (!response.ok) { setError(result.error); return }
    setBody(""); setFiles([]); setDurations([]); setSuccess("Your story is now in the feed."); router.refresh()
  }

  return <form onSubmit={submit} className="rounded-xl border bg-card p-4 shadow-sm">
    <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="Add a moment, a thought, or something worth remembering…" aria-label="Story text" className="min-h-24 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground" />
    {files.length ? <div className="mb-3 flex flex-wrap gap-2">{files.map((file, index) => <span key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">{file.name}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => { setFiles(files.filter((_, i) => i !== index)); setDurations(durations.filter((_, i) => i !== index)) }}><X className="size-3.5" /></button></span>)}</div> : null}
    {uploading ? <Progress value={72} className="mb-3" /> : null}
    {error ? <p className="mb-3 text-sm text-destructive" role="alert">{error}</p> : null}
    {success ? <p className="mb-3 text-sm font-medium text-primary" role="status">{success}</p> : null}
    <div className="flex items-center justify-between border-t pt-3"><div><input ref={inputRef} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime" onChange={(event) => choose(event.target.files)} /><Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}><ImagePlus data-icon="inline-start" />Add media</Button></div><Button type="submit" size="sm" disabled={uploading || (!body.trim() && !files.length)}><Send data-icon="inline-start" />Share</Button></div>
  </form>
}
