<template>
  <div class="space-y-6">
    <!-- 操作栏 -->
    <Card>
      <CardContent class="p-6">
        <div class="flex justify-between">
          <div class="flex gap-2">
            <Button variant="outline" @click="expandAll">
              <ChevronDown class="mr-2 h-4 w-4" />
              展开/收起
            </Button>
          </div>
          <Button @click="handleAdd">
            <Plus class="mr-2 h-4 w-4" />
            新增菜单
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 菜单树 -->
    <Card>
      <CardContent class="p-6">
        <div class="space-y-2">
          <div
            v-for="menu in menus"
            :key="menu.id"
            class="rounded-lg border bg-card"
          >
            <div
              class="flex items-center justify-between p-4 hover:bg-accent transition-colors cursor-pointer"
              @click="toggleExpand(menu)"
            >
              <div class="flex items-center gap-3">
                <ChevronRight
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-90': menu.expanded }"
                />
                <component :is="menu.icon" class="h-4 w-4 text-muted-foreground" />
                <span class="font-medium">{{ menu.name }}</span>
                <Badge variant="secondary">{{ menu.type }}</Badge>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">{{ menu.path }}</span>
                <Button variant="ghost" size="sm" @click.stop="handleEdit(menu)">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click.stop="handleDelete(menu)">
                  <Trash2 class="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
            <div
              v-if="menu.expanded && menu.children && menu.children.length > 0"
              class="ml-8 space-y-2 border-l pl-4"
            >
              <div
                v-for="child in menu.children"
                :key="child.id"
                class="flex items-center justify-between p-3 rounded hover:bg-accent transition-colors"
              >
                <div class="flex items-center gap-3">
                  <component :is="child.icon" class="h-4 w-4 text-muted-foreground" />
                  <span>{{ child.name }}</span>
                  <Badge variant="secondary">{{ child.type }}</Badge>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">{{ child.path }}</span>
                  <Button variant="ghost" size="sm" @click.stop="handleEdit(child)">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click.stop="handleDelete(child)">
                    <Trash2 class="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Shield
} from 'lucide-vue-next'

const menus = ref([
  {
    id: 1,
    name: '控制台',
    path: '/admin/dashboard',
    type: '菜单',
    icon: LayoutDashboard,
    expanded: true,
    children: []
  },
  {
    id: 2,
    name: '系统管理',
    path: '',
    type: '目录',
    icon: Settings,
    expanded: true,
    children: [
      {
        id: 21,
        name: '用户管理',
        path: '/admin/system/users',
        type: '菜单',
        icon: Users,
        expanded: false
      },
      {
        id: 22,
        name: '角色管理',
        path: '/admin/system/roles',
        type: '菜单',
        icon: Shield,
        expanded: false
      },
      {
        id: 23,
        name: '菜单管理',
        path: '/admin/system/menus',
        type: '菜单',
        icon: Settings,
        expanded: false
      }
    ]
  },
  {
    id: 3,
    name: '日志管理',
    path: '',
    type: '目录',
    icon: FileText,
    expanded: false,
    children: [
      {
        id: 31,
        name: '操作日志',
        path: '/admin/system/logs',
        type: '菜单',
        icon: FileText,
        expanded: false
      }
    ]
  }
])

function toggleExpand(menu) {
  menu.expanded = !menu.expanded
}

function expandAll() {
  const allExpanded = menus.value.every(m => m.expanded)
  menus.value.forEach(menu => {
    menu.expanded = !allExpanded
  })
}

function handleAdd() {
  console.log('新增菜单')
}

function handleEdit(menu) {
  console.log('编辑菜单:', menu)
}

function handleDelete(menu) {
  console.log('删除菜单:', menu)
}
</script>
