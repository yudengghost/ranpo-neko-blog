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
  transition: background-color 0.6s ease;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-line {
  width: 60px;
  height: 1px;
  background: var(--color-border);
  margin: 0 auto 24px;
  transition: background-color 0.6s ease;
}

.footer-text {
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-textMuted);
  letter-spacing: 0.03em;
  transition: color 0.6s ease;
}

.footer-link {
  display: inline-block;
  margin-top: 8px;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-textMuted);
  text-decoration: none;
  letter-spacing: 0.03em;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}
</style>
