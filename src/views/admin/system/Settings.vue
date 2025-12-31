<template>
  <div class="space-y-6">
    <!-- 系统信息 -->
    <Card>
      <CardHeader>
        <CardTitle>系统信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <Label>系统名称</Label>
            <Input v-model="settings.systemName" class="mt-2" />
          </div>
          <div>
            <Label>系统版本</Label>
            <Input v-model="settings.version" class="mt-2" disabled />
          </div>
          <div>
            <Label>系统描述</Label>
            <Input v-model="settings.description" class="mt-2" />
          </div>
          <div>
            <Label>作者</Label>
            <Input v-model="settings.author" class="mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 基本设置 -->
    <Card>
      <CardHeader>
        <CardTitle>基本设置</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <Label>网站名称</Label>
            <Input v-model="settings.siteName" class="mt-2" />
          </div>
          <div>
            <Label>网站关键字</Label>
            <Input v-model="settings.keywords" class="mt-2" />
          </div>
        </div>
        <div>
          <Label>网站描述</Label>
          <textarea
            v-model="settings.siteDescription"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="registerEnabled"
            v-model="settings.registerEnabled"
            class="h-4 w-4 rounded border-gray-300"
          />
          <Label for="registerEnabled">允许用户注册</Label>
        </div>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailVerify"
            v-model="settings.emailVerify"
            class="h-4 w-4 rounded border-gray-300"
          />
          <Label for="emailVerify">注册需要邮箱验证</Label>
        </div>
      </CardContent>
    </Card>

    <!-- 安全设置 -->
    <Card>
      <CardHeader>
        <CardTitle>安全设置</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <Label>密码最小长度</Label>
          <Input v-model.number="settings.minPasswordLength" type="number" class="mt-2 w-48" />
        </div>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="passwordComplexity"
            v-model="settings.passwordComplexity"
            class="h-4 w-4 rounded border-gray-300"
          />
          <Label for="passwordComplexity">启用密码复杂度检查</Label>
        </div>
        <div>
          <Label>登录失败锁定次数</Label>
          <Input v-model.number="settings.maxLoginAttempts" type="number" class="mt-2 w-48" />
        </div>
        <div>
          <Label>锁定时长(分钟)</Label>
          <Input v-model.number="settings.lockDuration" type="number" class="mt-2 w-48" />
        </div>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="twoFactorAuth"
            v-model="settings.twoFactorAuth"
            class="h-4 w-4 rounded border-gray-300"
          />
          <Label for="twoFactorAuth">启用双因素认证</Label>
        </div>
      </CardContent>
    </Card>

    <!-- 邮件设置 -->
    <Card>
      <CardHeader>
        <CardTitle>邮件设置</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <Label>SMTP服务器</Label>
          <Input v-model="settings.smtpHost" placeholder="smtp.example.com" class="mt-2" />
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <Label>SMTP端口</Label>
            <Input v-model="settings.smtpPort" placeholder="587" class="mt-2" />
          </div>
          <div>
            <Label>发件人邮箱</Label>
            <Input v-model="settings.fromEmail" placeholder="noreply@example.com" class="mt-2" />
          </div>
        </div>
        <div>
          <Label>SMTP用户名</Label>
          <Input v-model="settings.smtpUser" class="mt-2" />
        </div>
        <div>
          <Label>SMTP密码</Label>
          <Input v-model="settings.smtpPassword" type="password" class="mt-2" />
        </div>
        <div>
          <Button @click="testEmail">测试邮件发送</Button>
        </div>
      </CardContent>
    </Card>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-4">
      <Button variant="outline" @click="handleReset">重置</Button>
      <Button @click="handleSave">保存设置</Button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

const settings = reactive({
  // 系统信息
  systemName: 'AiForge 管理系统',
  version: '1.0.0',
  description: '基于Vue3 + Vite + Shadcn UI构建的现代化管理系统',
  author: 'AiForge Team',
  // 基本设置
  siteName: 'AiForge',
  keywords: 'AiForge,管理系统,Vue3',
  siteDescription: 'AiForge 现代化管理系统',
  registerEnabled: true,
  emailVerify: false,
  // 安全设置
  minPasswordLength: 6,
  passwordComplexity: true,
  maxLoginAttempts: 5,
  lockDuration: 30,
  twoFactorAuth: false,
  // 邮件设置
  smtpHost: '',
  smtpPort: '587',
  fromEmail: '',
  smtpUser: '',
  smtpPassword: ''
})

function handleSave() {
  console.log('保存设置:', settings)
  alert('设置保存成功!')
}

function handleReset() {
  console.log('重置设置')
  alert('已重置为默认设置')
}

function testEmail() {
  console.log('测试邮件发送')
  alert('测试邮件已发送')
}
</script>
