import { request } from '@/utils/request'

// 文件上传
export const uploadFile = (formData, config = {}) => {
  return request.upload('/upload', formData, config)
}

// 获取系统配置
export const getSystemConfig = () => {
  return request.get('/system/config')
}

// 获取字典数据
export const getDictData = (type) => {
  return request.get(`/system/dict/${type}`)
}

// 发送验证码
export const sendVerificationCode = (data) => {
  return request.post('/common/send-code', data)
}

// 验证验证码
export const verifyCode = (data) => {
  return request.post('/common/verify-code', data)
}

// 获取地理位置
export const getLocation = () => {
  return request.get('/common/location')
}

// 检查更新
export const checkUpdate = () => {
  return request.get('/common/check-update')
}