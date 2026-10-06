"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit2, Trash2, X, Save, ArrowLeft, RefreshCw } from "lucide-react"

import matter from "gray-matter"

export default function AdminPage() {
  const [secret, setSecret] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<"blog" | "profile">("blog")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (secret) setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <form onSubmit={handleLogin} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-center">Admin Girişi</h2>
          <input type="password" placeholder="Secret Key" value={secret} onChange={(e) => setSecret(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors">Giriş Yap</button>
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Paneli</h1>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("blog")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "blog" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>Blog Yönetimi</button>
          <button onClick={() => setActiveTab("profile")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "profile" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>Profil Ayarları</button>
        </div>
      </div>

      {activeTab === "blog" ? <BlogManager secret={secret} /> : <ProfileManager secret={secret} />}
    </div>
  )
}

function BlogManager({ secret }: { secret: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "form">("list")
  const [editingFile, setEditingFile] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [date, setDate] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchFiles = async () => {
    setLoading(true)
    const res = await fetch("/api/github", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, action: "listFiles", path: "content/blogs" })
    })
    const json = await res.json()
    if (json.data && Array.isArray(json.data)) {
      setFiles(json.data.filter((f: any) => f.name.endsWith(".md")))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleEdit = async (filename: string) => {
    setLoading(true)
    const res = await fetch("/api/github", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, action: "getFile", path: `content/blogs/${filename}` })
    })
    const json = await res.json()
    if (json.content) {
      // Very basic gray-matter parse for client-side format (or we can just regex, but gray-matter works in browser if bundled, actually matter() needs Buffer which isn't in browser standard so let's parse frontmatter manually)
      const contentRaw = json.content;
      const frontmatterRegex = /---\n([\s\S]*?)\n---/
      const match = contentRaw.match(frontmatterRegex)
      
      let parsedTitle = "", parsedDate = "", parsedExcerpt = "", parsedBanner = "";
      let bodyText = contentRaw;

      if (match) {
        const fm = match[1]
        bodyText = contentRaw.replace(match[0], "").trim()
        
        const getVal = (key: string) => {
          const r = new RegExp(`${key}:\\s*["']?([^"'\n]+)["']?`)
          const m = fm.match(r)
          return m ? m[1] : ""
        }
        parsedTitle = getVal("title")
        parsedDate = getVal("date")
        parsedExcerpt = getVal("excerpt")
        parsedBanner = getVal("banner_image")
      }

      setTitle(parsedTitle)
      setSlug(filename.replace(".md", ""))
      setDate(parsedDate)
      setExcerpt(parsedExcerpt)
      setBannerImage(parsedBanner)
      setContent(bodyText)
      setEditingFile(filename)
      setView("form")
    }
    setLoading(false)
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`${filename} dosyasını silmek istediğinize emin misiniz?`)) return
    setLoading(true)
    await fetch("/api/github", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, action: "deleteFile", path: `content/blogs/${filename}` })
    })
    await fetchFiles()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const mdContent = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
banner_image: "${bannerImage}"
---

