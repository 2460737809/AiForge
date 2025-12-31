<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const radioGroup = inject('radio-group', {
  modelValue: computed(() => null),
  disabled: false,
  updateValue: () => {}
})

const isChecked = computed(() => radioGroup.modelValue.value === props.value)
const isDisabled = computed(() => props.disabled || radioGroup.disabled)

function handleChange() {
  if (!isDisabled.value) {
    radioGroup.updateValue(props.value)
  }
}
</script>

<template>
  <label
    class="flex items-center gap-2 cursor-pointer"
    :class="{ 'opacity-50 cursor-not-allowed': isDisabled }"
  >
    <input
      :checked="isChecked"
      :disabled="isDisabled"
      type="radio"
      :value="value"
      class="w-4 h-4 border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      @change="handleChange"
    />
    <slot />
  </label>
</template>
