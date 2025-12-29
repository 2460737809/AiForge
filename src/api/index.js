import { request } from '@/utils/request'

// 导出所有API模块
export * from './auth'
export * from './user'
export * from './common'
export * from './tianApi'

// 统一的API响应处理
export const handleApiResponse = (response) => {
  return response.data || response
}

// 错误处理工具
export const handleError = (error) => {
  console.error('API Error:', error)
  throw error
}