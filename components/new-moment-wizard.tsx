"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { upload as uploadToBlob } from "@vercel/blob/client"
import { ArrowLeft, Camera, Plus, X } from "lucide-react"
import { moods } from "@/lib/moods"
import { Clip, Sticker } from "@/components/sticker"
import type { Author } from "@/lib/auth"
import { cn } from "@/lib/utils"

type Pick = { file: File; url: string; duration: number }

const outlineButton = "flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-black/80 text-sm font-semibold"

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
}

export function NewMomentWizard({ name, author }: { name: string; author: Author }) {
  const router = useRouter()
  const [items, setItems] = useState<Pick[]>([])
  const [caption, setCaption] = useState("")
  const [mood, setMood] = useState("")
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState("")
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [cameraOpen, setCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const itemsRef = useRef<Pick[]>([])
  itemsRef.current = items

  useEffect(() => () => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  async function addFiles(files: FileList | null) {
    if (!files) return
    const next: Pick[] = []
    for (const file of Array.from(files).slice(0, 4 - items.length)) {
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file)
        const duration = await new Promise<number>((resolve) => {
          const video = document.createElement("video")
          video.preload = "metadata"
          video.onloadedmetadata = () => resolve(video.duration)
          video.onerror = () => resolve(999)
          video.src = url
        })
        if (duration > 20) { URL.revokeObjectURL(url); setError(`${file.name} is longer than 20 seconds.`); continue }
        next.push({ file, url, duration })
      } else next.push({ file, url: URL.createObjectURL(file), duration: 0 })
    }
    setItems((current) => [...current, ...next])
    if (next.length) setError("")
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true })
      streamRef.current = stream
      setCameraOpen(true)
      requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() } })
    } catch { setError("Camera access was not available. Choose a file instead.") }
  }

  function startRecording() {
    if (!streamRef.current) return
    chunksRef.current = []
    const recorder = new MediaRecorder(streamRef.current, { mimeType: MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : undefined })
    recorderRef.current = recorder
    recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" })
      const file = new File([blob], `moment-${Date.now()}.webm`, { type: blob.type })
      setItems((current) => [...current, { file, url: URL.createObjectURL(file), duration: seconds }])
      closeCamera()
    }
    recorder.start()
    setSeconds(0)
    setRecording(true)
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value >= 19) { window.clearInterval(timer); recorder.stop(); setRecording(false); return 20 }
      return value + 1
    }), 1000)
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop()
    setRecording(false)
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  async function upload() {
    setSaving(true)
    setError("")
    setProgress("")
    try {
      const media: Array<{ pathname: string; type: "image" | "video"; duration: number }> = []
      for (let index = 0; index < items.length; index++) {
        const item = items[index]
        const contentType = item.file.type.split(";")[0]
        const extension = extensions[contentType]
        if (!extension) throw new Error(`${item.file.name} is not a supported file.`)
        setProgress(`Uploading ${index + 1} of ${items.length}…`)
        const blob = await uploadToBlob(`stories/${crypto.randomUUID()}.${extension}`, item.file, {
          access: "private",
          handleUploadUrl: "/api/blob-upload",
          contentType,
          multipart: item.file.size > 100 * 1024 * 1024,
        })
        media.push({ pathname: blob.pathname, type: contentType.startsWith("video/") ? "video" : "image", duration: item.duration })
      }
      setProgress("Saving…")
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: caption, mood: mood || undefined, media }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? `Could not save this moment (${response.status}).`)
      router.push("/")
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload this moment.")
      setSaving(false)
    }
  }

  const selectedMood = moods.find((item) => item.id === mood)
  const canShare = items.length > 0 || caption.trim().length > 0

  if (preview) {
    return (
      <section>
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => setPreview(false)} aria-label="Back to editing" className="flex size-9 items-center justify-center"><ArrowLeft className="size-5" /></button>
          <h1 className="text-lg font-medium">Preview</h1>
        </div>
        <article className={cn("note", author === "a" ? "note-green" : "note-pink")}>
          <Clip />
          <Sticker name={author === "a" ? "cat-sit" : "star"} className="absolute -right-2 -top-4 w-7" />
          <header className="mb-3 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#ffc94a] text-sm font-bold" aria-hidden="true">{name[0]}</span>
            <span className="text-[15px] font-bold">{name}</span>
            <span className="ml-auto pr-6 text-[11px] font-medium uppercase tracking-wide">Today</span>
          </header>
          {items.length ? (
            <div className={cn("mb-3 grid gap-1.5 overflow-hidden rounded-2xl", items.length > 1 && "grid-cols-2")}>
              {items.map((item) => item.file.type.startsWith("video/")
                ? <video key={item.url} src={item.url} controls playsInline className="aspect-[4/3] size-full bg-black object-cover" />
                : <img key={item.url} src={item.url} alt="Moment preview" className="aspect-[4/3] size-full object-cover" />)}
            </div>
          ) : null}
          {caption ? <p className="mb-3 whitespace-pre-wrap text-[15px] leading-snug">{caption}</p> : null}
          {selectedMood ? <span className="inline-flex items-center gap-1 rounded-full bg-[#ffe69a] px-2.5 py-1 text-xs font-semibold"><span aria-hidden="true">{selectedMood.emoji}</span>{selectedMood.label}</span> : null}
          <Sticker name="cat-peek" className="absolute -bottom-5 -right-2 w-16" />
        </article>
        <p className="my-8 text-center font-script text-3xl text-white/80">One more look before you share.</p>
        {error ? <p className="mb-3 text-sm font-medium text-red-400" role="alert">{error}</p> : null}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setPreview(false)} className="h-12 rounded-xl border border-white/70 text-[15px] font-semibold">Edit</button>
          <button type="button" onClick={upload} disabled={saving} className="btn-green h-12 rounded-xl text-[15px] font-bold disabled:opacity-60">{saving ? progress || "Uploading…" : "Upload"}</button>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <Link href="/" aria-label="Back to moments" className="flex size-9 items-center justify-center"><ArrowLeft className="size-5" /></Link>
        <h1 className="text-lg font-medium">New moment</h1>
      </div>

      <div className="note note-blue mb-6 px-4 pb-4 pt-5">
        <Clip />
        {cameraOpen ? (
          <div className="flex flex-col gap-3">
            <video ref={videoRef} muted playsInline className="aspect-[3/4] w-full rounded-xl bg-black object-cover" />
            <div className="grid grid-cols-2 gap-2">
              {recording
                ? <button type="button" onClick={stopRecording} className="h-11 rounded-xl bg-red-600 text-sm font-bold text-white">Stop · {seconds}s</button>
                : <button type="button" onClick={startRecording} className="h-11 rounded-xl bg-[#202022] text-sm font-bold text-white">Start recording</button>}
              <button type="button" onClick={() => { stopRecording(); closeCamera() }} className={outlineButton}>Cancel</button>
            </div>
            <p className="text-center text-xs">Up to 20 seconds.</p>
          </div>
        ) : (
          <>
            <Camera className="mx-auto mb-3 size-8" aria-hidden="true" />
            <button type="button" onClick={openCamera} className="mb-2 h-11 w-full rounded-xl bg-[#202022] text-sm font-semibold text-white">Record video</button>
            <label className={outlineButton}>
              Choose video or photo
              <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(event) => { addFiles(event.target.files); event.target.value = "" }} />
            </label>
            {items.length ? (
              <ul className="mt-4 grid grid-cols-3 gap-2">
                {items.map((item, index) => (
                  <li key={item.url} className="relative aspect-square overflow-hidden rounded-lg border border-black/70">
                    {item.file.type.startsWith("video/") ? <video src={item.url} muted className="size-full object-cover" /> : <img src={item.url} alt={`Selected media ${index + 1}`} className="size-full object-cover" />}
                    <button type="button" onClick={() => { URL.revokeObjectURL(item.url); setItems((current) => current.filter((_, i) => i !== index)) }} aria-label={`Remove media ${index + 1}`} className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black text-white"><X className="size-3.5" /></button>
                  </li>
                ))}
                {items.length < 4 ? (
                  <li>
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-black/70 text-[11px] font-medium">
                      <Plus className="size-5" aria-hidden="true" />Add media
                      <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(event) => { addFiles(event.target.files); event.target.value = "" }} />
                    </label>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </>
        )}
      </div>

      <div className="relative">
        <label htmlFor="caption" className="relative z-10 ml-2 inline-block -rotate-2 rounded-md bg-[#ff8fc0] px-3 py-0.5 font-script text-3xl leading-tight text-black">Caption</label>
        <div className="note note-yellow -mt-3 px-3 pb-3 pt-5">
          <Sticker name="star" className="absolute -right-2 -top-3 w-6" />
          <textarea id="caption" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={4000} rows={3} className="w-full resize-none bg-transparent text-[15px] leading-snug outline-none placeholder:text-black/50" placeholder="Found a cute cafe. Saving you a seat…" />
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 font-script text-4xl leading-none">Mood</legend>
        <div className="grid grid-cols-5 gap-1">
          {moods.map((item) => (
            <button key={item.id} type="button" onClick={() => setMood(mood === item.id ? "" : item.id)} aria-pressed={mood === item.id} className={cn("flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px]", mood === item.id ? "bg-white/20 ring-1 ring-white/60" : "")}>
              <span className="text-3xl leading-none" aria-hidden="true">{item.emoji}</span>{item.label}
            </button>
          ))}
        </div>
      </fieldset>

      {error ? <p className="mt-4 text-sm font-medium text-red-400" role="alert">{error}</p> : null}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setPreview(true)} disabled={!canShare} className="h-12 rounded-xl border border-white/70 text-[15px] font-semibold disabled:opacity-40">Preview</button>
        <button type="button" onClick={upload} disabled={saving || !canShare} className="btn-green h-12 rounded-xl text-[15px] font-bold disabled:opacity-40">{saving ? progress || "Uploading…" : "Upload"}</button>
      </div>
    </section>
  )
}
