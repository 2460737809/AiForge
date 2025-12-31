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
    component: () => import('@/views/game/myWord/WalkingGame.vue'),
    meta: {
      title: '3D 行走游戏',
      keepAlive: false
    }
  },
  {
    path: '/racing',
    name: 'RacingGame',
    component: () => import('@/views/game/racing/RacingGame.vue'),
    meta: {
      title: '赛车游戏',
      keepAlive: false
    }
  },
  // 后台管理系统路由
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: {
      title: '后台管理',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: {
          title: '控制台'
        }
      },
      // 系统管理模块
      {
        path: 'system/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/system/Users.vue'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'system/roles',
        name: 'AdminRoles',
        component: () => import('@/views/admin/system/Roles.vue'),
        meta: {
          title: '角色管理'
        }
      },
      {
        path: 'system/menus',
        name: 'AdminMenus',
        component: () => import('@/views/admin/system/Menus.vue'),
        meta: {
          title: '菜单管理'
        }
      },
      {
        path: 'system/logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/system/Logs.vue'),
        meta: {
          title: '操作日志'
        }
      },
      {
        path: 'system/settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/system/Settings.vue'),
        meta: {
          title: '系统设置'
        }
      },
      // 业务页面模块
      {
        path: 'pages/demo',
        name: 'AdminDemoPage',
        component: () => import('@/views/admin/pages/DemoPage.vue'),
        meta: {
          title: '示例页面'
        }
      },
      {
        path: 'pages/typed',
        name: 'AdminTyped',
        component: () => import('@/views/admin/pages/TypedDemo.vue'),
        meta: {
          title: 'Typed.js 演示'
        }
      },
      {
        path: 'pages/party',
        name: 'AdminParty',
        component: () => import('@/views/admin/pages/PartyConfig.vue'),
        meta: {
          title: '动画配置'
        }
      }
    ]
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