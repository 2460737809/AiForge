<script setup>
defineProps({
  modelValue: [String, Number],
  defaultValue: [String, Number],
  disabled: Boolean,
  name: String
})

const emit = defineEmits(['update:modelValue'])

function onChange(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <select
    :name="name"
    :disabled="disabled"
    :value="modelValue"
    @change="onChange"
    class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
  >
    <slot></slot>
  </select>
</template>
