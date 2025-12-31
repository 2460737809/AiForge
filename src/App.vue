<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import party from 'party-js'
import { usePartyStore } from '@/stores/party'

const partyStore = usePartyStore()
const { config, isGlobalEnabled } = storeToRefs(partyStore)

// 获取颜色数组
const getColors = () => {
  if (config.value.colorMode === 'fixed') {
    return [config.value.color]
  } else if (config.value.colorMode === 'gradient') {
    return ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']
  }
  return undefined // random mode
}

// 应用全局效果
const applyGlobalEffect = (event) => {
  if (!isGlobalEnabled.value || !config.value.enabled) return

  const colors = getColors()
  const options = colors ? { colors } : {}

  party.confetti(event, {
    count: config.value.particleCount,
    spread: config.value.spreadSpeed,
    size: config.value.particleSize,
    ...options
  })
}

// 添加或移除全局监听器
const updateGlobalListener = () => {
  if (isGlobalEnabled.value && config.value.enabled) {
    document.addEventListener('click', applyGlobalEffect)
  } else {
    document.removeEventListener('click', applyGlobalEffect)
  }
}

onMounted(() => {
  // 初始化 party.js
  party.settings.debug = false

  // 如果全局启用，注册全局监听器
  updateGlobalListener()
})

onUnmounted(() => {
  // 清理全局监听器
  document.removeEventListener('click', applyGlobalEffect)
})

// 监听全局启用状态变化，动态更新监听器
watch([isGlobalEnabled, () => config.value.enabled], () => {
  updateGlobalListener()
})
</script>

<style lang="scss">
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>