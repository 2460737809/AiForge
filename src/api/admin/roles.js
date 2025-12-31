import { request } from '@/utils/request'

/**
 * 角色管理相关接口
 */

// 获取角色列表
export const getRoleList = (params) => {
  return request.get('/api/roles', params)
}

// 获取角色详情
export const getRoleDetail = (id) => {
  return request.get(`/api/roles/${id}`)
}

// 创建角色
export const createRole = (data) => {
  return request.post('/api/roles', data)
}

// 更新角色
export const updateRole = (id, data) => {
  return request.put(`/api/roles/${id}`, data)
}

// 删除角色
export const deleteRole = (id) => {
  return request.delete(`/api/roles/${id}`)
}
