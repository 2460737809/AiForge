<template>
  <div class="counter-page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">计数器</h1>
        <p class="page-subtitle">Pinia 状态管理演示</p>
      </header>

      <main class="page-content">
        <section class="counter-section">
          <div class="counter-display">
            <div class="count-circle">
              <span class="count-number">{{ counterStore.count }}</span>
              <span class="count-label">当前计数</span>
            </div>
            
            <div class="count-info">
              <div class="info-item">
                <span class="info-label">双倍数值:</span>
                <span class="info-value">{{ counterStore.doubleCount }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">奇偶性:</span>
                <span class="info-value" :class="{ 'even': counterStore.isEven, 'odd': counterStore.isOdd }">
                  {{ counterStore.isEven ? '偶数' : '奇数' }}
                </span>
              </div>
            </div>
          </div>

          <div class="counter-controls">
            <div class="control-group">
              <h3>基础操作</h3>
              <div class="button-grid">
                <button class="btn btn-primary" @click="counterStore.increment()">
                  <span class="btn-icon">+</span>
                  <span>加 1</span>
                </button>
                <button class="btn btn-danger" @click="counterStore.decrement()">
                  <span class="btn-icon">−</span>
                  <span>减 1</span>
                </button>
                <button class="btn btn-warning" @click="counterStore.reset()">
                  <span class="btn-icon">↺</span>
                  <span>重置</span>
                </button>
              </div>
            </div>

            <div class="control-group">
              <h3>批量操作</h3>
              <div class="button-grid">
                <button class="btn btn-success" @click="counterStore.increment(10)">
                  <span class="btn-icon">+10</span>
                  <span>加 10</span>
                </button>
                <button class="btn btn-secondary" @click="counterStore.decrement(10)">
                  <span class="btn-icon">-10</span>
                  <span>减 10</span>
                </button>
                <button class="btn btn-info" @click="setRandomValue">
                  <span class="btn-icon">🎲</span>
                  <span>随机值</span>
                </button>
              </div>
            </div>

            <div class="control-group">
              <h3>自定义值</h3>
              <div class="custom-control">
                <input 
                  type="number" 
                  v-model.number="customValue" 
                  class="number-input"
                  placeholder="输入数值"
                >
                <button class="btn btn-primary" @click="counterStore.setValue(customValue)">
                  设置
                </button>
              </div>
            </div>
          </div>

          <div class="history-section">
            <div class="history-header">
              <h3>操作历史</h3>
              <button class="btn btn-secondary btn-sm" @click="counterStore.clearHistory()">
                清空历史
              </button>
            </div>
            <div class="history-list">
              <div 
                class="history-item" 
                v-for="(item, index) in counterStore.history.slice(0, 10)" 
                :key="index"
              >
                <div class="history-action">
                  <span class="action-badge" :class="item.action">
                    {{ getActionLabel(item.action) }}
                  </span>
                  <span class="action-time">{{ formatTime(item.timestamp) }}</span>
                </div>
                <div class="history-change">
                  <span class="old-value">{{ item.oldValue }}</span>
                  <span class="arrow">→</span>
                  <span class="new-value">{{ item.newValue }}</span>
                </div>
              </div>
              <div class="empty-history" v-if="counterStore.history.length === 0">
                <p>暂无操作历史</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
const customValue = ref(0)

const setRandomValue = () => {
  const randomValue = Math.floor(Math.random() * 1000) - 500
  counterStore.setValue(randomValue)
}

const getActionLabel = (action) => {
  const labels = {
    increment: '增加',
    decrement: '减少',
    reset: '重置',
    set: '设置'
  }
  return labels[action] || action
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}
</script>

<style lang="scss" scoped>
.counter-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  
  .page-title {
    font-size: 2.5rem;
    color: white;
    margin-bottom: 16px;
    font-weight: 700;
  }
  
  .page-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
  }
}

