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
                <Button variant="ghost" size="sm" @click.stop="handleAddChild(menu)">
                  <Plus class="h-4 w-4" />
                </Button>
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

    <!-- 新增/编辑菜单对话框 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ isEdit ? '编辑菜单' : '新增菜单' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label>菜单名称</Label>
            <Input
              v-model="form.name"
              placeholder="请输入菜单名称"
              required
            />
          </div>
          <div class="space-y-2">
            <Label>菜单类型</Label>
            <select
              v-model="form.type"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="目录">目录</option>
              <option value="菜单">菜单</option>
            </select>
          </div>
          <div class="space-y-2" v-if="form.type === '菜单'">
            <Label>路由路径</Label>
            <Input
              v-model="form.path"
              placeholder="请输入路由路径"
            />
          </div>
          <div class="space-y-2">
            <Label>父级菜单</Label>
            <select
              v-model="form.parentId"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option :value="null">无（作为一级菜单）</option>
              <option v-for="menu in rootMenus" :key="menu.id" :value="menu.id">
                {{ menu.name }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <Label>图标</Label>
            <select
              v-model="form.iconName"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="LayoutDashboard">仪表盘</option>
              <option value="Settings">设置</option>
              <option value="Users">用户</option>
              <option value="Shield">盾牌</option>
              <option value="FileText">文档</option>
              <option value="Folder">文件夹</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" @click="dialogOpen = false">
              取消
            </Button>
            <Button type="submit">
              {{ isEdit ? '保存' : '创建' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <p>确定要删除菜单 <strong>{{ deleteMenu?.name }}</strong> 吗？</p>
          <p v-if="deleteMenu?.children?.length > 0" class="mt-2 text-sm text-amber-600">
            注意：该菜单下还有 {{ deleteMenu.children.length }} 个子菜单，删除后将一并删除。
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="deleteDialogOpen = false">
            取消
          </Button>
          <Button variant="destructive" @click="confirmDelete">
            删除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
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
  Shield,
  Folder
} from 'lucide-vue-next'

const iconMap = {
  LayoutDashboard,
  Settings,
  Users,
  Shield,
  FileText,
  Folder
}

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEdit = ref(false)
const deleteMenu = ref(null)
const nextId = ref(32)

const form = ref({
  id: null,
  name: '',
  type: '菜单',
  path: '',
  parentId: null,
  iconName: 'LayoutDashboard'
})

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

const rootMenus = computed(() => menus.value)

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
  isEdit.value = false
  form.value = {
    id: null,
    name: '',
    type: '菜单',
    path: '',
    parentId: null,
    iconName: 'LayoutDashboard'
  }
  dialogOpen.value = true
}

function handleAddChild(menu) {
  isEdit.value = false
  form.value = {
    id: null,
    name: '',
    type: '菜单',
    path: '',
    parentId: menu.id,
    iconName: 'LayoutDashboard'
  }
  dialogOpen.value = true
}

function handleEdit(menu) {
  isEdit.value = true
  const parentId = menus.value.find(m => m.children?.some(c => c.id === menu.id))?.id || null
  form.value = {
    id: menu.id,
    name: menu.name,
    type: menu.type,
    path: menu.path || '',
    parentId,
    iconName: Object.keys(iconMap).find(key => iconMap[key] === menu.icon) || 'LayoutDashboard'
  }
  dialogOpen.value = true
}

function handleDelete(menu) {
  deleteMenu.value = menu
  deleteDialogOpen.value = true
}

function handleSubmit() {
  const newMenu = {
    id: isEdit.value ? form.value.id : nextId.value++,
    name: form.value.name,
    type: form.value.type,
    path: form.value.path,
    icon: iconMap[form.value.iconName],
    expanded: false
  }

  if (isEdit.value) {
    const parentId = form.value.parentId
    if (parentId) {
      const parent = menus.value.find(m => m.id === parentId)
      const childIndex = parent.children.findIndex(c => c.id === form.value.id)
      if (childIndex !== -1) {
        parent.children[childIndex] = newMenu
      }
    } else {
      const index = menus.value.findIndex(m => m.id === form.value.id)
      if (index !== -1) {
        const children = menus.value[index].children || []
        menus.value[index] = { ...newMenu, children }
      }
    }
  } else {
    if (form.value.parentId) {
      const parent = menus.value.find(m => m.id === form.value.parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(newMenu)
      }
    } else {
      menus.value.push({ ...newMenu, children: [] })
    }
  }
  dialogOpen.value = false
}

function confirmDelete() {
  const parentId = menus.value.find(m => m.children?.some(c => c.id === deleteMenu.value.id))?.id

  if (parentId) {
    const parent = menus.value.find(m => m.id === parentId)
    const childIndex = parent.children.findIndex(c => c.id === deleteMenu.value.id)
    if (childIndex !== -1) {
      parent.children.splice(childIndex, 1)
    }
  } else {
    const index = menus.value.findIndex(m => m.id === deleteMenu.value.id)
    if (index !== -1) {
      menus.value.splice(index, 1)
    }
  }

  deleteDialogOpen.value = false
  deleteMenu.value = null
}
</script>
