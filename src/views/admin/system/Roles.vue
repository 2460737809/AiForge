<template>
  <div class="space-y-6">
    <!-- 操作栏 -->
    <Card>
      <CardContent class="p-6">
        <div class="flex justify-end">
          <Button @click="handleAdd">
            <Plus class="mr-2 h-4 w-4" />
            新增角色
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 角色列表 -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="role in roles" :key="role.id">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>{{ role.name }}</CardTitle>
            <div class="flex gap-2">
              <Button variant="ghost" size="sm" @click="handleEdit(role)">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="handleDelete(role)">
                <Trash2 class="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p class="mb-4 text-sm text-muted-foreground">{{ role.description }}</p>
          <div class="space-y-2">
            <p class="text-sm font-medium">权限列表:</p>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="perm in role.permissions" :key="perm" variant="secondary">
                {{ perm }}
              </Badge>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm">
            <Users class="h-4 w-4 text-muted-foreground" />
            <span class="text-muted-foreground">{{ role.userCount }} 用户</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 新增/编辑角色对话框 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ isEdit ? '编辑角色' : '新增角色' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label>角色名称</Label>
            <Input
              v-model="form.name"
              placeholder="请输入角色名称"
              required
            />
          </div>
          <div class="space-y-2">
            <Label>角色描述</Label>
            <Input
              v-model="form.description"
              placeholder="请输入角色描述"
              required
            />
          </div>
          <div class="space-y-2">
            <Label>权限</Label>
            <div class="space-y-2">
              <div v-for="perm in allPermissions" :key="perm" class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :id="perm"
                  v-model="form.permissions"
                  :value="perm"
                  class="rounded border-gray-300"
                />
                <Label :for="perm" class="cursor-pointer">{{ perm }}</Label>
              </div>
            </div>
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
          <p>确定要删除角色 <strong>{{ deleteRole?.name }}</strong> 吗？此操作无法撤销。</p>
          <p v-if="deleteRole?.userCount > 0" class="mt-2 text-sm text-amber-600">
            注意：该角色下还有 {{ deleteRole.userCount }} 个用户。
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
import { ref, onMounted } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import { getRoleList, createRole, updateRole, deleteRole as deleteRoleApi } from '@/api/admin/roles'
import { Plus, Edit, Trash2, Users } from 'lucide-vue-next'

const allPermissions = [
  '系统管理',
  '用户管理',
  '角色管理',
  '菜单管理',
  '日志查看',
  '系统配置',
  '内容编辑',
  '内容发布',
  '内容查看',
  '角色查看'
]

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEdit = ref(false)
const deleteRole = ref(null)
const loading = ref(false)

const form = ref({
  id: null,
  name: '',
  description: '',
  permissions: []
})

const roles = ref([])

// 加载角色列表
async function loadRoles() {
  try {
    loading.value = true
    const res = await getRoleList()
    if (res.code === 200) {
      roles.value = res.data
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(() => {
  loadRoles()
})

function handleAdd() {
  isEdit.value = false
  form.value = {
    id: null,
    name: '',
    description: '',
    permissions: []
  }
  dialogOpen.value = true
}

function handleEdit(role) {
  isEdit.value = true
  form.value = {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: [...role.permissions]
  }
  dialogOpen.value = true
}

function handleDelete(role) {
  deleteRole.value = role
  deleteDialogOpen.value = true
}

async function handleSubmit() {
  try {
    if (isEdit.value) {
      const res = await updateRole(form.value.id, {
        name: form.value.name,
        description: form.value.description,
        permissions: form.value.permissions
      })
      if (res.code === 200) {
        const index = roles.value.findIndex(r => r.id === form.value.id)
        if (index !== -1) {
          roles.value[index] = res.data
        }
      }
    } else {
      const res = await createRole({
        name: form.value.name,
        description: form.value.description,
        permissions: form.value.permissions
      })
      if (res.code === 200) {
        roles.value.push(res.data)
      }
    }
    dialogOpen.value = false
  } catch (error) {
    console.error('操作失败:', error)
  }
}

async function confirmDelete() {
  try {
    const res = await deleteRoleApi(deleteRole.value.id)
    if (res.code === 200) {
      const index = roles.value.findIndex(r => r.id === deleteRole.value.id)
      if (index !== -1) {
        roles.value.splice(index, 1)
      }
    }
    deleteDialogOpen.value = false
    deleteRole.value = null
  } catch (error) {
    console.error('删除失败:', error)
  }
}
</script>
