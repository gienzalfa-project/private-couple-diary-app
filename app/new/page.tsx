import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AppHeader } from "@/components/app-header"
import { NewMomentWizard } from "@/components/new-moment-wizard"

export default async function NewMomentPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  return <><AppHeader session={session} active="new" back /><main className="px-4 pb-16 pt-2"><NewMomentWizard name={session.name} author={session.author} /></main></>
}
