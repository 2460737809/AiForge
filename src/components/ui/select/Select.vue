<script setup>
import { computed, ref, watch } from 'vue'
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectViewport, SelectItem, SelectItemIndicator, SelectScrollUpButton, SelectScrollDownButton } from 'radix-vue'
import { Check, ChevronUp, ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: [String, Number, Array],
  defaultValue: [String, Number, Array],
  disabled: Boolean,
  name: String,
  placeholder: String,
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)
const open = ref(false)

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

// 监听内部值变化,触发更新事件
watch(internalValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const displayValue = computed(() => {
  if (!internalValue.value) return props.placeholder
  const option = props.options.find(opt => opt.value === internalValue.value)
  return option ? option.label : internalValue.value
})
</script>

<template>
  <div class="relative">
    <SelectRoot
      :model-value="internalValue"
      :default-value="defaultValue"
      :disabled="disabled"
      :name="name"
      v-model:open="open"
      @update:model-value="internalValue = $event"
    >
      <SelectTrigger
        class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        style="--radix-select-trigger-width: 100%"
      >
        <SelectValue
          :placeholder="placeholder"
          class="data-[placeholder]:text-muted-foreground"
        >
          {{ displayValue }}
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        class="relative z-50 max-h-96 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        position="popper"
        align="start"
        :side-offset="4"
      >
        <SelectScrollUpButton
          class="flex cursor-default items-center justify-center py-1"
        >
          <ChevronUp class="h-4 w-4" />
        </SelectScrollUpButton>

        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <span class="flex flex-1 items-center">
              {{ option.label }}
            </span>

            <span class="flex h-3.5 w-3.5 items-center justify-center">
              <SelectItemIndicator>
                <Check class="h-4 w-4" />
              </SelectItemIndicator>
            </span>
          </SelectItem>
        </SelectViewport>

        <SelectScrollDownButton
          class="flex cursor-default items-center justify-center py-1"
        >
          <ChevronDown class="h-4 w-4" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectRoot>
  </div>
</template>

<style scoped>
/* Custom scrollbar for SelectContent */
:deep([data-radix-select-content])::-webkit-scrollbar {
  width: 6px;
}

:deep([data-radix-select-content])::-webkit-scrollbar-track {
  background: transparent;
}

:deep([data-radix-select-content])::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted));
  border-radius: 3px;
}

:deep([data-radix-select-content])::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--muted-foreground) / 0.5);
}
</style>

