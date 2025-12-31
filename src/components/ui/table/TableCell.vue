<script setup>
const props = defineProps({
  class: String
})
</script>

<template>
  <td
    :class="['p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', props.class]"
  >
    <slot />
  </td>
</template>
