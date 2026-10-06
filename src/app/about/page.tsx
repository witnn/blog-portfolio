import { getAboutData } from "@/lib/api"
import { Globe, Mail, Link as LinkIcon, User } from "lucide-react"

export default function AboutPage() {
  const data = getAboutData()

  const IconMap: Record<string, React.ElementType> = {
    github: Globe,
    linkedin: LinkIcon,
    twitter: User,
    mail: Mail,
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
      {/* Hero Profile Card */}
      <div className="glass-card border-gradient rounded-3xl p-8 sm:p-12 mb-16">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          {/* Avatar with glow ring */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-50 blur-md" />
            <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-white/10 sm:h-48 sm:w-48">
              {data.avatar_url ? (
                <img src={data.avatar_url} alt={data.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/30 to-accent/30" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              ✦ Hakkımda
            </p>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {data.name}
            </h1>
            <p className="mb-4 text-lg font-medium text-muted-foreground">
              {data.title}
            </p>

            {/* Social Buttons */}
            <div className="flex gap-3">
              {data.socials?.map((social, i) => {
                const Icon = IconMap[social.icon] || Mail
                return (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_15px_hsla(265,90%,60%,0.2)]"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    <span className="sr-only">{social.platform}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mb-16 w-full">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          <span className="gradient-text">Biyografi</span>
        </h2>
        <div className="glass-card border-gradient rounded-2xl p-6 sm:p-8">
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {data.bio}
          </p>
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <h2 className="mb-8 text-2xl font-bold tracking-tight">
          <span className="gradient-text">Yetenekler</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.skills?.map((skillGroup, idx) => (
            <div
              key={idx}
              className="glass-card border-gradient rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_hsla(265,90%,60%,0.1)] hover:-translate-y-1"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <div className="h-3 w-3 rounded-sm bg-primary" />
                </div>
                <h3 className="text-lg font-bold">{skillGroup.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((item, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
