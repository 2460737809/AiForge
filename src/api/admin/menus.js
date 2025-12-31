import { request } from '@/utils/request'

/**
 * 菜单管理相关接口
 */

// 获取菜单列表
export const getMenuList = (params) => {
  return request.get('/api/menus', params)
}

// 获取菜单详情
export const getMenuDetail = (id) => {
  return request.get(`/api/menus/${id}`)
}

// 创建菜单
export const createMenu = (data) => {
  return request.post('/api/menus', data)
}

// 更新菜单
export const updateMenu = (id, data) => {
  return request.put(`/api/menus/${id}`, data)
}

// 删除菜单
export const deleteMenu = (id) => {
  return request.delete(`/api/menus/${id}`)
}
