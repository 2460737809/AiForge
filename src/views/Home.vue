<template>
  <div class="home">
    <div class="container">
      <header class="header">
        <h1 class="title">{{ appTitle }}</h1>
        <p class="subtitle">基于 Vite + Vue3 + TypeScript 的现代前端项目模板</p>
      </header>

      <main class="main">
        <section class="features">
          <h2 class="section-title">项目特性</h2>
          <div class="feature-grid">
            <div
              v-for="feature in features"
              :key="feature.id"
              class="feature-card"
              :class="{ 'clickable': feature.clickable }"
              @click="feature.clickable ? router.push(feature.link) : null"
            >
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </section>

        <section class="environment">
          <h2 class="section-title">环境信息</h2>
          <div class="env-info">
            <div class="env-item">
              <span class="env-label">运行环境:</span>
              <span class="env-value">{{ envConfig.mode }}</span>
            </div>
            <div class="env-item">
              <span class="env-label">API地址:</span>
              <span class="env-value">{{ envConfig.apiBaseUrl }}</span>
            </div>
            <div class="env-item">
              <span class="env-label">应用标题:</span>
              <span class="env-value">{{ envConfig.appTitle }}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { envConfig } from '@/utils/env'

const router = useRouter()
const appTitle = ref('Vue3 Vite Project')

const features = ref([
  {
    id: 1,
    icon: '⚡',
    title: '极速开发',
    description: '基于 Vite 构建，享受闪电般的开发体验'
  },
  {
    id: 2,
    icon: '🎨',
    title: '现代UI',
    description: '组件化设计，支持主题定制和响应式布局'
  },
  {
    id: 3,
    icon: '🚀',
    title: '性能优化',
    description: '代码分割、懒加载、Tree Shaking等优化策略'
  },
  {
    id: 4,
    icon: '🔧',
    title: '开发工具',
    description: 'ESLint、Prettier、TypeScript等工具链支持'
  },
  {
    id: 5,
    icon: '📱',
    title: '移动端适配',
    description: '响应式设计，完美支持移动端和桌面端'
  },
  {
    id: 6,
    icon: '♟️',
    title: '中国象棋',
    description: '在线象棋对弈，支持完整规则和棋谱记录',
    link: '/chess',
    clickable: true
  },
  {
    id: 7,
    icon: '⚪⚫',
    title: '五子棋',
    description: '经典五子棋游戏，支持人机对战和人人对战',
    link: '/gomoku',
    clickable: true
  },
  {
    id: 8,
    icon: '🌐',
    title: '国际化',
    description: '内置i18n支持，轻松实现多语言切换'
  }
])

onMounted(() => {
  console.log('Home page mounted')
  console.log('Environment config:', envConfig)
})
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 60px;
  
  .title {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 16px;
    opacity: 0;
    animation: fadeIn 0.6s ease-in-out forwards;
  }
  
  .subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    transform: translateY(20px);
    animation: slideUp 0.8s ease-out forwards;
  }
}

.main {
  display: grid;
  gap: 60px;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 32px;
  font-weight: 600;
}

.features {
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  
  .feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    &.clickable {
      cursor: pointer;
      
      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        background: rgba(255, 255, 255, 0.15);
      }
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }
    
    .feature-title {
      font-size: 1.5rem;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .feature-description {
      opacity: 0.9;
      line-height: 1.6;
    }
  }
}

.environment {
  .env-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 32px;
  }
  
  .env-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    
    &:last-child {
      border-bottom: none;
    }
    
    .env-label {
      font-weight: 600;
      opacity: 0.9;
    }
    
    .env-value {
      font-family: 'Courier New', monospace;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
    }
  }
}

@media (max-width: 768px) {
  .home {
    padding: 20px 16px;
  }
  
  .header {
    .title {
      font-size: 2rem;
    }
    
    .subtitle {
      font-size: 1rem;
    }
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .features .feature-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>