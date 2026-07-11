<script setup lang="ts">
import { siteConfig } from '@/config'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-line"></div>
      <p class="footer-text">
        &copy; {{ year }} {{ siteConfig.author }} &mdash; {{ siteConfig.footerText }}
      </p>
      <a :href="siteConfig.github" target="_blank" rel="noopener" class="footer-link">GitHub</a>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  z-index: 1;
  padding: 48px 24px 32px;
  background: var(--color-bg);
  border-top: var(--border-width, 1px) var(--border-style, solid) var(--header-border, var(--color-borderLight));
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-line {
  width: 60px;
  height: var(--border-width, 1px);
  background: var(--color-border);
  margin: 0 auto 24px;
  transition: background-color 0.6s ease;
}

[data-visual-style='brutalist'] .footer-line {
  height: 4px;
  width: 100px;
}

[data-visual-style='retro-futurism'] .footer-line {
  box-shadow: 0 0 6px var(--color-glow);
}

.footer-text {
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--color-textMuted);
  letter-spacing: 0.03em;
  transition: color 0.6s ease;
}

[data-visual-style='brutalist'] .footer-text {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.footer-link {
  display: inline-block;
  margin-top: 8px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--color-textMuted);
  text-decoration: none;
  letter-spacing: 0.03em;
  transition: color 0.3s ease;
}

[data-visual-style='brutalist'] .footer-link {
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
}

.footer-link:hover {
  color: var(--color-primary);
}

[data-visual-style='retro-futurism'] .footer-link:hover {
  text-shadow: 0 0 8px var(--color-glow);
}
</style>
