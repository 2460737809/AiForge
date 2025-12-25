<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">🚀</span>
          <span class="brand-text">Vue3 Project</span>
        </router-link>
      </div>
      
      <div class="navbar-menu" :class="{ 'is-active': menuOpen }">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path" 
          class="nav-item"
          active-class="is-active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </div>
      
      <div class="navbar-actions">
        <button class="theme-toggle" @click="toggleTheme" :title="'切换到' + (appStore.theme === 'dark' ? '浅色' : '深色') + '主题'">
          {{ appStore.theme === 'dark' ? '🌞' : '🌙' }}
        </button>
        <button class="menu-toggle" @click="toggleMenu" v-if="appStore.isMobile">
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const menuOpen = ref(false)

const menuItems = ref([
  { name: '首页', path: '/', icon: '🏠' },
  { name: '关于', path: '/about', icon: 'ℹ️' },
  { name: '演示', path: '/demo', icon: '🎨' },
  { name: '计数器', path: '/counter', icon: '🔢' }
])

const toggleTheme = () => {
  appStore.setTheme(appStore.theme === 'dark' ? 'light' : 'dark')
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<style lang="scss" scoped>
.navbar {
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-base);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
}

.navbar-brand {
  .brand-link {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.2rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary-color);
    }
    
    .brand-icon {
      font-size: 1.5rem;
    }
  }
}

.navbar-menu {
  display: flex;
  gap: 8px;
  
  @include respond-to(sm) {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--bg-white);
    border-bottom: 1px solid var(--border-base);
    flex-direction: column;
    padding: 20px;
    gap: 4px;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease;
    
    &.is-active {
      max-height: 400px;
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--text-regular);
    transition: all 0.3s ease;
    font-weight: 500;
    
    &:hover {
      background: var(--bg-page);
      color: var(--primary-color);
      transform: translateY(-1px);
    }
    
    &.is-active {
      background: var(--primary-color);
      color: white;
    }
    
    .nav-icon {
      font-size: 1.1rem;
    }
    
    @include respond-to(sm) {
      padding: 12px 16px;
      
      &.is-active {
        background: var(--primary-color);
        color: white;
      }
    }
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .theme-toggle,
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: var(--bg-page);
    color: var(--text-regular);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.2rem;
    
    &:hover {
      background: var(--border-base);
      color: var(--text-primary);
      transform: scale(1.1);
    }
  }
}

// 深色主题适配
[data-theme="dark"] {
  .navbar {
    background: rgba(29, 30, 31, 0.9);
    border-bottom-color: var(--border-base);
  }
  
  .navbar-menu {
    @include respond-to(sm) {
      background: var(--bg-white);
    }
  }
}
</style>