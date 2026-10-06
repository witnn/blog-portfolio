"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function AdminPage() {
  const [secret, setSecret] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [date, setDate] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (secret) {
      setIsAuthenticated(true)
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const mdContent = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
banner_image: "${bannerImage}"
---

${content}`

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          path: `content/blogs/${slug}.md`,
          message: `Add new blog post: ${title}`,
          content: mdContent,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage("Blog yazısı başarıyla eklendi!")
        setTitle("")
        setSlug("")
        setDate("")
        setExcerpt("")
        setBannerImage("")
        setContent("")
      } else {
        setMessage(`Hata: ${data.error}`)
      }
    } catch (err: any) {
      setMessage(`Hata: ${err.message}`)
    }
    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-center">Admin Girişi</h2>
          <input
            type="password"
            placeholder="Secret Key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">Yeni Blog Yazısı</h1>
      
      {message && (
        <div className="mb-6 rounded-md bg-secondary p-4 text-sm font-medium">
          {message}
        </div>
      )}

      <form onSubmit={handlePublish} className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""))
              }}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">URL (Slug)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tarih (YYYY-MM-DD)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Banner Görsel URL</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Kısa Özet (Excerpt)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">İçerik (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Yayınla (GitHub'a Pushla)"}
        </motion.button>
      </form>
    </div>
  )
}
