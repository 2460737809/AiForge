<template>
  <div class="space-y-6">
    <!-- 操作栏 -->
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex gap-2">
            <Input
              v-model="searchText"
              placeholder="搜索用户..."
              class="w-64"
            />
            <Button @click="handleSearch">
              <Search class="mr-2 h-4 w-4" />
              搜索
            </Button>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" @click="handleRefresh">
              <RefreshCw class="mr-2 h-4 w-4" />
              刷新
            </Button>
            <Button @click="handleAdd">
              <Plus class="mr-2 h-4 w-4" />
              新增用户
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 用户列表 -->
    <Card>
      <CardContent class="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">
                <input type="checkbox" class="rounded border-gray-300" />
              </TableHead>
              <TableHead>用户ID</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead class="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>
                <input type="checkbox" class="rounded border-gray-300" />
              </TableCell>
              <TableCell>{{ user.id }}</TableCell>
              <TableCell>{{ user.username }}</TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-blue-100 text-blue-800': user.role === '管理员',
                    'bg-green-100 text-green-800': user.role === '普通用户'
                  }"
                >
                  {{ user.role }}
                </span>
              </TableCell>
              <TableCell>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': user.status === '正常',
                    'bg-red-100 text-red-800': user.status === '禁用'
                  }"
                >
                  {{ user.status }}
                </span>
              </TableCell>
              <TableCell>{{ user.createdAt }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" @click="handleEdit(user)">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="handleDelete(user)">
                    <Trash2 class="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- 分页 -->
        <div class="mt-6 flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            显示第 1 到 10 条，共 {{ users.length }} 条记录
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="currentPage === 1">上一页</Button>
            <Button variant="outline" size="sm">下一页</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 新增/编辑用户对话框 -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ isEdit ? '编辑用户' : '新增用户' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label>用户名</Label>
            <Input
              v-model="form.username"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="space-y-2">
            <Label>邮箱</Label>
            <Input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div class="space-y-2">
            <Label>角色</Label>
            <Select
              v-model="form.role"
              :options="roleOptions"
              placeholder="请选择角色"
              required
            />
          </div>
          <div class="space-y-2">
            <Label>状态</Label>
            <Select
              v-model="form.status"
              :options="statusOptions"
              placeholder="请选择状态"
              required
            />
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
          <p>确定要删除用户 <strong>{{ deleteUser?.username }}</strong> 吗？此操作无法撤销。</p>
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
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import { Select } from '@/components/ui/select'
import { getUserList, createUser, updateUser, deleteUser as deleteUserApi } from '@/api/admin/users'
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2
} from 'lucide-vue-next'

const searchText = ref('')
const currentPage = ref(1)
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEdit = ref(false)
const deleteUser = ref(null)
const loading = ref(false)

const form = ref({
  id: null,
  username: '',
  email: '',
  role: '普通用户',
  status: '正常'
})

const roleOptions = [
  { value: '普通用户', label: '普通用户' },
  { value: '管理员', label: '管理员' }
]

const statusOptions = [
  { value: '正常', label: '正常' },
  { value: '禁用', label: '禁用' }
]

const users = ref([])

// 加载用户列表
async function loadUsers() {
  try {
    loading.value = true
    const res = await getUserList()
    if (res.code === 200) {
      users.value = res.data
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(() => {
  loadUsers()
})

function handleSearch() {
  console.log('搜索:', searchText.value)
}

function handleRefresh() {
  loadUsers()
}

function handleAdd() {
  isEdit.value = false
  form.value = {
    id: null,
    username: '',
    email: '',
    role: '普通用户',
    status: '正常'
  }
  dialogOpen.value = true
}

function handleEdit(user) {
  isEdit.value = true
  form.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status
  }
  dialogOpen.value = true
}

function handleDelete(user) {
  deleteUser.value = user
  deleteDialogOpen.value = true
}

async function handleSubmit() {
  try {
    if (isEdit.value) {
      const res = await updateUser(form.value.id, {
        username: form.value.username,
        email: form.value.email,
        role: form.value.role,
        status: form.value.status
      })
      if (res.code === 200) {
        const index = users.value.findIndex(u => u.id === form.value.id)
        if (index !== -1) {
          users.value[index] = res.data
        }
      }
    } else {
      const res = await createUser({
        username: form.value.username,
        email: form.value.email,
        role: form.value.role,
        status: form.value.status
      })
      if (res.code === 200) {
        users.value.push(res.data)
      }
    }
    dialogOpen.value = false
  } catch (error) {
    console.error('操作失败:', error)
  }
}

async function confirmDelete() {
  try {
    const res = await deleteUserApi(deleteUser.value.id)
    if (res.code === 200) {
      const index = users.value.findIndex(u => u.id === deleteUser.value.id)
      if (index !== -1) {
        users.value.splice(index, 1)
      }
    }
    deleteDialogOpen.value = false
    deleteUser.value = null
  } catch (error) {
    console.error('删除失败:', error)
  }
}
</script>
