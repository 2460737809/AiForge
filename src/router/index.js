import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      keepAlive: false
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于',
      keepAlive: false
    }
  },
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('@/views/Demo.vue'),
    meta: {
      title: '示例页面',
      keepAlive: true
    }
  },
  {
    path: '/counter',
    name: 'Counter',
    component: () => import('@/views/Counter.vue'),
    meta: {
      title: '计数器',
      keepAlive: false
    }
  },
  {
    path: '/chess',
    name: 'ChineseChess',
    component: () => import('@/views/ChineseChess.vue'),
    meta: {
      title: '中国象棋',
      keepAlive: true
    }
  },
  {
    path: '/gomoku',
    name: 'Gomoku',
    component: () => import('@/views/gomoku.vue'),
    meta: {
      title: '五子棋',
      keepAlive: true
    }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/calendar/Calendar.vue'),
    meta: {
      title: '日历',
      keepAlive: true
    }
  },
  {
    path: '/game',
    name: 'WalkingGame',
    component: () => import('@/views/game/WalkingGame.vue'),
    meta: {
      title: '3D 行走游戏',
      keepAlive: false
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 设置路由守卫
setupRouterGuards(router)

export default router