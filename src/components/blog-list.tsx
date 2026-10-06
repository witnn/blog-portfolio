"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { BlogPost } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import { ArrowUpRight, Calendar, Search, Sparkles } from "lucide-react"
import { useState } from "react"

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("")

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) || 
    post.excerpt?.toLowerCase().includes(query.toLowerCase())
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)", scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
      transition: { duration: 0.2 },
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Search Box */}
      <div className="relative mx-auto w-full max-w-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Yazılarda ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass-input h-12 w-full rounded-2xl pl-11 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-col items-center justify-center rounded-2xl py-20 text-center border-gradient"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Sonuç bulunamadı</h3>
          <p className="mt-2 text-muted-foreground">
            "{query}" ile eşleşen bir yazı bulamadık.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div key={post.slug} variants={item} layout>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative h-full flex flex-col overflow-hidden rounded-2xl glass-card border-gradient"
                  >
                    {/* Banner Image */}
                    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
                      {post.banner_image ? (
                        <img
                          src={post.banner_image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20" />
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Arrow indicator */}
                      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                        <ArrowUpRight className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex flex-1 flex-col p-6">
                      <h3 className="mb-2 text-lg font-bold tracking-tight text-card-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground flex-1">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
                        <Calendar className="h-3.5 w-3.5" />
                        <time dateTime={post.date}>
                          {format(parseISO(post.date), "d MMMM yyyy", { locale: tr })}
                        </time>
                      </div>
                    </div>

                    {/* Bottom glow line */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 group-hover:w-full" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
