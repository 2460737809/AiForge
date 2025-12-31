import { http, HttpResponse } from 'msw'

// 模拟数据
let roles = [
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限',
    permissions: ['系统管理', '用户管理', '角色管理', '菜单管理', '日志查看', '系统配置'],
    userCount: 2
  },
  {
    id: 2,
    name: '管理员',
    description: '拥有部分管理权限',
    permissions: ['用户管理', '角色查看', '日志查看'],
    userCount: 5
  },
  {
    id: 3,
    name: '编辑',
    description: '内容编辑权限',
    permissions: ['内容编辑', '内容发布'],
    userCount: 10
  },
  {
    id: 4,
    name: '普通用户',
    description: '基础用户权限',
    permissions: ['内容查看'],
    userCount: 100
  }
]

// 角色接口 handlers
export const roleHandlers = [
  // 获取角色列表
  http.get('/api/roles', () => {
    return HttpResponse.json({
      code: 200,
      message: '获取成功',
      data: roles
    })
  }),

  // 获取角色详情
  http.get('/api/roles/:id', ({ params }) => {
    const id = parseInt(params.id)
    const role = roles.find(r => r.id === id)
    if (!role) {
      return HttpResponse.json(
        { code: 404, message: '角色不存在' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      code: 200,
      message: '获取成功',
      data: role
    })
  }),

  // 创建角色
  http.post('/api/roles', async ({ request }) => {
    const data = await request.json()
    const newId = Math.max(...roles.map(r => r.id)) + 1

    const newRole = {
      id: newId,
      ...data,
      userCount: 0
    }
    roles.push(newRole)

    return HttpResponse.json({
      code: 200,
      message: '创建成功',
      data: newRole
    })
  }),

  // 更新角色
  http.put('/api/roles/:id', async ({ params, request }) => {
    const id = parseInt(params.id)
    const data = await request.json()
    const index = roles.findIndex(r => r.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '角色不存在' },
        { status: 404 }
      )
    }

    roles[index] = {
      ...roles[index],
      ...data
    }

    return HttpResponse.json({
      code: 200,
      message: '更新成功',
      data: roles[index]
    })
  }),

  // 删除角色
  http.delete('/api/roles/:id', ({ params }) => {
    const id = parseInt(params.id)
    const index = roles.findIndex(r => r.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '角色不存在' },
        { status: 404 }
      )
    }

    roles.splice(index, 1)

    return HttpResponse.json({
      code: 200,
      message: '删除成功'
    })
  })
]
