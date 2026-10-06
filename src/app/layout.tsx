import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { getAboutData } from "@/lib/api"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
})

export const metadata: Metadata = {
  title: "Blog & Portfolio",
  description: "Personal blog and portfolio.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const aboutData = getAboutData()
  
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} min-h-screen font-[family-name:var(--font-space)] antialiased noise`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Mesh gradient background */}
          <div className="mesh-bg" />

          <div className="relative flex min-h-screen flex-col">
            <Navbar userName={aboutData.name} />
            <main className="flex-1 pt-16">{children}</main>

            {/* Footer */}
            <footer className="border-t border-border/30 py-8">
              <div className="container mx-auto max-w-5xl px-4 sm:px-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} <span className="gradient-text font-semibold">JaneDoe</span>. Tüm hakları saklıdır.
                  </p>
                  <p className="text-xs text-muted-foreground/50">
                    Next.js & Vercel ile oluşturuldu ✨
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
