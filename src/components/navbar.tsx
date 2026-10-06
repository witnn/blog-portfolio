"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Moon, Sun, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

const navItems = [
  { path: "/", name: "Blog" },
  { path: "/about", name: "Hakkımda" },
]

export function Navbar({ userName = "Jane Doe" }: { userName?: string }) {
  const pathname = usePathname() || "/"
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => {
      const activeEl = document.getElementById(`nav-${pathname}`)
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        })
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [pathname, mounted])

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="border-b border-white/5 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_hsla(265,90%,60%,0.3)]">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="gradient-text">{userName}</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="relative flex items-center gap-1">
            <motion.div
              className="absolute inset-y-0 rounded-xl bg-primary/10 border border-primary/20"
              initial={false}
              animate={indicatorStyle}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            />
            
            {navItems.map((item) => {
              const isActive = item.path === pathname
              return (
                <Link
                  id={`nav-${item.path}`}
                  key={item.path}
                  href={item.path}
                  className="relative z-10 px-4 py-2 text-sm font-medium transition-colors"
                >
                  <span className={`${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}

            {/* Theme Toggle */}
            {mounted && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="ml-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_15px_hsla(265,90%,60%,0.2)]"
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div key="moon" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Moon className="h-4 w-4 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div key="sun" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Sun className="h-4 w-4 text-amber-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
