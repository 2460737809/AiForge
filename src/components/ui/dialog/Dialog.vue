<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  defaultOpen: {
    type: Boolean,
    default: false
  },
  modal: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['update:open'])

const open = useVModel(props, 'open', emits, {
  passive: true,
  defaultValue: props.defaultOpen
})

watch(open, async (isOpen) => {
  if (isOpen) {
    if (props.modal) {
      document.body.style.setProperty('pointer-events', 'none')
      document.body.style.setProperty('padding-right', `${window.innerWidth - document.documentElement.clientWidth}px`)
    } else {
      document.body.style.removeProperty('pointer-events')
      document.body.style.removeProperty('padding-right')
    }
  } else {
    document.body.style.removeProperty('pointer-events')
    document.body.style.removeProperty('padding-right')
  }
})

onUnmounted(() => {
  document.body.style.removeProperty('pointer-events')
  document.body.style.removeProperty('padding-right')
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/80"
        @click="open = false"
      />
    </Transition>
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
        style="pointer-events: auto;"
        @click.stop
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
