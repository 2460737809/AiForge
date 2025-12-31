import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref('light') // light | dark
  const loading = ref(false)
  const sidebarCollapsed = ref(false)
  const device = ref('desktop') // desktop | mobile | tablet

  // 计算属性
  const isDarkTheme = computed(() => theme.value === 'dark')
  const isMobile = computed(() => device.value === 'mobile')

  // 方法
  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)

    // 更新DOM
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }

    // 通知vantajs更新主题
    if (window.updateVantaTheme) {
      window.updateVantaTheme()
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }))
  }

  const setLoading = (status) => {
    loading.value = status
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setDevice = (deviceType) => {
    device.value = deviceType
  }

  const initApp = () => {
    // 从本地存储恢复主题
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // 检测设备类型
    const checkDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDevice('mobile')
      } else if (width < 1024) {
        setDevice('tablet')
      } else {
        setDevice('desktop')
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
  }

  return {
    // 状态
    theme,
    loading,
    sidebarCollapsed,
    device,
    
    // 计算属性
    isDarkTheme,
    isMobile,
    
    // 方法
    setTheme,
    setLoading,
    toggleSidebar,
    setDevice,
    initApp
  }
})