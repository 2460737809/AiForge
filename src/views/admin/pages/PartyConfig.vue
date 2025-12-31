<template>
  <div class="space-y-6">
    <!-- 配置面板 -->
    <Card>
      <CardHeader>
        <CardTitle>Party.js 动画配置</CardTitle>
        <CardDescription>配置鼠标点击时的动画效果</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 动画类型 -->
        <div class="space-y-2">
          <Label for="animation-type">动画类型</Label>
          <Select :options="animationTypes" v-model="config.animationType" />
        </div>

        <!-- 粒子数量 -->
        <div class="space-y-2">
          <Label for="particle-count">粒子数量: {{ config.particleCount.toFixed(1) }}</Label>
          <Slider
            id="particle-count"
            :min="10"
            :max="200"
            :step="1"
            v-model="config.particleCount"
          />
        </div>

        <!-- 颜色模式 -->
        <div class="space-y-2">
          <Label>颜色模式</Label>
          <RadioGroup v-model="config.colorMode">
            <RadioItem value="random">随机颜色</RadioItem>
            <RadioItem value="fixed">固定颜色</RadioItem>
            <RadioItem value="gradient">渐变色</RadioItem>
          </RadioGroup>
        </div>

        <!-- 固定颜色选择 -->
        <div v-if="config.colorMode === 'fixed'" class="space-y-2">
          <Label for="color">选择颜色</Label>
          <Input
            id="color"
            type="color"
            v-model="config.color"
            class="w-20 h-10 cursor-pointer"
          />
        </div>

        <!-- 粒子大小 -->
        <div class="space-y-2">
          <Label for="particle-size">粒子大小: {{ config.particleSize.toFixed(1) }}px</Label>
          <Slider
            id="particle-size"
            :min="0.1"
            :max="5"
            :step="0.1"
            v-model="config.particleSize"
          />
        </div>

        <!-- 扩散范围 -->
        <div class="space-y-2">
          <Label for="spread-speed">扩散范围: {{ config.spreadSpeed.toFixed(1) }}</Label>
          <Slider
            id="spread-speed"
            :min="1"
            :max="100"
            :step="1"
            v-model="config.spreadSpeed"
          />
        </div>

        <!-- 重力效果 -->
        <div class="space-y-2">
          <Label for="gravity">重力: {{ config.gravity.toFixed(1) }}</Label>
          <Slider
            id="gravity"
            :min="0"
            :max="20"
            :step="0.1"
            v-model="config.gravity"
          />
        </div>

        <!-- 开关选项 -->
        <div class="flex flex-wrap items-center gap-6">
          <Checkbox v-model="config.enabled">
            启用动画
          </Checkbox>
          <Checkbox v-model="config.rotating">
            旋转效果
          </Checkbox>
          <Checkbox v-model="config.fadeOut">
            淡出效果
          </Checkbox>
        </div>
      </CardContent>
    </Card>

    <!-- 预览区域 -->
    <Card>
      <CardHeader>
        <CardTitle>点击预览区域</CardTitle>
        <CardDescription>点击下方区域查看动画效果</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref="previewArea"
          class="relative h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg cursor-pointer select-none"
          @click="handlePreviewClick"
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-muted-foreground text-lg">
              点击此处预览动画效果
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 使用说明 -->
    <Card>
      <CardHeader>
        <CardTitle>使用说明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="bg-muted rounded-lg p-4 text-sm space-y-2">
          <p>1. 在配置面板中调整动画参数</p>
          <p>2. 点击预览区域查看效果</p>
          <p>3. 调整到满意后，点击"应用全局"按钮</p>
          <p>4. 全局应用后，页面任意位置点击都会触发动画</p>
        </div>
      </CardContent>
    </Card>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <Button @click="applyGlobally" :variant="isGlobalEnabled ? 'destructive' : 'default'">
        {{ isGlobalEnabled ? '取消全局' : '应用全局' }}
      </Button>
      <Button @click="resetConfig" variant="outline">
        重置配置
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import party from 'party-js'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Select from '@/components/ui/select/Select.vue'
import Label from '@/components/ui/label/Label.vue'
import Slider from '@/components/ui/slider/Slider.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import { RadioGroup, RadioItem } from '@/components/ui/radio/index.js'
import { usePartyStore } from '@/stores/party'

const animationTypes = [
  { label: 'Confetti (彩带)', value: 'confetti' },
  { label: 'Sparkles (闪烁)', value: 'sparkles' },
  { label: 'Rectangles (矩形)', value: 'rectangles' },
  { label: 'Circles (圆形)', value: 'circles' },
  { label: 'Burst (爆炸)', value: 'burst' }
]

const partyStore = usePartyStore()
const { config, isGlobalEnabled } = storeToRefs(partyStore)

const previewArea = ref(null)

// 获取颜色数组
const getColors = () => {
  if (config.value.colorMode === 'fixed') {
    return [config.value.color]
  } else if (config.value.colorMode === 'gradient') {
    return ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']
  }
  return undefined // random mode
}

// 处理预览点击
const handlePreviewClick = (event) => {
  if (!config.value.enabled) return

  const colors = getColors()
  const options = colors ? { colors } : {}

  party.confetti(event, {
    count: config.value.particleCount,
    spread: config.value.spreadSpeed,
    size: config.value.particleSize,
    ...options
  })
}

// 应用到全局
const applyGlobally = () => {
  partyStore.toggleGlobal()
}

// 重置配置
const resetConfig = () => {
  partyStore.resetConfig()
}
</script>
