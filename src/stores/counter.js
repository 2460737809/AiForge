import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // 状态
  const count = ref(0)
  const history = ref([])

  // 计算属性
  const doubleCount = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)
  const isOdd = computed(() => !isEven.value)

  // 方法
  const increment = (amount = 1) => {
    const oldValue = count.value
    count.value += amount
    addToHistory(oldValue, count.value, 'increment')
  }

  const decrement = (amount = 1) => {
    const oldValue = count.value
    count.value -= amount
    addToHistory(oldValue, count.value, 'decrement')
  }

  const reset = () => {
    const oldValue = count.value
    count.value = 0
    addToHistory(oldValue, count.value, 'reset')
  }

  const setValue = (value) => {
    const oldValue = count.value
    count.value = value
    addToHistory(oldValue, count.value, 'set')
  }

  const addToHistory = (oldValue, newValue, action) => {
    history.value.unshift({
      oldValue,
      newValue,
      action,
      timestamp: new Date().toISOString()
    })
    
    // 限制历史记录数量
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }
  }

  const clearHistory = () => {
    history.value = []
  }

  return {
    // 状态
    count,
    history,
    
    // 计算属性
    doubleCount,
    isEven,
    isOdd,
    
    // 方法
    increment,
    decrement,
    reset,
    setValue,
    clearHistory
  }
})