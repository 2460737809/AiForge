<script setup>
const props = defineProps({
  class: String
})
</script>

<template>
  <h3 :class="['font-semibold leading-none tracking-tight', props.class]">
    <slot />
  </h3>
</template>
