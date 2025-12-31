<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Typed.js 打字效果演示</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 基础示例 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">基础打字效果</h2>
        <div class="bg-gray-50 dark:bg-gray-700 rounded p-4">
          <span class="typed-text text-2xl text-blue-600 dark:text-blue-400"></span>
        </div>
      </div>

      <!-- 速度控制 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">速度控制</h2>
        <div class="bg-gray-50 dark:bg-gray-700 rounded p-4">
          <span class="typed-fast text-2xl text-green-600 dark:text-green-400"></span>
        </div>
      </div>

      <!-- 循环效果 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">循环效果</h2>
        <div class="bg-gray-50 dark:bg-gray-700 rounded p-4">
          <span class="typed-loop text-2xl text-purple-600 dark:text-purple-400"></span>
        </div>
      </div>

      <!-- 智能退格 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">智能退格</h2>
        <div class="bg-gray-50 dark:bg-gray-700 rounded p-4">
          <span class="typed-smart text-2xl text-orange-600 dark:text-orange-400"></span>
        </div>
      </div>

      <!-- 代码风格 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">代码风格</h2>
        <div class="bg-gray-900 rounded p-4">
          <code class="typed-code text-lg text-green-400"></code>
        </div>
      </div>

      <!-- 混合内容 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">混合内容（HTML）</h2>
        <div class="bg-gray-50 dark:bg-gray-700 rounded p-4">
          <span class="typed-html text-xl text-pink-600 dark:text-pink-400"></span>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">使用说明</h2>
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
        <pre class="text-gray-800 dark:text-gray-200 overflow-x-auto"><code>// 安装
npm install typed.js

// 使用
import Typed from 'typed.js'

const typed = new Typed('.selector', {
  strings: ['Hello', 'World', 'Typed.js'],
  typeSpeed: 50,
  backSpeed: 30,
  loop: true
})</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Typed from 'typed.js'

onMounted(() => {
  // 基础示例
  new Typed('.typed-text', {
    strings: ['欢迎来到 Typed.js 演示', '这是一个打字效果库', 'Vue 3 + Typed.js'],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 1000,
    loop: true
  })

  // 速度控制
  new Typed('.typed-fast', {
    strings: ['快速打字效果', '速度 30ms', '反向速度 20ms'],
    typeSpeed: 30,
    backSpeed: 20,
    loop: true
  })

  // 循环效果
  new Typed('.typed-loop', {
    strings: ['无限循环', '重复打字', '持续播放'],
    typeSpeed: 60,
    backSpeed: 40,
    loop: true,
    loopCount: Infinity
  })

  // 智能退格
  new Typed('.typed-smart', {
    strings: [
      'JavaScript 是一门编程语言',
      'Vue 是一个前端框架',
      'Tailwind 是一个 CSS 框架',
      'Typed.js 是一个打字效果库'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    smartBackspace: true, // 只删除已输入的文字
    loop: true
  })

  // 代码风格
  new Typed('.typed-code', {
    strings: [
      '<span class="text-yellow-400">const</span> <span class="text-blue-400">greeting</span> = <span class="text-green-400">"Hello World"</span>;',
      '<span class="text-yellow-400">function</span> <span class="text-blue-400">sayHi</span>() {',
      '&nbsp;&nbsp;<span class="text-yellow-400">return</span> <span class="text-green-400">"Hi!"</span>;',
      '}'
    ],
    typeSpeed: 40,
    backSpeed: 20,
    contentType: 'html',
    loop: true
  })

  // 混合内容（HTML）
  new Typed('.typed-html', {
    strings: [
      '欢迎使用 <strong class="font-bold">Typed.js</strong>',
      '支持 <em>HTML</em> 标签',
      '支持 <span style="color: #ef4444;">自定义样式</span>',
      '还可以使用 <i class="icon">图标</i>'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    contentType: 'html',
    loop: true
  })
})
</script>

<style scoped>
/* 光标动画 */
:deep(.typed-cursor) {
  font-size: 1em;
  animation: blink 0.7s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
