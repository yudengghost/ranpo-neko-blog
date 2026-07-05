export function useSEO(options: {
  title: string
  description?: string
  image?: string
  type?: 'website' | 'article'
}) {
  document.title = options.title

  const setMeta = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  const setName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  if (options.description) {
    setName('description', options.description)
    setMeta('og:description', options.description)
  }
  if (options.image) {
    setMeta('og:image', options.image)
  } else {
    const el = document.querySelector('meta[property="og:image"]')
    if (el) el.remove()
  }
  setMeta('og:title', options.title)
  setMeta('og:type', options.type || 'website')
}
