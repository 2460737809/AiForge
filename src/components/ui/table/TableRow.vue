<script setup>
const props = defineProps({
  class: String
})
</script>

<template>
  <tr
    :class="['border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', props.class]"
  >
    <slot />
  </tr>
</template>
