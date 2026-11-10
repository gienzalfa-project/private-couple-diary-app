"use server"

import { redirect } from "next/navigation"
import { createSession, destroySession, verifyCredentials } from "@/lib/auth"

export async function signIn(_state: { error: string }, formData: FormData) {
  const author = await verifyCredentials(String(formData.get("name") || ""), String(formData.get("password") || ""))
  if (!author) return { error: "That name and password combination was not recognized." }
  await createSession(author)
  redirect("/")
}

export async function signOut() {
  await destroySession()
  redirect("/login")
}
