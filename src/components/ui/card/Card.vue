<script setup>
const props = defineProps({
  class: String
})
</script>

<template>
  <div
    :class="['rounded-xl border bg-card text-card-foreground shadow', props.class]"
  >
    <slot />
  </div>
</template>
