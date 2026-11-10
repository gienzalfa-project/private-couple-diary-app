import { cn } from "@/lib/utils"

const sizes = { star: [238, 253], "cat-sit": [210, 270], "cat-peek": [323, 242] } as const

export function Sticker({ name, className }: { name: keyof typeof sizes; className?: string }) {
  const [width, height] = sizes[name]
  return <img src={`/stickers/${name}.png`} width={width} height={height} alt="" aria-hidden="true" draggable={false} className={cn("pointer-events-none h-auto max-w-none select-none", className)} />
}

const clipPath = "M8 48V14a6 6 0 0 1 12 0v36a9 9 0 0 1-18 0V22"

export function Clip({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 22 62" className={cn("pointer-events-none absolute left-3 -top-5 z-10 h-[58px] w-[21px] rotate-[14deg] overflow-visible drop-shadow-[0_2px_1.5px_rgba(0,0,0,.35)]", className)}>
      <path d={clipPath} fill="none" stroke="#858991" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={clipPath} fill="none" stroke="#eceef2" strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" transform="translate(-.35 -.35)" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("silver-text font-script text-6xl leading-none", className)}>yap yap!</span>
}
