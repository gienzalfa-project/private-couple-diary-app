"use client"

import { useState } from "react"
import { BellOff, BellRing } from "lucide-react"

function decode(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/")
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

export function NotificationSettings({ publicKey }: { publicKey: string }) {
  const [status, setStatus] = useState("")
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
  const enabled = Boolean(publicKey) && supported

  async function subscribe() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decode(publicKey) })
      const response = await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(subscription) })
      if (!response.ok) throw new Error()
      setStatus("Notifications are on for this device.")
    } catch {
      setStatus("We could not enable notifications on this device.")
    }
  }

  return (
    <section className="note note-yellow">
      <div className="mb-3 flex items-center gap-3">
        {enabled ? <BellRing className="size-6 shrink-0" aria-hidden="true" /> : <BellOff className="size-6 shrink-0" aria-hidden="true" />}
        <div>
          <h2 className="text-[15px] font-bold">New moment notifications</h2>
          <p className="text-sm">Get a gentle alert when the other person shares.</p>
        </div>
      </div>
      <button type="button" onClick={subscribe} disabled={!enabled} className="h-12 w-full rounded-2xl bg-[#202022] text-[15px] font-bold text-white disabled:opacity-50">{enabled ? "Enable notifications" : "Notifications unavailable"}</button>
      {!publicKey ? <p className="mt-3 text-xs">Push is disabled until VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are configured.</p> : null}
      {status ? <p className="mt-3 text-sm" role="status">{status}</p> : null}
    </section>
  )
}
