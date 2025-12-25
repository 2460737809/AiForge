<template>
  <div class="about">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">关于项目</h1>
        <p class="page-subtitle">了解更多关于这个Vue3项目的信息</p>
      </header>

      <main class="page-content">
        <section class="tech-stack">
          <h2 class="section-title">技术栈</h2>
          <div class="tech-grid">
            <div class="tech-item" v-for="tech in techStack" :key="tech.name">
              <div class="tech-icon">{{ tech.icon }}</div>
              <div class="tech-info">
                <h3 class="tech-name">{{ tech.name }}</h3>
                <p class="tech-version">{{ tech.version }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="features">
          <h2 class="section-title">核心功能</h2>
          <ul class="feature-list">
            <li class="feature-item" v-for="feature in coreFeatures" :key="feature">
              <span class="feature-bullet">✓</span>
              {{ feature }}
            </li>
          </ul>
        </section>

        <section class="getting-started">
          <h2 class="section-title">快速开始</h2>
          <div class="code-block">
            <pre><code># 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview</code></pre>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const techStack = ref([
  { name: "Vue.js", version: "^3.4.0", icon: "🟢" },
  { name: "Vite", version: "^5.0.8", icon: "⚡" },
  { name: "Vue Router", version: "^4.2.5", icon: "🛣️" },
  { name: "Pinia", version: "^2.1.7", icon: "🍍" },
  { name: "Axios", version: "^1.6.2", icon: "🔄" },
])

const coreFeatures = ref(["Vue 3 Composition API", "TypeScript 支持", "Vue Router 路由管理", "Pinia 状态管理", "Axios HTTP 客户端封装", "SCSS 样式预处理器", "响应式设计", "多环境配置", "代码分割和懒加载", "ESLint 代码规范", "Prettier 代码格式化", "热模块替换 (HMR)"])
</script>

<style lang="scss" scoped>
.about {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 40px 20px;
}

.container {
  max-width: 1000px;
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
  gap: 60px;
}

.section-title {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 32px;
  font-weight: 600;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 2px;
  }
}

.tech-stack {
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }

  .tech-item {
    display: flex;
    align-items: center;
    background: var(--bg-white);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .tech-icon {
      font-size: 2rem;
      margin-right: 16px;
    }

    .tech-info {
      .tech-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .tech-version {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-family: "Courier New", monospace;
      }
    }
  }
}

.features {
  .feature-list {
    background: var(--bg-white);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .feature-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-lighter);
    color: var(--text-regular);
    line-height: 1.6;

    &:last-child {
      border-bottom: none;
    }

    .feature-bullet {
      color: var(--success-color);
      font-weight: bold;
      margin-right: 12px;
      font-size: 1.2rem;
    }
  }
}

.getting-started {
  .code-block {
    background: var(--bg-white);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    pre {
      margin: 0;
      overflow-x: auto;
      background: #f6f8fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--border-base);

      code {
        font-family: "Courier New", Consolas, monospace;
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--text-primary);
      }
    }
  }
}

@media (max-width: 768px) {
  .about {
    padding: 20px 16px;
  }

  .page-header {
    .page-title {
      font-size: 2rem;
    }
  }

  .tech-stack .tech-grid {
    grid-template-columns: 1fr;
  }
}
</style>
