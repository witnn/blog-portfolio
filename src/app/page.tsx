import { getAllPosts } from "@/lib/api"
import { BlogList } from "@/components/blog-list"

export default function Home() {
  const posts = getAllPosts()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Yazılarım
        </h1>
        <p className="text-lg text-muted-foreground">
          Yazılım geliştirme, teknoloji ve tasarım üzerine notlarım.
        </p>
      </div>
      <BlogList posts={posts} />
    </div>
  )
}
