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
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
        {/* Profile Image & Basic Info */}
        <div className="flex flex-col items-center md:items-start md:w-1/3">
          <div className="mb-6 overflow-hidden rounded-full border-4 border-muted w-48 h-48 sm:w-56 sm:h-56">
            {data.avatar_url ? (
              <img
                src={data.avatar_url}
                alt={data.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-secondary" />
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-center md:text-left">
            {data.name}
          </h1>
          <p className="mt-2 text-xl font-medium text-muted-foreground text-center md:text-left">
            {data.title}
          </p>
          
          <div className="mt-6 flex gap-4">
            {data.socials?.map((social, i) => {
              const Icon = IconMap[social.icon] || Mail
              return (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{social.platform}</span>
                </a>
              )
            })}
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="flex-1 space-y-12">
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 border-b pb-2">Hakkımda</h2>
            <div className="prose prose-neutral dark:prose-invert">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {data.bio}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6 border-b pb-2">Yetenekler</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {data.skills?.map((skillGroup, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <h3 className="mb-4 text-lg font-semibold">{skillGroup.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((item, itemIdx) => (
                      <span
                        key={itemIdx}
                        className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-sm font-medium text-secondary-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
