<script setup>
const props = defineProps({
  class: String
})
</script>

<template>
  <div :class="['flex flex-col space-y-1.5 p-6', props.class]">
    <slot />
  </div>
</template>
