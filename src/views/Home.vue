<template>
  <div class="home">
    <DayNightToggle v-model="isDarkMode" class="theme-toggle-wrapper" />
    <div class="container">
      <div class="container">
        <header class="header">
          <h1 class="title">{{ appTitle }}</h1>
          <p class="subtitle">
            基于 Vite + Vue3 + TypeScript 的现代前端项目模板
          </p>
        </header>

        <main class="main">
          <section class="features">
            <h2 class="section-title">项目特性</h2>
            <div class="feature-grid">
              <div
                v-for="feature in features"
                :key="feature.id"
                class="feature-card"
                :class="{ clickable: feature.clickable }"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { envConfig } from "@/utils/env";
import { useAppStore } from "@/stores/app";
import DayNightToggle from "@/components/interesting/DayNightToggle.vue";

const router = useRouter();
const appStore = useAppStore();
const appTitle = ref("Vue3 Vite Project");

// 计算属性,将主题状态转换为布尔值
const isDarkMode = computed({
  get: () => appStore.theme === "dark",
  set: (value) => {
    appStore.setTheme(value ? "dark" : "light");
  },
});

const features = ref([
  {
    id: 1,
    icon: "⚡",
    title: "极速开发",
    description: "基于 Vite 构建，享受闪电般的开发体验",
  },
  {
    id: 2,
    icon: "🎨",
    title: "现代UI",
    description: "组件化设计，支持主题定制和响应式布局",
  },
  {
    id: 3,
    icon: "🚀",
    title: "性能优化",
    description: "代码分割、懒加载、Tree Shaking等优化策略",
  },
  {
    id: 4,
    icon: "🔧",
    title: "开发工具",
    description: "ESLint、Prettier、TypeScript等工具链支持",
  },
  {
    id: 5,
    icon: "📱",
    title: "移动端适配",
    description: "响应式设计，完美支持移动端和桌面端",
  },
  {
    id: 6,
    icon: "♟️",
    title: "中国象棋",
    description: "在线象棋对弈，支持完整规则和棋谱记录",
    link: "/chess",
    clickable: true,
  },
  {
    id: 7,
    icon: "⚪⚫",
    title: "五子棋",
    description: "经典五子棋游戏，支持人机对战和人人对战",
    link: "/gomoku",
    clickable: true,
  },
  {
    id: 8,
    icon: "📅",
    title: "日历",
    description: "公历农历对照，节假日倒计时",
    link: "/calendar",
    clickable: true,
  },
  {
    id: 10,
    icon: "🎮",
    title: "3D 行走游戏",
    description: "Three.js 3D 世界，键盘控制角色自由行走",
    link: "/game",
    clickable: true,
  },
  {
    id: 12,
    icon: "🏎️",
    title: "赛车游戏",
    description: "无限道路赛车，WASD 控制，程序化生成场景",
    link: "/racing",
    clickable: true,
  },
  {
    id: 11,
    icon: "🌐",
    title: "国际化",
    description: "内置i18n支持，轻松实现多语言切换",
  },
]);

onMounted(() => {
  console.log("Home page mounted");
  console.log("Environment config:", envConfig);
});
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: transparent;
  color: #ffffff;
  padding: 40px 20px;
  transition: color 0.3s ease;
}

[data-theme="light"] .home {
  color: #1e293b;
}

.theme-toggle-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
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
    background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0;
    animation: fadeIn 0.6s ease-in-out forwards;
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
  }

  .subtitle {
    font-size: 1.2rem;
    color: #e2e8f0;
    transform: translateY(20px);
    animation: slideUp 0.8s ease-out forwards;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
}

[data-theme="light"] {
  .header {
    .title {
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
    }

    .subtitle {
      color: #334155;
      text-shadow: none;
    }
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
  color: #ffffff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

[data-theme="light"] .section-title {
  color: #1e293b;
  text-shadow: none;
}

.features {
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .feature-card {
    background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.7) 0%,
      rgba(30, 41, 59, 0.7) 100%
    );
    backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    transition: all 0.4s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      transform: translateY(-12px);
      box-shadow:
        0 25px 50px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(124, 58, 237, 0.2);
      border-color: rgba(124, 58, 237, 0.3);
    }

    &.clickable {
      cursor: pointer;

      &:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow:
          0 25px 50px rgba(0, 0, 0, 0.5),
          0 0 40px rgba(0, 212, 255, 0.3);
        background: linear-gradient(
          135deg,
          rgba(124, 58, 237, 0.8) 0%,
          rgba(0, 212, 255, 0.8) 100%
        );
        border-color: rgba(255, 255, 255, 0.3);
      }
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }

    .feature-title {
      font-size: 1.5rem;
      margin-bottom: 12px;
      font-weight: 600;
      color: #ffffff;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .feature-description {
      color: #cbd5e1;
      line-height: 1.6;
      opacity: 0.9;
    }
  }
}

[data-theme="light"] {
  .features {
    .feature-card {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(59, 130, 246, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      &:hover {
        transform: translateY(-12px);
        box-shadow:
          0 12px 24px rgba(0, 0, 0, 0.1),
          0 0 20px rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.25);
      }

      &.clickable {
        &:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.12),
            0 0 30px rgba(6, 182, 212, 0.2);
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.9) 0%,
            rgba(6, 182, 212, 0.9) 100%
          );
          border-color: rgba(255, 255, 255, 0.8);

          .feature-title,
          .feature-description {
            color: #ffffff !important;
          }
        }
      }

      .feature-icon {
        filter: none;
      }

      .feature-title {
        color: #0f172a;
        text-shadow: none;
      }

      .feature-description {
        color: #64748b;
      }
    }
  }
}

.environment {
  .env-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.7) 0%,
      rgba(30, 41, 59, 0.7) 100%
    );
    backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 32px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .env-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .env-label {
      font-weight: 600;
      color: #e2e8f0;
    }

    .env-value {
      font-family: "Courier New", monospace;
      background: linear-gradient(
        135deg,
        rgba(124, 58, 237, 0.3) 0%,
        rgba(0, 212, 255, 0.3) 100%
      );
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}

[data-theme="light"] {
  .environment {
    .env-info {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(59, 130, 246, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .env-item {
      .env-label {
        color: #334155;
      }

      .env-value {
        background: linear-gradient(
          135deg,
          rgba(59, 130, 246, 0.15) 0%,
          rgba(6, 182, 212, 0.15) 100%
        );
        color: #0f172a;
        border: 1px solid rgba(59, 130, 246, 0.3);
        font-weight: 500;
      }
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
