import { request } from '@/utils/request'

// 获取用户列表
export const getUserList = (params) => {
  return request.get('/users', params)
}

// 获取用户详情
export const getUserDetail = (id) => {
  return request.get(`/users/${id}`)
}

// 创建用户
export const createUser = (data) => {
  return request.post('/users', data)
}

// 更新用户
export const updateUser = (id, data) => {
  return request.put(`/users/${id}`, data)
}

// 删除用户
export const deleteUser = (id) => {
  return request.delete(`/users/${id}`)
}

// 更新用户状态
export const updateUserStatus = (id, status) => {
  return request.patch(`/users/${id}/status`, { status })
}

// 更新用户头像
export const updateUserAvatar = (id, formData) => {
  return request.upload(`/users/${id}/avatar`, formData)
}

// 获取用户权限
export const getUserPermissions = (id) => {
  return request.get(`/users/${id}/permissions`)
}