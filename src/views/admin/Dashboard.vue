<template>
  <div class="space-y-6">
    <!-- 统计卡片 -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <span class="text-sm font-medium">总用户数</span>
            <Users class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="text-2xl font-bold">2,345</div>
          <p class="text-xs text-muted-foreground">+20.1% 较上月</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <span class="text-sm font-medium">活跃用户</span>
            <Activity class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="text-2xl font-bold">1,289</div>
          <p class="text-xs text-muted-foreground">+15.3% 较上月</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <span class="text-sm font-medium">今日访问</span>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="text-2xl font-bold">8,543</div>
          <p class="text-xs text-muted-foreground">+32.5% 较昨日</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <span class="text-sm font-medium">系统负载</span>
            <Cpu class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="text-2xl font-bold">45%</div>
          <p class="text-xs text-muted-foreground">运行正常</p>
        </CardContent>
      </Card>
    </div>

    <!-- 图表和列表 -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- 快捷操作 -->
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-3">
            <Button variant="outline" class="justify-start">
              <Plus class="mr-2 h-4 w-4" />
              新增用户
            </Button>
            <Button variant="outline" class="justify-start">
              <FilePlus class="mr-2 h-4 w-4" />
              发布公告
            </Button>
            <Button variant="outline" class="justify-start">
              <Settings class="mr-2 h-4 w-4" />
              系统配置
            </Button>
            <Button variant="outline" class="justify-start">
              <Database class="mr-2 h-4 w-4" />
              数据备份
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 最新动态 -->
      <Card>
        <CardHeader>
          <CardTitle>最新动态</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                <User class="h-4 w-4 text-blue-500" />
              </div>
              <div class="flex-1">
                <p class="text-sm"><span class="font-medium">张三</span> 注册了新账号</p>
                <p class="text-xs text-muted-foreground">5分钟前</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle class="h-4 w-4 text-green-500" />
              </div>
              <div class="flex-1">
                <p class="text-sm"><span class="font-medium">李四</span> 完成了实名认证</p>
                <p class="text-xs text-muted-foreground">15分钟前</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                <Shield class="h-4 w-4 text-purple-500" />
              </div>
              <div class="flex-1">
                <p class="text-sm">系统安全检查完成</p>
                <p class="text-xs text-muted-foreground">1小时前</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
                <Database class="h-4 w-4 text-orange-500" />
              </div>
              <div class="flex-1">
                <p class="text-sm">数据备份成功</p>
                <p class="text-xs text-muted-foreground">2小时前</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 最近登录 -->
    <Card>
      <CardHeader>
        <CardTitle>最近登录</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>IP地址</TableHead>
              <TableHead>登录时间</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>张三</TableCell>
              <TableCell>192.168.1.100</TableCell>
              <TableCell>2024-01-15 10:30:25</TableCell>
              <TableCell><span class="text-green-600">成功</span></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>李四</TableCell>
              <TableCell>192.168.1.101</TableCell>
              <TableCell>2024-01-15 09:15:33</TableCell>
              <TableCell><span class="text-green-600">成功</span></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>王五</TableCell>
              <TableCell>192.168.1.102</TableCell>
              <TableCell>2024-01-15 08:45:12</TableCell>
              <TableCell><span class="text-red-600">失败</span></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Button from '@/components/ui/button/Button.vue'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import {
  Users,
  Activity,
  TrendingUp,
  Cpu,
  Plus,
  FilePlus,
  Settings,
  Database,
  User,
  CheckCircle,
  Shield
} from 'lucide-vue-next'
</script>
