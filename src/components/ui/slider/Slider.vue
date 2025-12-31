<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event) => {
  const value = parseFloat(event.target.value)
  emit('update:modelValue', value)
}

// 计算进度百分比
const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

// 生成渐变背景
const backgroundStyle = computed(() => {
  return {
    background: `linear-gradient(to right, hsl(var(--primary) / 0.7) 0%, hsl(var(--primary) / 0.7) ${percentage.value}%, #d4d4d8 ${percentage.value}%, #d4d4d8 100%)`
  }
})
</script>

<template>
  <div class="relative w-full">
    <input
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      type="range"
      :style="backgroundStyle"
      class="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      @input="updateValue"
    />
  </div>
</template>
