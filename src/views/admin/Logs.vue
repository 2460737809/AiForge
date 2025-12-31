<template>
  <div class="space-y-6">
    <!-- 筛选栏 -->
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-end">
          <div class="flex-1 space-y-2">
            <Label>操作类型</Label>
            <select
              v-model="filters.operationType"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">全部</option>
              <option value="新增">新增</option>
              <option value="修改">修改</option>
              <option value="删除">删除</option>
              <option value="查询">查询</option>
            </select>
          </div>
          <div class="flex-1 space-y-2">
            <Label>时间范围</Label>
            <Input v-model="filters.dateRange" placeholder="选择时间范围" />
          </div>
          <div class="flex gap-2">
            <Button @click="handleSearch">
              <Search class="mr-2 h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" @click="handleExport">
              <Download class="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 日志列表 -->
    <Card>
      <CardContent class="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日志ID</TableHead>
              <TableHead>操作人</TableHead>
              <TableHead>操作类型</TableHead>
              <TableHead>操作模块</TableHead>
              <TableHead>操作内容</TableHead>
              <TableHead>IP地址</TableHead>
              <TableHead>操作时间</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="log in logs" :key="log.id">
              <TableCell>{{ log.id }}</TableCell>
              <TableCell>{{ log.operator }}</TableCell>
              <TableCell>
                <Badge
                  :variant="getBadgeVariant(log.operationType)"
                >
                  {{ log.operationType }}
                </Badge>
              </TableCell>
              <TableCell>{{ log.module }}</TableCell>
              <TableCell class="max-w-xs truncate">{{ log.content }}</TableCell>
              <TableCell>{{ log.ip }}</TableCell>
              <TableCell>{{ log.createTime }}</TableCell>
              <TableCell>
                <span
                  :class="{
                    'text-green-600': log.status === '成功',
                    'text-red-600': log.status === '失败'
                  }"
                >
                  {{ log.status }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- 分页 -->
        <div class="mt-6 flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            显示第 1 到 10 条，共 {{ logs.length }} 条记录
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="currentPage === 1">上一页</Button>
            <Button variant="outline" size="sm">下一页</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import { Search, Download } from 'lucide-vue-next'

const currentPage = ref(1)
const filters = reactive({
  operationType: '',
  dateRange: ''
})

const logs = ref([
  {
    id: 1,
    operator: '管理员',
    operationType: '新增',
    module: '用户管理',
    content: '新增用户"张三"',
    ip: '192.168.1.100',
    createTime: '2024-01-15 10:30:25',
    status: '成功'
  },
  {
    id: 2,
    operator: '管理员',
    operationType: '修改',
    module: '角色管理',
    content: '修改角色"编辑"的权限',
    ip: '192.168.1.100',
    createTime: '2024-01-15 09:15:33',
    status: '成功'
  },
  {
    id: 3,
    operator: '管理员',
    operationType: '删除',
    module: '菜单管理',
    content: '删除菜单"测试菜单"',
    ip: '192.168.1.100',
    createTime: '2024-01-15 08:45:12',
    status: '成功'
  },
  {
    id: 4,
    operator: '张三',
    operationType: '查询',
    module: '用户管理',
    content: '查询用户列表',
    ip: '192.168.1.101',
    createTime: '2024-01-14 16:45:00',
    status: '成功'
  },
  {
    id: 5,
    operator: '李四',
    operationType: '修改',
    module: '用户管理',
    content: '修改用户信息失败',
    ip: '192.168.1.102',
    createTime: '2024-01-14 15:20:00',
    status: '失败'
  }
])

function handleSearch() {
  console.log('搜索日志:', filters)
}

function handleExport() {
  console.log('导出日志')
}

function getBadgeVariant(type) {
  const variants = {
    '新增': 'default',
    '修改': 'secondary',
    '删除': 'destructive',
    '查询': 'outline'
  }
  return variants[type] || 'outline'
}
</script>
