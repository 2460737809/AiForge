<script setup>
import { provide, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

provide('radio-group', {
  modelValue: value,
  disabled: props.disabled,
  updateValue: (val) => {
    emit('update:modelValue', val)
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <slot />
  </div>
</template>
