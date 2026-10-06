import { getPostBySlug, getPostSlugs } from "@/lib/api"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import Markdown from "react-markdown"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
    <article className="relative min-h-screen pb-16">
      {/* Banner */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-muted overflow-hidden">
        {post.banner_image ? (
          <img
            src={post.banner_image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-4 sm:left-8 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-background to-transparent pt-32 pb-8">
          <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl drop-shadow-sm">
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-muted-foreground drop-shadow-sm">
              <time dateTime={post.date} className="font-medium">
                {format(parseISO(post.date), "d MMMM yyyy", { locale: tr })}
              </time>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        <div className="prose prose-lg prose-neutral dark:prose-invert mx-auto">
          <Markdown>{post.content}</Markdown>
        </div>
      </div>
    </article>
  )
}
