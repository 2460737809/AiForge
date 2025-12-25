# Vue3 + Vite 项目模板

一个基于 Vite + Vue3 + TypeScript 的现代化前端项目模板，包含了常用的开发工具和最佳实践。

## ✨ 特性

- 🚀 **Vue 3** - 使用最新的 Vue 3 Composition API
- ⚡ **Vite** - 极速的开发服务器和构建工具
- 🛣️ **Vue Router** - 官方路由管理器
- 🍍 **Pinia** - 现代化的状态管理库
- 🔄 **Axios** - HTTP 请求库封装
- 🎨 **SCSS** - CSS 预处理器
- 📱 **响应式设计** - 支持移动端和桌面端
- 🌙 **主题切换** - 深色/浅色主题支持
- 🔧 **开发工具** - ESLint, Prettier 配置
- 🌍 **环境配置** - 多环境变量支持

## 🏗️ 项目结构

```
src/
├── api/                    # API 接口
│   ├── auth.js            # 认证相关接口
│   ├── user.js            # 用户相关接口
│   ├── common.js          # 公共接口
│   └── index.js           # API 统一导出
├── assets/                # 静态资源
│   ├── images/            # 图片资源
│   └── styles/            # 样式文件
│       ├── main.scss      # 主样式文件
│       ├── variables.scss # 变量定义
│       ├── mixins.scss    # 混合器
│       ├── common.scss    # 通用样式
│       └── transitions.scss # 过渡动画
├── components/            # 组件
│   └── Layout/            # 布局组件
│       └── Navbar.vue     # 导航栏组件
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
│   ├── Home.vue           # 首页
│   ├── About.vue          # 关于页面
│   ├── Demo.vue           # 功能演示
│   ├── Counter.vue        # 计数器页面
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
```

## 🎨 样式系统

### SCSS 变量

项目定义了完整的设计变量系统：

```scss
// 颜色
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;

// 字体大小
$font-size-base: 14px;
$font-size-large: 16px;
$font-size-small: 12px;

// 间距
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者。