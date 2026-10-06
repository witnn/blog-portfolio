"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, X, Save, ArrowLeft, RefreshCw, FileText, UserCog, Lock, Sparkles } from "lucide-react"

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
      <div className="flex min-h-[75vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleLogin} className="glass-card border-gradient w-full max-w-md rounded-2xl p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Admin Paneli</h2>
              <p className="mt-1 text-sm text-muted-foreground">Devam etmek için gizli anahtarınızı girin</p>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Gizli Anahtar (Secret Key)"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="glow-btn relative rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="gradient-text">Admin</span> Paneli
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">İçeriklerinizi yönetin ve güncelleyin</p>
          </div>

          {/* Tab Buttons */}
          <div className="glass-card rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("blog")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === "blog"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <FileText className="h-4 w-4" />
              Blog
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <UserCog className="h-4 w-4" />
              Profil
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "blog" ? (
            <motion.div key="blog" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <BlogManager secret={secret} />
            </motion.div>
          ) : (
            <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <ProfileManager secret={secret} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*               BLOG MANAGER                 */
/* ═══════════════════════════════════════════ */

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

  /* ── FORM VIEW ── */
  if (view === "form") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => setView("list")} className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Listeye Dön
        </button>
        <form onSubmit={handleSave} className="glass-card border-gradient rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Başlık</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if(!editingFile) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")) }} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground">URL (Slug)</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Tarih</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground">Banner Görsel URL</label>
              <input type="url" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-muted-foreground">Kısa Özet (Excerpt)</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" rows={2} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-muted-foreground">İçerik (Markdown)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="glass-input min-h-[300px] rounded-xl px-4 py-3 text-sm font-mono text-foreground focus:outline-none" required />
          </div>
          <button type="submit" disabled={isSaving} className="glow-btn mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-white disabled:opacity-50">
            {isSaving ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSaving ? "Kaydediliyor..." : "Kaydet ve Yayınla"}
          </button>
        </form>
      </motion.div>
    )
  }

  /* ── LIST VIEW ── */
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Blog Yazıları</h2>
        <button onClick={openNewForm} className="glow-btn flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Yeni Yazı
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
      ) : files.length === 0 ? (
        <div className="glass-card border-gradient rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary/50" />
          <p className="text-muted-foreground">Henüz hiç blog yazısı yok.</p>
          <p className="mt-1 text-sm text-muted-foreground/60">Sağ üstteki butona basarak ilk yazınızı oluşturun!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f, idx) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card border-gradient flex flex-col justify-between rounded-2xl p-5"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <p className="break-all text-sm font-medium leading-snug">{f.name}</p>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                <button onClick={() => handleEdit(f.name)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground">
                  <Edit2 className="h-3 w-3" /> Düzenle
                </button>
                <button onClick={() => handleDelete(f.name)} className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3" /> Sil
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*             PROFILE MANAGER                */
/* ═══════════════════════════════════════════ */

function ProfileManager({ secret }: { secret: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

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
    setSuccessMsg("")
    await fetch("/api/github", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret, action: "saveFile", path: "content/about.json",
        message: "Update profile data",
        content: JSON.stringify(data, null, 2)
      })
    })
    setIsSaving(false)
    setSuccessMsg("Profil bilgileri başarıyla güncellendi!")
    setTimeout(() => setSuccessMsg(""), 4000)
  }

  if (loading) return <div className="flex justify-center py-16"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
  if (!data) return <div className="py-12 text-center text-muted-foreground">about.json bulunamadı.</div>

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
    <div className="flex flex-col gap-8">
      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card border-gradient flex items-center gap-3 rounded-xl p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
              <Sparkles className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-sm font-medium text-green-400">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Info Card */}
      <div className="glass-card border-gradient rounded-2xl p-6 sm:p-8">
        <h3 className="mb-6 text-lg font-bold gradient-text">Kişisel Bilgiler</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">İsim Soyisim</label>
            <input type="text" value={data.name || ""} onChange={(e) => updateField("name", e.target.value)} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ünvan</label>
            <input type="text" value={data.title || ""} onChange={(e) => updateField("title", e.target.value)} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profil Resmi URL</label>
          <input type="url" value={data.avatar_url || ""} onChange={(e) => updateField("avatar_url", e.target.value)} className="glass-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none" />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Biyografi</label>
          <textarea value={data.bio || ""} onChange={(e) => updateField("bio", e.target.value)} className="glass-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" rows={4} />
        </div>
      </div>

      {/* Social Links Card */}
      <div className="glass-card border-gradient rounded-2xl p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold gradient-text">Sosyal Medya</h3>
          <button onClick={addSocial} className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10">
            <Plus className="h-3.5 w-3.5" /> Ekle
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {data.socials?.map((social: any, i: number) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <input type="text" placeholder="Platform" value={social.platform} onChange={(e) => updateSocial(i, "platform", e.target.value)} className="glass-input w-1/4 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" />
              <input type="text" placeholder="İkon" value={social.icon} onChange={(e) => updateSocial(i, "icon", e.target.value)} className="glass-input w-1/4 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" />
              <input type="url" placeholder="URL" value={social.url} onChange={(e) => updateSocial(i, "url", e.target.value)} className="glass-input flex-1 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" />
              <button onClick={() => removeSocial(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-destructive/20 text-destructive transition-colors hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Card */}
      <div className="glass-card border-gradient rounded-2xl p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold gradient-text">Yetenekler (Skills)</h3>
          <button onClick={addSkillGroup} className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10">
            <Plus className="h-3.5 w-3.5" /> Kategori Ekle
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.skills?.map((group: any, i: number) => (
            <div key={i} className="relative flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <button onClick={() => removeSkillGroup(i)} className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategori</label>
                <input type="text" value={group.category} onChange={(e) => updateSkillGroup(i, "category", e.target.value)} className="glass-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Yetenekler (Virgülle ayırın)</label>
                <textarea value={group.items.join(", ")} onChange={(e) => updateSkillGroup(i, "items", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} className="glass-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none" rows={2} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={isSaving} className="glow-btn flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-white disabled:opacity-50">
        {isSaving ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
        {isSaving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
      </button>
    </div>
  )
}
