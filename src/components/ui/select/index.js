import { defineAsyncComponent } from 'vue'

// Export the main Select component
export { default as Select } from './Select.vue'

// For more granular control, you can also export individual Radix Vue components
export { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from 'radix-vue'
