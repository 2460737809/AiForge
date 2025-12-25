<template>
  <div class="demo">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">功能演示</h1>
        <p class="page-subtitle">展示项目的各种功能和特性</p>
      </header>

      <main class="page-content">
        <!-- 状态管理演示 -->
        <section class="demo-section">
          <h2 class="section-title">状态管理 (Pinia)</h2>
          <div class="demo-card">
            <div class="counter-demo">
              <h3>计数器示例</h3>
              <div class="counter-display">
                <span class="count">{{ counterStore.count }}</span>
                <span class="double-count">双倍: {{ counterStore.doubleCount }}</span>
              </div>
              <div class="counter-controls">
                <button class="btn btn-primary" @click="counterStore.increment()">
                  +1
                </button>
                <button class="btn btn-secondary" @click="counterStore.decrement()">
                  -1
                </button>
                <button class="btn btn-warning" @click="counterStore.reset()">
                  重置
                </button>
                <button class="btn btn-info" @click="counterStore.increment(5)">
                  +5
                </button>
              </div>
              <div class="counter-info">
                <p>状态: {{ counterStore.isEven ? '偶数' : '奇数' }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- API请求演示 -->
        <section class="demo-section">
          <h2 class="section-title">API 请求 (Axios)</h2>
          <div class="demo-card">
            <div class="api-demo">
              <h3>HTTP 请求示例</h3>
              <div class="api-controls">
                <button class="btn btn-primary" @click="testGetRequest" :disabled="loading">
                  {{ loading ? '请求中...' : 'GET 请求' }}
                </button>
                <button class="btn btn-success" @click="testPostRequest" :disabled="loading">
                  {{ loading ? '请求中...' : 'POST 请求' }}
                </button>
                <button class="btn btn-warning" @click="testErrorRequest" :disabled="loading">
                  {{ loading ? '请求中...' : '错误请求' }}
                </button>
              </div>
              <div class="api-result" v-if="apiResult">
                <h4>响应结果:</h4>
                <pre><code>{{ JSON.stringify(apiResult, null, 2) }}</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- 主题切换演示 -->
        <section class="demo-section">
          <h2 class="section-title">主题切换</h2>
          <div class="demo-card">
            <div class="theme-demo">
              <h3>深色/浅色主题</h3>
              <div class="theme-controls">
                <button 
                  class="btn" 
                  :class="appStore.theme === 'light' ? 'btn-primary' : 'btn-secondary'"
                  @click="appStore.setTheme('light')"
                >
                  ☀️ 浅色主题
                </button>
                <button 
                  class="btn" 
                  :class="appStore.theme === 'dark' ? 'btn-primary' : 'btn-secondary'"
                  @click="appStore.setTheme('dark')"
                >
                  🌙 深色主题
                </button>
              </div>
              <div class="theme-info">
                <p>当前主题: {{ appStore.theme === 'dark' ? '深色' : '浅色' }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 响应式设计演示 -->
        <section class="demo-section">
          <h2 class="section-title">响应式设计</h2>
          <div class="demo-card">
            <div class="responsive-demo">
              <h3>设备类型检测</h3>
              <div class="device-info">
                <p>当前设备: {{ getDeviceType() }}</p>
                <p>屏幕宽度: {{ screenWidth }}px</p>
                <p>是否移动端: {{ appStore.isMobile ? '是' : '否' }}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCounterStore } from '@/stores/counter'
import { useAppStore } from '@/stores/app'
import { request } from '@/utils/request'

const counterStore = useCounterStore()
const appStore = useAppStore()

const loading = ref(false)
const apiResult = ref(null)
const screenWidth = ref(window.innerWidth)

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

const getDeviceType = () => {
  if (screenWidth.value < 768) return '移动端'
  if (screenWidth.value < 1024) return '平板'
  return '桌面端'
}

// 测试 GET 请求
const testGetRequest = async () => {
  loading.value = true
  try {
    const response = await request.get('/api/test', { page: 1, size: 10 })
    apiResult.value = {
      type: 'GET',
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    apiResult.value = {
      type: 'GET',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  } finally {
    loading.value = false
  }
}

// 测试 POST 请求
const testPostRequest = async () => {
  loading.value = true
  try {
    const response = await request.post('/api/test', {
      name: 'Vue3 Demo',
      description: '这是一个测试请求'
    })
    apiResult.value = {
      type: 'POST',
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    apiResult.value = {
      type: 'POST',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  } finally {
    loading.value = false
  }
}

// 测试错误请求
const testErrorRequest = async () => {
  loading.value = true
  try {
    await request.get('/api/error-endpoint')
  } catch (error) {
    apiResult.value = {
      type: 'ERROR',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
</script>

<style lang="scss" scoped>
.demo {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  
  .page-title {
    font-size: 2.5rem;
    color: var(--text-primary);
    margin-bottom: 16px;
    font-weight: 700;
  }
  
  .page-subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
  }
}

.page-content {
  display: grid;
  gap: 40px;
}

.demo-section {
  .section-title {
    font-size: 1.8rem;
    color: var(--text-primary);
    margin-bottom: 24px;
    font-weight: 600;
  }
}

.demo-card {
  background: var(--bg-white);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

// 计数器样式
.counter-demo {
  text-align: center;
  
  h3 {
    margin-bottom: 24px;
    color: var(--text-primary);
  }
  
  .counter-display {
    margin-bottom: 24px;
    
    .count {
      display: block;
      font-size: 4rem;
      font-weight: bold;
      color: var(--primary-color);
      margin-bottom: 8px;
    }
    
    .double-count {
      font-size: 1.2rem;
      color: var(--text-secondary);
    }
  }
  
  .counter-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .counter-info {
    color: var(--text-regular);
  }
}

// API 演示样式
.api-demo {
  h3 {
    margin-bottom: 24px;
    color: var(--text-primary);
  }
  
  .api-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  
  .api-result {
    margin-top: 24px;
    
    h4 {
      margin-bottom: 12px;
      color: var(--text-primary);
    }
    
    pre {
      background: #f6f8fa;
      border: 1px solid var(--border-base);
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      font-size: 0.9rem;
      line-height: 1.5;
      max-height: 300px;
      overflow-y: auto;
      
      code {
        color: var(--text-primary);
      }
    }
  }
}

// 主题演示样式
.theme-demo {
  text-align: center;
  
  h3 {
    margin-bottom: 24px;
    color: var(--text-primary);
  }
  
  .theme-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .theme-info {
    color: var(--text-regular);
  }
}

// 响应式演示样式
.responsive-demo {
  h3 {
    margin-bottom: 24px;
    color: var(--text-primary);
  }
  
  .device-info {
    p {
      margin-bottom: 12px;
      color: var(--text-regular);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 按钮样式
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.btn-primary {
    background: var(--primary-color);
    color: white;
    
    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary-color) 80%, black);
    }
  }
  
  &.btn-secondary {
    background: var(--text-secondary);
    color: white;
    
    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--text-secondary) 80%, black);
    }
  }
  
  &.btn-success {
    background: var(--success-color);
    color: white;
    
    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--success-color) 80%, black);
    }
  }
  
  &.btn-warning {
    background: var(--warning-color);
    color: white;
    
    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--warning-color) 80%, black);
    }
  }
  
  &.btn-info {
    background: var(--info-color);
    color: white;
    
    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--info-color) 80%, black);
    }
  }
}

@media (max-width: 768px) {
  .demo {
    padding: 20px 16px;
  }
  
  .page-header .page-title {
    font-size: 2rem;
  }
  
  .demo-card {
    padding: 20px;
  }
  
  .counter-display .count {
    font-size: 3rem;
  }
  
  .counter-controls,
  .api-controls,
  .theme-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>