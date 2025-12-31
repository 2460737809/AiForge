<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div
    :class="cn('grid gap-4', props.class)"
    class="relative"
  >
    <slot />
  </div>
</template>
