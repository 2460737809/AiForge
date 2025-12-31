# Vue3 + Vite 项目模板

一个基于 Vite + Vue3 的现代化前端项目模板，集成了 Tailwind CSS、shadcn-ui 组件库和 MSW Mock 服务。

## ✨ 特性

- 🚀 **Vue 3** - 使用最新的 Vue 3 Composition API
- ⚡ **Vite** - 极速的开发服务器和构建工具
- 🛣️ **Vue Router** - 官方路由管理器
- 🍍 **Pinia** - 现代化的状态管理库
- 🎨 **Tailwind CSS** - 实用优先的 CSS 框架
- 🧩 **shadcn-ui** - 基于 Radix Vue 的无头组件库
- 🔄 **Axios** - HTTP 请求库封装
- 🎭 **MSW** - Mock Service Worker 接口模拟
- 📦 **打包优化** - Gzip 压缩、代码分割、体积分析
- 🎮 **Three.js** - 3D 图形库支持
- 🎲 **游戏示例** - 五子棋、中国象棋等小游戏
- 📱 **响应式设计** - 支持移动端和桌面端
- 🌙 **主题切换** - 深色/浅色主题支持
- 🔧 **开发工具** - ESLint, Prettier 配置
- 🌍 **环境配置** - 多环境变量支持

## 🏗️ 项目结构

```
src/
├── api/                    # API 接口
│   ├── admin/             # 后台管理接口
│   │   ├── users.js       # 用户管理
│   │   ├── roles.js       # 角色管理
│   │   └── menus.js       # 菜单管理
│   ├── auth.js            # 认证相关接口
│   ├── user.js            # 用户相关接口
│   ├── common.js          # 公共接口
│   └── index.js           # API 统一导出
├── assets/                # 静态资源
│   ├── images/            # 图片资源
│   └── mockData/          # 模拟数据
├── components/            # 组件
│   ├── Layout/            # 布局组件
│   ├── interesting/       # 趣味组件
│   └── ui/                # shadcn-ui 组件
│       ├── button/        # 按钮组件
│       ├── dialog/        # 对话框组件
│       ├── input/         # 输入框组件
│       ├── select/        # 选择器组件
│       ├── table/         # 表格组件
│       ├── card/          # 卡片组件
│       ├── badge/         # 徽章组件
│       └── label/         # 标签组件
├── lib/                   # 工具库
│   └── utils.js           # cn 工具函数
├── mocks/                 # MSW Mock 服务
│   ├── browser.js         # 浏览器端配置
│   ├── server.js          # Node 端配置
│   └── handlers/          # 请求处理器
│       ├── users.js       # 用户 Mock
│       ├── roles.js       # 角色 Mock
│       └── menus.js       # 菜单 Mock
├── router/                # 路由配置
│   ├── index.js           # 路由定义
│   └── guards.js          # 路由守卫
├── stores/                # 状态管理
│   ├── index.js           # Store 统一导出
│   ├── app.js             # 应用状态
│   ├── user.js            # 用户状态
│   └── counter.js         # 计数器示例
├── utils/                 # 工具函数
│   ├── request.js         # Axios 封装
│   ├── env.js             # 环境变量工具
│   └── index.js           # 通用工具函数
├── views/                 # 页面组件
│   ├── admin/             # 后台管理
│   │   ├── AdminLayout.vue
│   │   ├── Dashboard.vue  # 仪表板
│   │   └── system/        # 系统管理
│   │       ├── Users.vue  # 用户管理
│   │       ├── Roles.vue  # 角色管理
│   │       ├── Menus.vue  # 菜单管理
│   │       ├── Logs.vue   # 日志管理
│   │       └── Settings.vue # 系统设置
│   ├── Home.vue           # 首页
│   ├── About.vue          # 关于页面
│   ├── Demo.vue           # 功能演示
│   ├── Counter.vue        # 计数器页面
│   ├── ChineseChess.vue   # 中国象棋
│   ├── gomoku.vue         # 五子棋
│   └── NotFound.vue       # 404 页面
├── App.vue                # 根组件
└── main.js                # 应用入口
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7 或 yarn >= 1.22

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 构建并分析体积

```bash
npm run build:analyze
# 构建完成后打开 dist/stats.html 查看详细报告
```

### 预览生产构建

```bash
npm run preview
# 或
yarn preview
```

## 📦 环境配置

项目支持多环境配置，通过 `.env` 文件进行配置：

- `.env.development` - 开发环境
- `.env.production` - 生产环境  
- `.env.test` - 测试环境

主要环境变量：

```bash
# 应用标题
VITE_APP_TITLE=Vue3 Project

# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# 应用基础路径
VITE_APP_BASE_URL=/

# 上传接口地址
VITE_APP_UPLOAD_URL=/api/upload

