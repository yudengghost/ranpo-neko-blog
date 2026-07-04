<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Application, Graphics, Container } from 'pixi.js'
import { useTheme } from '@/composables/useTheme'

const { currentScheme, colors } = useTheme()
const containerRef = ref<HTMLDivElement>()
let app: Application | null = null

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

function drawGrid(g: Graphics, w: number, h: number, spacing: number, color: number, alpha: number) {
  g.clear()
  for (let x = 0; x <= w; x += spacing) {
    g.moveTo(x, 0)
    g.lineTo(x, h)
  }
  for (let y = 0; y <= h; y += spacing) {
    g.moveTo(0, y)
    g.lineTo(w, y)
  }
  g.stroke({ width: 0.5, color, alpha })
}

function drawAccentLines(g: Graphics, w: number, h: number, color: number, alpha: number) {
  g.clear()
  const padding = 120

  // Corner-to-corner lines
  g.moveTo(padding, 0)
  g.lineTo(w, h - padding)

  g.moveTo(w - padding, 0)
  g.lineTo(0, h - padding)

  // Horizontal accent lines at golden ratio positions
  const gr = 1.618
  g.moveTo(0, h / gr)
  g.lineTo(w, h / gr)
  g.moveTo(0, h - h / gr)
  g.lineTo(w, h - h / gr)

  // Vertical accent lines
  g.moveTo(w / gr, 0)
  g.lineTo(w / gr, h)
  g.moveTo(w - w / gr, 0)
  g.lineTo(w - w / gr, h)

  g.stroke({ width: 0.3, color, alpha })
}

function drawOrnamentCircles(g: Graphics, w: number, h: number, color: number, alpha: number) {
  g.clear()
  const cx = w / 2
  const cy = h / 2
  const pad = 120
  const sizes = [Math.min(w, h) * 0.25, Math.min(w, h) * 0.35, Math.min(w, h) * 0.5]

  for (const r of sizes) {
    g.circle(cx, cy, r)
    g.stroke({ width: 0.3, color, alpha: alpha * 0.5 })
  }

  const cornerR = 60
  g.circle(pad, pad, cornerR)
  g.circle(w - pad, pad, cornerR)
  g.circle(pad, h - pad, cornerR)
  g.circle(w - pad, h - pad, cornerR)
  g.stroke({ width: 0.3, color, alpha: alpha * 0.3 })
}

onMounted(async () => {
  if (!containerRef.value) return

  app = new Application()
  await app.init({
    canvas: document.createElement('canvas'),
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  })

  containerRef.value.appendChild(app.canvas)

  const gridGraphics = new Graphics()
  const accentGraphics = new Graphics()
  const ornamentGraphics = new Graphics()
  const particlesLayer = new Container()

  app.stage.addChild(gridGraphics, accentGraphics, ornamentGraphics, particlesLayer)

  // Initial draw
  const { innerWidth: w, innerHeight: h } = window

  function drawAll() {
    const primaryColor = hexToNumber(colors.value.primary)
    const accentColor = hexToNumber(colors.value.accent)
    drawGrid(gridGraphics, window.innerWidth, window.innerHeight, 80, primaryColor, 0.06)
    drawAccentLines(accentGraphics, window.innerWidth, window.innerHeight, accentColor, 0.08)
    drawOrnamentCircles(ornamentGraphics, window.innerWidth, window.innerHeight, primaryColor, 0.08)
  }

  drawAll()

  // Create floating geometric particles
  interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    rotation: number
    rotSpeed: number
    type: 'circle' | 'diamond' | 'triangle'
    gfx: Graphics
  }

  const particles: Particle[] = []
  const PARTICLE_COUNT = 24

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const gfx = new Graphics()
    const types: Particle['type'][] = ['circle', 'diamond', 'triangle']
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 4 + 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.005,
      type: types[i % types.length]!,
      gfx,
    })
    particlesLayer.addChild(gfx)
  }

  // Mouse tracking for particle interaction
  let mouseX = w / 2
  let mouseY = h / 2
  let targetMouseX = mouseX
  let targetMouseY = mouseY

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX
    targetMouseY = e.clientY
  })

  // Resize handler
  const onResize = () => {
    drawAll()
  }
  window.addEventListener('resize', onResize)

  // Animation loop
  app.ticker.add(() => {
    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.03
    mouseY += (targetMouseY - mouseY) * 0.03

    const primaryColor = hexToNumber(colors.value.primary)
    const accentColor = hexToNumber(colors.value.accent)

    // Slow rotation of accent layer
    accentGraphics.rotation += 0.00008
    accentGraphics.position.set(w / 2, h / 2)
    accentGraphics.pivot.set(w / 2, h / 2)

    // Update particles
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.rotSpeed

      // Wrap around
      if (p.x < -20) p.x = window.innerWidth + 20
      if (p.x > window.innerWidth + 20) p.x = -20
      if (p.y < -20) p.y = window.innerHeight + 20
      if (p.y > window.innerHeight + 20) p.y = -20

      // Subtle mouse repulsion
      const dx = mouseX - p.x
      const dy = mouseY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 180) {
        const force = (1 - dist / 180) * 0.3
        p.x -= dx * force * 0.01
        p.y -= dy * force * 0.01
        p.vx += dx * force * 0.0005
        p.vy += dy * force * 0.0005
      }

      // Dampen velocity
      p.vx *= 0.999
      p.vy *= 0.999

      // Draw particle
      const g = p.gfx
      g.clear()
      g.rotation = p.rotation

      const color = p.type === 'circle' ? primaryColor : accentColor
      const alpha = dist < 180 ? 0.25 : 0.12

      if (p.type === 'circle') {
        g.circle(p.x, p.y, p.size)
        g.fill({ color, alpha })
      } else if (p.type === 'diamond') {
        g.moveTo(p.x, p.y - p.size)
        g.lineTo(p.x + p.size, p.y)
        g.lineTo(p.x, p.y + p.size)
        g.lineTo(p.x - p.size, p.y)
        g.closePath()
        g.stroke({ width: 0.5, color, alpha })
      } else {
        // triangle
        const r = p.size * 1.2
        g.moveTo(p.x, p.y - r)
        g.lineTo(p.x + r * 0.866, p.y + r * 0.5)
        g.lineTo(p.x - r * 0.866, p.y + r * 0.5)
        g.closePath()
        g.stroke({ width: 0.5, color, alpha })
      }
    }
  })

  // Theme change → redraw grid/lines with new colors
  watch(currentScheme, () => {
    drawAll()
  })
})

onUnmounted(() => {
  if (app) {
    app.destroy(true, { children: true })
    app = null
  }
})
</script>

<template>
  <div ref="containerRef" class="pixi-bg"></div>
</template>

<style scoped>
.pixi-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
</style>