.counter-section {
  display: grid;
  gap: 40px;
}

.counter-display {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  
  .count-circle {
    margin-bottom: 32px;
    
    .count-number {
      display: block;
      font-size: 5rem;
      font-weight: bold;
      color: white;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      line-height: 1;
      margin-bottom: 8px;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .count-label {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .count-info {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
    
    .info-item {
      .info-label {
        display: block;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 4px;
      }
      
      .info-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: white;
        
        &.even {
          color: #67c23a;
        }
        
        &.odd {
          color: #e6a23c;
        }
      }
    }
  }
}

.counter-controls {
  display: grid;
  gap: 32px;
  
  .control-group {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 24px;
    
    h3 {
      margin-bottom: 20px;
      color: var(--text-primary);
      font-size: 1.2rem;
      text-align: center;
    }
    
    .button-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    
    .custom-control {
      display: flex;
      gap: 12px;
      align-items: center;
      
      .number-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid var(--border-base);
        border-radius: 8px;
        font-size: 16px;
        text-align: center;
        transition: border-color 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
    }
  }
}

.history-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      color: var(--text-primary);
      font-size: 1.2rem;
    }
  }
  
  .history-list {
    max-height: 300px;
    overflow-y: auto;
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }
    
    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-lighter);
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: var(--bg-page);
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .history-action {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .action-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          
          &.increment {
            background: rgba(103, 194, 58, 0.1);
            color: var(--success-color);
          }
          
          &.decrement {
            background: rgba(245, 108, 108, 0.1);
            color: var(--danger-color);
          }
          
          &.reset {
            background: rgba(230, 162, 60, 0.1);
            color: var(--warning-color);
          }
          
          &.set {
            background: rgba(144, 147, 153, 0.1);
            color: var(--info-color);
          }
        }
        
        .action-time {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
      }
      
      .history-change {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .old-value {
          color: var(--text-secondary);
          text-decoration: line-through;
        }
        
        .arrow {
          color: var(--text-placeholder);
        }
        
        .new-value {
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }
    
    .empty-history {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  }
}

// 按钮样式
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  
  .btn-icon {
    font-weight: bold;
    font-size: 16px;
  }
  
  &.btn-primary {
    background: var(--primary-color);
    
    &:hover {
      background: color-mix(in srgb, var(--primary-color) 80%, black);
      transform: translateY(-2px);
    }
  }
  
  &.btn-danger {
    background: var(--danger-color);
    
    &:hover {
      background: color-mix(in srgb, var(--danger-color) 80%, black);
      transform: translateY(-2px);
    }
  }
  
  &.btn-warning {
    background: var(--warning-color);
    
    &:hover {
      background: color-mix(in srgb, var(--warning-color) 80%, black);
      transform: translateY(-2px);
    }
  }
  
  &.btn-success {
    background: var(--success-color);
    
    &:hover {
      background: color-mix(in srgb, var(--success-color) 80%, black);
      transform: translateY(-2px);
    }
  }
  
  &.btn-secondary {
    background: var(--text-secondary);
    
    &:hover {
      background: color-mix(in srgb, var(--text-secondary) 80%, black);
      transform: translateY(-2px);
    }
  }
  
  &.btn-info {
    background: var(--info-color);
    
    &:hover {
      background: color-mix(in srgb, var(--info-color) 80%, black);
      transform: translateY(-2px);
    }
  }
  
  &.btn-sm {
    padding: 8px 16px;
    font-size: 12px;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .counter-page {
    padding: 20px 16px;
  }
  
  .page-header .page-title {
    font-size: 2rem;
  }
  
  .counter-display {
    padding: 24px;
    
    .count-circle .count-number {
      font-size: 3.5rem;
    }
    
    .count-info {
      gap: 20px;
    }
  }
  
  .counter-controls .control-group .button-grid {
    grid-template-columns: 1fr;
  }
  
  .history-section .history-list .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>