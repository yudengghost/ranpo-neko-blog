<script setup lang="ts">
</script>

<template>
  <div class="skeleton-card">
    <div class="skel-cover"></div>
    <div class="skel-body">
      <div class="skel-line skel-cat"></div>
      <div class="skel-line skel-title"></div>
      <div class="skel-line skel-excerpt"></div>
      <div class="skel-line skel-meta"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: row;
  border: 1px solid var(--color-borderLight);
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-surface);
  transition: background-color 0.6s ease, border-color 0.6s ease;
}

.skel-cover {
  width: 320px;
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
  background: linear-gradient(
    120deg,
    var(--color-bgAlt) 0%,
    var(--color-surfaceHover) 40%,
    var(--color-bgAlt) 80%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skel-body {
  flex: 1;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  min-width: 0;
}

.skel-line {
  border-radius: 4px;
  background: linear-gradient(
    120deg,
    var(--color-bgAlt) 0%,
    var(--color-surfaceHover) 40%,
    var(--color-bgAlt) 80%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skel-cat {
  width: 60px;
  height: 12px;
}

.skel-title {
  width: 70%;
  height: 22px;
  animation-delay: 0.05s;
}

.skel-excerpt {
  width: 90%;
  height: 14px;
  animation-delay: 0.1s;
}

.skel-meta {
  width: 45%;
  height: 12px;
  animation-delay: 0.15s;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 700px) {
  .skeleton-card {
    flex-direction: column;
  }
  .skel-cover {
    width: 100%;
    max-height: 200px;
  }
}
</style>
