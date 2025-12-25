# 静态图片资源目录

## 目录结构

```
assets/images/
├── icons/          # 图标文件
├── backgrounds/    # 背景图片
├── avatars/        # 头像图片
├── banners/        # 轮播图
├── logos/          # Logo文件
└── placeholder/    # 占位图
```

## 使用方式

```javascript
// 在Vue组件中导入图片
import defaultAvatar from '@/assets/images/avatars/default.png'

// 在CSS中使用
background-image: url('@/assets/images/backgrounds/pattern.jpg')
```

## 图片命名规范

- 使用小写字母和连字符：`user-avatar.png`
- 避免使用空格和特殊字符
- 包含尺寸信息：`logo-512x512.png`