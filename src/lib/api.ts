import fs from "fs"
import path from "path"
import matter from "gray-matter"

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  banner_image: string
  content: string
}

const blogsDirectory = path.join(process.cwd(), "content", "blogs")

export function getPostSlugs() {
  if (!fs.existsSync(blogsDirectory)) return []
  return fs.readdirSync(blogsDirectory).filter((file) => file.endsWith(".md"))
}

export function getPostBySlug(slug: string): BlogPost {
  const realSlug = slug.replace(/\.md$/, "")
  const fullPath = path.join(blogsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    title: data.title || "",
    date: data.date || "",
    excerpt: data.excerpt || "",
    banner_image: data.banner_image || "",
    content,
  }
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}

export interface AboutData {
  name: string
  title: string
  bio: string
  avatar_url: string
  socials: { platform: string; url: string; icon: string }[]
  skills: { category: string; items: string[] }[]
}

export function getAboutData(): AboutData {
  const fullPath = path.join(process.cwd(), "content", "about.json")
  if (!fs.existsSync(fullPath)) {
    return { name: "", title: "", bio: "", avatar_url: "", socials: [], skills: [] }
  }
  const fileContents = fs.readFileSync(fullPath, "utf8")
  return JSON.parse(fileContents) as AboutData
}
