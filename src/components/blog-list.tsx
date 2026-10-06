"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BlogPost } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import { ArrowUpRight, Calendar } from "lucide-react"

export function BlogList({ posts }: { posts: BlogPost[] }) {
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
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
    },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 sm:grid-cols-2"
    >
      {posts.map((post) => (
        <motion.div key={post.slug} variants={item}>
          <Link href={`/blog/${post.slug}`} className="group block">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative h-full overflow-hidden rounded-2xl glass-card border-gradient"
            >
              {/* Banner Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden">
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
              <div className="relative p-6">
                <h3 className="mb-2 text-lg font-bold tracking-tight text-card-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
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
    </motion.div>
  )
}
