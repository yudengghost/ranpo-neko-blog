<template>
  <svg
    class="mail-icon"
    width="22"
    height="18"
    viewBox="0 0 22 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Envelope body -->
    <rect
      x="0.5"
      y="0.5"
      width="21"
      height="17"
      rx="2"
      stroke="currentColor"
      stroke-width="1.2"
    />
    <!-- Flap -->
    <polyline
      points="0.5,0.5 11,10 21.5,0.5"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linejoin="round"
    />
    <!-- Lower crease hint -->
    <line
      x1="0.5" y1="10"
      x2="11"  y2="17.5"
      stroke="currentColor"
      stroke-width="0.6"
      opacity="0.4"
    />
    <line
      x1="21.5" y1="10"
      x2="11"   y2="17.5"
      stroke="currentColor"
      stroke-width="0.6"
      opacity="0.4"
    />
  </svg>
</template>

<style scoped>
.mail-icon {
  display: block;
  color: var(--color-textMuted);
  transition: color 0.25s ease, transform 0.25s ease;
  cursor: pointer;
}
.mail-icon:hover {
  color: var(--color-primary);
  transform: scale(1.08);
}
</style>
