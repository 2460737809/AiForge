<script setup>
const props = defineProps({
  class: String
})
</script>

<template>
  <p :class="['text-sm text-muted-foreground', props.class]">
    <slot />
  </p>
</template>
