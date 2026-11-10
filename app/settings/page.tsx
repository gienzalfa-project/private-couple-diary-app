import { redirect } from "next/navigation"
import { signOut } from "@/app/actions/auth"
import { getSession } from "@/lib/auth"
import { AppHeader } from "@/components/app-header"
import { NotificationSettings } from "@/components/notification-settings"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  return (
    <>
      <AppHeader session={session} active="settings" />
      <main className="flex flex-col gap-6 px-4 pb-16 pt-5">
        <h1 className="font-script text-5xl leading-none">our little signals.</h1>
        <NotificationSettings publicKey={process.env.VAPID_PUBLIC_KEY ?? ""} />
        <form action={signOut} className="note note-blue">
          <p className="mb-3 text-sm">Signed in as <strong>{session.name}</strong>.</p>
          <button type="submit" className="h-12 w-full rounded-2xl bg-[#202022] text-[15px] font-bold text-white">Sign out</button>
        </form>
      </main>
    </>
  )
}
