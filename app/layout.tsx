import type { Metadata, Viewport } from "next"
import { Fredoka, Euphoria_Script } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import "./globals.css"

const rounded = Fredoka({ subsets: ["latin"], variable: "--font-sans" })
const script = Euphoria_Script({ subsets: ["latin"], weight: "400", variable: "--font-script" })

export const metadata: Metadata = {
  title: { default: "yap yap!", template: "%s · yap yap!" },
  description: "Our private scrapbook journal.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "yap yap!", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
}
export const viewport: Viewport = { themeColor: "#131315", width: "device-width", initialScale: 1, userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${rounded.variable} ${script.variable}`}><body>{children}<ServiceWorkerRegistration /><Analytics /></body></html>
}
