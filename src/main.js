import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.scss'
import './assets/styles/tailwind.css'

// 启动 MSW Mock Server
import { startMockServer } from './mocks/browser'
startMockServer()

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Global Error:', err)
  console.error('Component:', vm)
  console.error('Error Info:', info)
}

// 安装插件
app.use(createPinia())
app.use(router)

// 挂载应用
const appInstance = app.mount('#app')

// 初始化主题
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
appStore.initApp()