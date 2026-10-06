import { getAllPosts } from "@/lib/api"
import { BlogList } from "@/components/blog-list"

export default function Home() {
  const posts = getAllPosts()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
      {/* Hero Section */}
      <div className="mb-16 max-w-3xl mx-auto text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
          ✦ Blog & Yazılar
        </p>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Düşüncelerimi ve{" "}
          <span className="gradient-text">keşiflerimi</span>{" "}
          paylaşıyorum.
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Yazılım geliştirme, teknoloji ve tasarım üzerine derinlemesine notlarım.
          Her yazı, öğrenme yolculuğumun bir parçası.
        </p>
      </div>

      <BlogList posts={posts} />
    </div>
  )
}
