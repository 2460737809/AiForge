import { request } from '@/utils/request'

/**
 * 用户管理相关接口
 */

// 获取用户列表
export const getUserList = (params) => {
  return request.get('/api/users', params)
}

// 获取用户详情
export const getUserDetail = (id) => {
  return request.get(`/api/users/${id}`)
}

// 创建用户
export const createUser = (data) => {
  return request.post('/api/users', data)
}

// 更新用户
export const updateUser = (id, data) => {
  return request.put(`/api/users/${id}`, data)
}

// 删除用户
export const deleteUser = (id) => {
  return request.delete(`/api/users/${id}`)
}
