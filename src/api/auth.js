import { request } from '@/utils/request'

// 登录
export const login = (credentials) => {
  return request.post('/auth/login', credentials)
}

// 登出
export const logout = () => {
  return request.post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/auth/userinfo')
}

// 刷新token
export const refreshToken = () => {
  return request.post('/auth/refresh')
}

// 修改密码
export const changePassword = (data) => {
  return request.post('/auth/change-password', data)
}

// 重置密码
export const resetPassword = (email) => {
  return request.post('/auth/reset-password', { email })
}

// 验证token有效性
export const validateToken = () => {
  return request.get('/auth/validate')
}