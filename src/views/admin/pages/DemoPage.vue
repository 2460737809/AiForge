<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>新增页面示例</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">
          这是一个新增的页面示例。你可以在 <code>src/views/admin/pages/</code> 目录下创建更多页面。
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
</script>
