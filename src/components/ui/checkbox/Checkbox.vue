<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const checked = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function handleChange(event) {
  emit('update:modelValue', event.target.checked)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      :checked="checked"
      :disabled="disabled"
      type="checkbox"
      class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      @change="handleChange"
    />
    <slot />
  </div>
</template>
