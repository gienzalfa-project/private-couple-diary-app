"use client"

import { useActionState, useState } from "react"
import { Check, Eye, EyeOff } from "lucide-react"
import { signIn } from "@/app/actions/auth"
import { Clip, Sticker, Wordmark } from "@/components/sticker"
import { cn } from "@/lib/utils"

const people = [{ name: "Gienzalfa", initial: "G" }, { name: "Raehan", initial: "R" }]

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" })
  const [name, setName] = useState(people[0].name)
  const [visible, setVisible] = useState(false)
  return (
    <div className="w-full max-w-sm">
      <div className="mb-14 flex justify-center"><Wordmark className="text-7xl" /></div>
      <form action={action} className="note note-blue px-5 pb-5 pt-6">
        <Clip />
        <Sticker name="cat-peek" className="absolute -top-[46px] left-[36%] w-[72px]" />
        <Sticker name="star" className="absolute -right-3 -top-3 w-8" />
        <p className="text-center text-[11px] font-medium uppercase tracking-[.2em]">Just the two of us</p>
        <h1 className="mt-1 text-center font-script text-5xl leading-tight">Ready to yap?</h1>
        <p className="mb-4 text-center text-sm">Your daily dose of each other.</p>
        <input type="hidden" name="name" value={name} />
        <fieldset className="mb-4 flex flex-col gap-2">
          <legend className="sr-only">Who are you?</legend>
          {people.map((person) => {
            const selected = person.name === name
            return (
              <button key={person.name} type="button" aria-pressed={selected} onClick={() => setName(person.name)} className={cn("flex h-11 items-center gap-3 rounded-full border border-black/80 px-2 text-[15px] font-bold", selected ? "bg-[#ffe69a]" : "bg-white")}>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#ffc94a] text-sm" aria-hidden="true">{person.initial}</span>
                {person.name}
                {selected ? <Check className="ml-auto mr-2 size-4" aria-hidden="true" /> : null}
              </button>
            )
          })}
        </fieldset>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <div className="relative mb-4">
          <input id="password" name="password" type={visible ? "text" : "password"} required autoComplete="current-password" className="h-11 w-full rounded-xl border border-black/70 bg-white px-3 pr-11 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-black" />
          <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center">
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {state.error ? <p className="mb-3 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-red-800" role="alert">{state.error}</p> : null}
        <button type="submit" disabled={pending} className="h-12 w-full rounded-2xl bg-[#202022] text-[15px] font-bold text-white disabled:opacity-60">{pending ? "Opening…" : "Let’s yap!"}</button>
      </form>
      <p className="mt-4 text-center text-xs text-white/70">Private · Just us.</p>
    </div>
  )
}
