import type { EmailMeta } from '@/types'

const modules = import.meta.glob<{ meta: EmailMeta; default: unknown }>(
  '@/emails/*.vue',
  { eager: true },
)

interface EmailEntry {
  meta: EmailMeta
  component: unknown
}

const allEmails: EmailEntry[] = []

for (const [, mod] of Object.entries(modules)) {
  if (!mod.meta) continue
  allEmails.push({
    meta: mod.meta,
    component: mod.default,
  })
}

allEmails.sort(
  (a, b) => new Date(b.meta.sentAt).getTime() - new Date(a.meta.sentAt).getTime(),
)

export function useEmails() {
  const getAll = (): EmailMeta[] => allEmails.map((e) => e.meta)

  const getBySlug = (slug: string): EmailEntry | undefined =>
    allEmails.find((e) => e.meta.slug === slug)

  const getCount = (): number => allEmails.length

  return { getAll, getBySlug, getCount }
}
