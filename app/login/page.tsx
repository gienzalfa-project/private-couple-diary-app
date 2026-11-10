import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  if (await getSession()) redirect("/")
  return <main className="flex min-h-svh items-center justify-center px-5 py-10"><LoginForm /></main>
}
