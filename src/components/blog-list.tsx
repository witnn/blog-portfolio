"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BlogPost } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
          <Link href={`/blog/${post.slug}`}>
            <motion.div
              whileHover={{ y: -5 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                {post.banner_image ? (
                  <img
                    src={post.banner_image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight">{post.title}</h3>
                  <p className="line-clamp-3 text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <time dateTime={post.date}>
                    {format(parseISO(post.date), "d MMMM yyyy", { locale: tr })}
                  </time>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