# Mock 服务开关
VITE_APP_MOCK=true
```

## 🎨 样式系统

### Tailwind CSS

项目使用 Tailwind CSS 作为主要样式方案：

```html
<!-- 间距 -->
<div class="m-4 mb-2 p-3">内容</div>

<!-- 布局 -->
<div class="flex justify-center items-center">居中</div>

<!-- 文本 -->
<p class="text-primary text-center">主要文本</p>

<!-- 响应式 -->
<div class="w-full md:w-1/2 lg:w-1/3">
  响应式布局
</div>
```

### 主题变量

通过 CSS 变量实现主题切换：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... 更多变量 */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... 深色模式变量 */
}
```

### 工具类

提供了丰富的工具类，如：

```html
<!-- 间距 -->
<div class="m-4 mb-2 p-3">内容</div>

<!-- 布局 -->
<div class="flex justify-center items-center">居中</div>

<!-- 文本 -->
<p class="text-primary text-center">主要文本</p>
```

## 🔧 状态管理 (Pinia)

项目使用 Pinia 进行状态管理：

```javascript
// 使用 store
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 访问状态
console.log(userStore.isLoggedIn)

// 调用方法
await userStore.doLogin(credentials)
```

## 🌐 HTTP 请求 (Axios)

封装了 Axios 请求库：

```javascript
import { request } from '@/utils/request'

// GET 请求
const data = await request.get('/users', { page: 1 })

// POST 请求
const result = await request.post('/users', userData)

// 文件上传
const formData = new FormData()
formData.append('file', file)
await request.upload('/upload', formData)
```

### API 接口封装

```javascript
// src/api/admin/users.js
import { request } from '@/utils/request'

export const getUsers = (params) => request.get('/admin/users', params)
export const createUser = (data) => request.post('/admin/users', data)
export const updateUser = (id, data) => request.put(`/admin/users/${id}`, data)
export const deleteUser = (id) => request.delete(`/admin/users/${id}`)
```

## 🎭 MSW Mock 服务

项目使用 MSW (Mock Service Worker) 进行接口模拟：

### 启用 Mock

```javascript
// main.js
import { worker } from './mocks/browser'

if (import.meta.env.VITE_APP_MOCK === 'true') {
  worker.start()
}
```

### 定义 Mock 接口

```javascript
// src/mocks/handlers/users.js
import { http, HttpResponse } from 'msw'

export const usersHandlers = [
  http.get('/api/admin/users', () => {
    return HttpResponse.json({
      success: true,
      data: { list: [], total: 0 }
    })
  })
]
```

## 🛣️ 路由系统

基于 Vue Router 的路由配置：

```javascript
// 路由定义
{
  path: '/user',
  name: 'User',
  component: () => import('@/views/User.vue'),
  meta: {
    title: '用户管理',
    requiresAuth: true  // 需要登录
  }
}
```

## 📱 响应式设计

项目采用移动优先的响应式设计：

- 使用 SCSS 混合器处理断点
- 自适应布局组件
- 移动端优化交互

## 🎯 开发规范

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 官方风格指南

### 组件开发

#### 使用 shadcn-ui 组件

```vue
<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
</script>

<template>
  <Button variant="default">默认按钮</Button>
  <Input placeholder="请输入内容" />
  <Select :options="options" v-model="value" />
</template>
```

#### Dialog 组件使用

```vue
<script setup>
import { Dialog } from '@/components/ui/dialog'
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <!-- 注意：Content 必须添加 style="pointer-events: auto;" 才能选择输入框 -->
      <DialogHeader>
        <DialogTitle>标题</DialogTitle>
      </DialogHeader>
      <div style="pointer-events: auto;">
        <Input placeholder="请输入" />
      </div>
    </DialogContent>
  </Dialog>
</template>
```

### 提交规范

使用 Conventional Commits 规范：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📦 构建优化

### 打包优化策略

- **Gzip 压缩**: 自动压缩大于 10kb 的文件
- **代码分割**: 智能分割第三方库
  - `vue-vendor`: Vue 核心库
  - `ui-vendor`: UI 组件库
  - `three-vendor`: Three.js 相关
- **体积分析**: 打包后生成可视化报告
- **Tree Shaking**: 移除未使用的代码
- **Esbuild 压缩**: 更快的压缩速度

### 查看打包分析

```bash
npm run build:analyze
```

打包完成后访问 `dist/stats.html` 查看各模块体积占用。

## 🎮 功能示例

### 后台管理系统

完整的 CRUD 功能示例：
- 用户管理 (Users.vue)
- 角色管理 (Roles.vue)
- 菜单管理 (Menus.vue)
- 日志管理 (Logs.vue)
- 系统设置 (Settings.vue)

### 游戏示例

- 五子棋
- 中国象棋
- 计数器演示

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者。