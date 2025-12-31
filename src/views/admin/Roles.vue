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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Plus, Edit, Trash2, Users } from 'lucide-vue-next'

const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限',
    permissions: ['系统管理', '用户管理', '角色管理', '菜单管理', '日志查看', '系统配置'],
    userCount: 2
  },
  {
    id: 2,
    name: '管理员',
    description: '拥有部分管理权限',
    permissions: ['用户管理', '角色查看', '日志查看'],
    userCount: 5
  },
  {
    id: 3,
    name: '编辑',
    description: '内容编辑权限',
    permissions: ['内容编辑', '内容发布'],
    userCount: 10
  },
  {
    id: 4,
    name: '普通用户',
    description: '基础用户权限',
    permissions: ['内容查看'],
    userCount: 100
  }
])

function handleAdd() {
  console.log('新增角色')
}

function handleEdit(role) {
  console.log('编辑角色:', role)
}

function handleDelete(role) {
  console.log('删除角色:', role)
}
</script>
