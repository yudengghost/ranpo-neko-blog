import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const FONTS_DIR = join(import.meta.dirname, '../public/fonts')

const FONTS = {
  'Playfair Display': {
    weights: [300, 400, 500, 600],
    styles: ['normal', 'italic'],
  },
  'Work Sans': {
    weights: [200, 300, 400],
    styles: ['normal'],
  },
  'JetBrains Mono': {
    weights: [400],
    styles: ['normal'],
  },
}

async function downloadFont(family, weight, style) {
  const familyParam = encodeURIComponent(family)
  // Build per-weight/style query to get individual woff2 files
  const wghtParam = style === 'italic' ? `1,${weight}` : `0,${weight}`
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@${wghtParam}&display=swap`

  const cssResp = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
    },
  })
  const css = await cssResp.text()

  // Extract woff2 URL (Google Fonts serves woff2 to modern Chrome UA)
  const urlMatch = css.match(/url\((https:\/\/[^)]+\.woff2)\)/)
  if (!urlMatch) {
    console.warn(`SKIP (no woff2): ${family} ${weight} ${style}`)
    return null
  }

  const fontResp = await fetch(urlMatch[1])
  if (!fontResp.ok) {
    console.warn(`SKIP (HTTP ${fontResp.status}): ${family} ${weight} ${style}`)
    return null
  }

  const buffer = Buffer.from(await fontResp.arrayBuffer())
  const slug = family.toLowerCase().replace(/\s+/g, '-')
  const styleSuffix = style === 'italic' ? '-italic' : ''
  const filename = `${slug}-${weight}${styleSuffix}.woff2`

  await writeFile(join(FONTS_DIR, filename), buffer)
  console.log(`OK: ${filename}  (${(buffer.length / 1024).toFixed(1)} KB)`)
  return { filename, weight, style }
}

async function main() {
  console.log('Downloading fonts...\n')

  for (const [family, config] of Object.entries(FONTS)) {
    console.log(`── ${family} ──`)
    for (const weight of config.weights) {
      for (const style of config.styles) {
        await downloadFont(family, weight, style)
      }
    }
  }

  console.log('\nDone.')
}

main()
