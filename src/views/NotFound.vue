<template>
  <div class="not-found">
    <div class="container">
      <div class="content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面不存在</h1>
        <p class="error-description">
          抱歉，您访问的页面可能已被删除、更名或暂时不可用。
        </p>
        <div class="actions">
          <button class="btn btn-primary" @click="goBack">
            <span class="btn-icon">←</span>
            返回上页
          </button>
          <button class="btn btn-secondary" @click="goHome">
            <span class="btn-icon">🏠</span>
            返回首页
          </button>
        </div>
      </div>
      <div class="illustration">
        <div class="astronaut">
          <div class="astronaut-body">👨‍🚀</div>
          <div class="floating-stars">
            <span class="star star1">⭐</span>
            <span class="star star2">✨</span>
            <span class="star star3">🌟</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1000px;
  align-items: center;
}

.content {
  text-align: left;
  color: white;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #fff, rgba(255, 255, 255, 0.6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: float 3s ease-in-out infinite;
}

.error-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.error-description {
  font-size: 1.2rem;
  margin-bottom: 40px;
  line-height: 1.6;
  opacity: 0.9;
}

.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.astronaut {
  position: relative;
  animation: float 4s ease-in-out infinite;
  
  .astronaut-body {
    font-size: 8rem;
  }
  
  .floating-stars {
    position: absolute;
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    .star {
      position: absolute;
      font-size: 1.5rem;
      animation: twinkle 2s ease-in-out infinite;
      
      &.star1 {
        top: 20%;
        left: 20%;
        animation-delay: 0s;
      }
      
      &.star2 {
        top: 30%;
        right: 20%;
        animation-delay: 0.5s;
      }
      
      &.star3 {
        bottom: 30%;
        left: 30%;
        animation-delay: 1s;
      }
    }
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  color: white;
  
  .btn-icon {
    font-size: 18px;
  }
  
  &.btn-primary {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
  }
  
  &.btn-secondary {
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.5);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.8);
      transform: translateY(-2px);
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .content {
    text-align: center;
  }
  
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-description {
    font-size: 1rem;
    margin-bottom: 30px;
  }
  
  .actions {
    justify-content: center;
  }
  
  .astronaut .astronaut-body {
    font-size: 6rem;
  }
}
</style>