${content}`

    const newFilename = `${slug}.md`
    
    // If we changed the slug while editing, we should ideally delete the old one, but for simplicity let's assume we just create/update
    if (editingFile && editingFile !== newFilename) {
      await fetch("/api/github", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, action: "deleteFile", path: `content/blogs/${editingFile}` })
      })
    }

    await fetch("/api/github", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret, action: "saveFile", path: `content/blogs/${newFilename}`,
        message: `${editingFile ? 'Edit' : 'Add'} blog post: ${title}`,
        content: mdContent
      })
    })

    setIsSaving(false)
    setView("list")
    fetchFiles()
  }

  const openNewForm = () => {
    setTitle(""); setSlug(""); setDate(""); setExcerpt(""); setBannerImage(""); setContent("");
    setEditingFile(null); setView("form");
  }

  if (view === "form") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <button onClick={() => setView("list")} className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Listeye Dön
        </button>
        <form onSubmit={handleSave} className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Başlık</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if(!editingFile) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")) }} className="rounded-md border bg-background px-3 py-2 text-sm" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">URL (Slug)</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tarih (YYYY-MM-DD)</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Banner Görsel URL</label>
              <input type="url" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Kısa Özet (Excerpt)</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" rows={2} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">İçerik (Markdown)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[300px] rounded-md border bg-background px-3 py-2 text-sm font-mono" required />
          </div>
          <button type="submit" disabled={isSaving} className="mt-4 flex items-center justify-center rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
            {isSaving ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSaving ? "Kaydediliyor..." : "Kaydet ve Yayınla"}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Blog Yazıları</h2>
        <button onClick={openNewForm} className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="mr-2 h-4 w-4" /> Yeni Yazı
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Henüz hiç blog yazısı yok.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => (
            <motion.div key={f.name} layout className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-4 break-words font-medium">{f.name}</div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <button onClick={() => handleEdit(f.name)} className="flex items-center rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
                  <Edit2 className="mr-1.5 h-3 w-3" /> Düzenle
                </button>
                <button onClick={() => handleDelete(f.name)} className="flex items-center rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20">
                  <Trash2 className="mr-1.5 h-3 w-3" /> Sil
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileManager({ secret }: { secret: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const res = await fetch("/api/github", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, action: "getFile", path: "content/about.json" })
    })
    const json = await res.json()
    if (json.content) {
      try {
        setData(JSON.parse(json.content))
      } catch (e) {
        console.error("Invalid JSON", e)
      }
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await fetch("/api/github", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret, action: "saveFile", path: "content/about.json",
        message: "Update profile data",
        content: JSON.stringify(data, null, 2)
      })
    })
    setIsSaving(false)
    alert("Profil bilgileri başarıyla güncellendi!")
  }

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (!data) return <div className="py-12 text-center">about.json bulunamadı.</div>

  const updateField = (field: string, value: string) => setData({ ...data, [field]: value })

  const updateSocial = (index: number, field: string, value: string) => {
    const newSocials = [...data.socials]
    newSocials[index][field] = value
    setData({ ...data, socials: newSocials })
  }
  const addSocial = () => setData({ ...data, socials: [...(data.socials || []), { platform: "", url: "", icon: "github" }] })
  const removeSocial = (index: number) => setData({ ...data, socials: data.socials.filter((_: any, i: number) => i !== index) })

  const updateSkillGroup = (index: number, field: string, value: string | string[]) => {
    const newSkills = [...data.skills]
    newSkills[index][field] = value
    setData({ ...data, skills: newSkills })
  }
  const addSkillGroup = () => setData({ ...data, skills: [...(data.skills || []), { category: "Yeni Kategori", items: [] }] })
  const removeSkillGroup = (index: number) => setData({ ...data, skills: data.skills.filter((_: any, i: number) => i !== index) })

  return (
    <div className="animate-in fade-in flex flex-col gap-8 rounded-xl border bg-card p-6 shadow-sm">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">İsim Soyisim</label>
          <input type="text" value={data.name || ""} onChange={(e) => updateField("name", e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Ünvan</label>
          <input type="text" value={data.title || ""} onChange={(e) => updateField("title", e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Profil Resmi URL</label>
        <input type="url" value={data.avatar_url || ""} onChange={(e) => updateField("avatar_url", e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Biyografi</label>
        <textarea value={data.bio || ""} onChange={(e) => updateField("bio", e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" rows={4} />
      </div>

      <div className="border-t pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Sosyal Medya Linkleri</h3>
          <button onClick={addSocial} className="flex items-center text-sm font-medium text-primary hover:underline">
            <Plus className="mr-1 h-4 w-4" /> Ekle
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {data.socials?.map((social: any, i: number) => (
            <div key={i} className="flex items-start gap-4">
              <input type="text" placeholder="Platform" value={social.platform} onChange={(e) => updateSocial(i, "platform", e.target.value)} className="w-1/4 rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder="İkon (github, linkedin, twitter, mail)" value={social.icon} onChange={(e) => updateSocial(i, "icon", e.target.value)} className="w-1/4 rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="url" placeholder="URL" value={social.url} onChange={(e) => updateSocial(i, "url", e.target.value)} className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
              <button onClick={() => removeSocial(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Yetenekler (Skills)</h3>
          <button onClick={addSkillGroup} className="flex items-center text-sm font-medium text-primary hover:underline">
            <Plus className="mr-1 h-4 w-4" /> Kategori Ekle
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {data.skills?.map((group: any, i: number) => (
            <div key={i} className="relative flex flex-col gap-3 rounded-lg border bg-secondary/30 p-4">
              <button onClick={() => removeSkillGroup(i)} className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Kategori Adı</label>
                <input type="text" value={group.category} onChange={(e) => updateSkillGroup(i, "category", e.target.value)} className="rounded-md border bg-background px-2 py-1.5 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Yetenekler (Virgülle ayırın)</label>
                <textarea value={group.items.join(", ")} onChange={(e) => updateSkillGroup(i, "items", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} className="rounded-md border bg-background px-2 py-1.5 text-sm" rows={2} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={isSaving} className="mt-4 flex items-center justify-center rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
        {isSaving ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
        {isSaving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
      </button>
    </div>
  )
}
