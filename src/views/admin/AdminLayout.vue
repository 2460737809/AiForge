<template>
  <div class="min-h-screen bg-background">
    <!-- 侧边栏 -->
    <aside
      :class="[
        'fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex h-16 items-center border-b px-6">
          <LayoutDashboard class="mr-2 h-6 w-6 text-primary" />
          <span class="text-lg font-bold">管理系统</span>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex-1 overflow-y-auto py-4">
          <ul class="space-y-1 px-3">
            <li v-for="item in menuItems" :key="item.key">
              <!-- 一级菜单 -->
              <div v-if="!item.children">
                <button
                  @click="handleMenuClick(item)"
                  :class="[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeMenu === item.key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  ]"
                >
                  <component :is="item.icon" class="h-4 w-4" />
                  <span>{{ item.label }}</span>
                </button>
              </div>
              <!-- 多级菜单 -->
              <div v-else>
                <button
                  @click="toggleExpand(item)"
                  :class="[
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeMenu === item.key || (item.children && item.children.some(c => activeMenu === c.key))
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.label }}</span>
                  </div>
                  <ChevronDown
                    class="h-4 w-4 transition-transform"
                    :class="{ 'rotate-180': item.expanded }"
                  />
                </button>
                <!-- 二级菜单 -->
                <div
                  v-if="item.expanded && item.children"
                  class="ml-4 mt-1 space-y-1"
                >
                  <button
                    v-for="child in item.children"
                    :key="child.key"
                    @click="handleMenuClick(child)"
                    :class="[
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      activeMenu === child.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    ]"
                  >
                    <component :is="child.icon" class="h-4 w-4" />
                    <span>{{ child.label }}</span>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        <!-- 用户信息 -->
        <div class="border-t p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User class="h-5 w-5 text-primary" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">管理员</p>
              <p class="text-xs text-muted-foreground">admin@example.com</p>
            </div>
            <button @click="logout" class="text-muted-foreground hover:text-foreground">
              <LogOut class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <div class="lg:pl-64">
      <!-- 顶部栏 -->
      <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden p-2 hover:bg-accent rounded-md"
        >
          <Menu class="h-5 w-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-semibold">{{ currentPageTitle }}</h1>
        </div>
        <button class="p-2 hover:bg-accent rounded-full">
          <Bell class="h-5 w-5" />
        </button>
      </header>

      <!-- 页面内容 -->
      <main class="p-6">
        <router-view />
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  User,
  LogOut,
  Bell,
  FileText,
  Shield,
  ChevronDown,
  Database,
  FileCode
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

// 多级菜单配置
const menuItems = ref([
  {
    key: 'dashboard',
    label: '控制台',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    expanded: false
  },
  {
    key: 'system',
    label: '系统管理',
    icon: Settings,
    expanded: true,
    children: [
      {
        key: 'users',
        label: '用户管理',
        icon: Users,
        path: '/admin/system/users'
      },
      {
        key: 'roles',
        label: '角色管理',
        icon: Shield,
        path: '/admin/system/roles'
      },
      {
        key: 'menus',
        label: '菜单管理',
        icon: Menu,
        path: '/admin/system/menus'
      },
      {
        key: 'logs',
        label: '操作日志',
        icon: FileText,
        path: '/admin/system/logs'
      },
      {
        key: 'settings',
        label: '系统设置',
        icon: Settings,
        path: '/admin/system/settings'
      }
    ]
  },
  {
    key: 'pages',
    label: '业务页面',
    icon: FileCode,
    expanded: true,
    children: [
      {
        key: 'demo',
        label: '示例页面',
        icon: FileCode,
        path: '/admin/pages/demo'
      },
      {
        key: 'typed',
        label: 'Typed.js 演示',
        icon: FileCode,
        path: '/admin/pages/typed'
      },
      {
        key: 'party',
        label: '动画配置',
        icon: FileCode,
        path: '/admin/pages/party'
      }
    ]
  }
])

const activeMenu = computed(() => {
  const path = route.path
  return path.replace('/admin/', '').replace('/admin', 'dashboard')
})

const currentPageTitle = computed(() => {
  for (const item of menuItems.value) {
    if (item.key === activeMenu.value) {
      return item.label
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.key === activeMenu.value) {
          return child.label
        }
      }
    }
  }
  return '控制台'
})

function toggleExpand(item) {
  item.expanded = !item.expanded
}

function handleMenuClick(item) {
  if (item.path) {
    router.push(item.path)
    sidebarOpen.value = false
  }
}

function logout() {
  router.push('/')
}
</script>
