import { getPostBySlug, getPostSlugs } from "@/lib/api"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import Markdown from "react-markdown"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"

export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ""),
  }))
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = getPostBySlug(params.slug)

  if (!post.title) {
    return notFound()
  }

  return (
    <article className="relative min-h-screen pb-20">
      {/* Banner */}
      <div className="relative h-[45vh] min-h-[350px] w-full overflow-hidden">
        {post.banner_image ? (
          <img
            src={post.banner_image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-accent/20" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back Button — positioned top-left over the banner */}
        <div className="absolute top-6 left-4 z-10 sm:left-8">
          <Link
            href="/"
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:shadow-[0_0_20px_hsla(265,90%,60%,0.25)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Link>
        </div>

        {/* Title — positioned at bottom of banner */}
        <div className="absolute bottom-0 w-full pb-10 pt-20">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <time dateTime={post.date} className="font-medium">
                {format(parseISO(post.date), "d MMMM yyyy", { locale: tr })}
              </time>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Divider glow line */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-12" />
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <div className="prose prose-lg prose-neutral dark:prose-invert mx-auto prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:glass-card prose-pre:border prose-pre:border-white/10">
          <Markdown>{post.content}</Markdown>
        </div>
      </div>
    </article>
  )
}
