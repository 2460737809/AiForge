import { http, HttpResponse } from 'msw'

// 模拟数据
let users = [
  {
    id: 1,
    username: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: '正常',
    createdAt: '2024-01-10 10:00:00'
  },
  {
    id: 2,
    username: '李四',
    email: 'lisi@example.com',
    role: '普通用户',
    status: '正常',
    createdAt: '2024-01-11 14:30:00'
  },
  {
    id: 3,
    username: '王五',
    email: 'wangwu@example.com',
    role: '普通用户',
    status: '禁用',
    createdAt: '2024-01-12 09:15:00'
  },
  {
    id: 4,
    username: '赵六',
    email: 'zhaoliu@example.com',
    role: '普通用户',
    status: '正常',
    createdAt: '2024-01-13 16:45:00'
  },
  {
    id: 5,
    username: '钱七',
    email: 'qianqi@example.com',
    role: '管理员',
    status: '正常',
    createdAt: '2024-01-14 11:20:00'
  }
]

// 用户接口 handlers
export const userHandlers = [
  // 获取用户列表
  http.get('/api/users', () => {
    return HttpResponse.json({
      code: 200,
      message: '获取成功',
      data: users
    })
  }),

  // 获取用户详情
  http.get('/api/users/:id', ({ params }) => {
    const id = parseInt(params.id)
    const user = users.find(u => u.id === id)
    if (!user) {
      return HttpResponse.json(
        { code: 404, message: '用户不存在' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      code: 200,
      message: '获取成功',
      data: user
    })
  }),

  // 创建用户
  http.post('/api/users', async ({ request }) => {
    const data = await request.json()
    const newId = Math.max(...users.map(u => u.id)) + 1
    const now = new Date()
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    const newUser = {
      id: newId,
      ...data,
      createdAt
    }
    users.push(newUser)

    return HttpResponse.json({
      code: 200,
      message: '创建成功',
      data: newUser
    })
  }),

  // 更新用户
  http.put('/api/users/:id', async ({ params, request }) => {
    const id = parseInt(params.id)
    const data = await request.json()
    const index = users.findIndex(u => u.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '用户不存在' },
        { status: 404 }
      )
    }

    users[index] = {
      ...users[index],
      ...data
    }

    return HttpResponse.json({
      code: 200,
      message: '更新成功',
      data: users[index]
    })
  }),

  // 删除用户
  http.delete('/api/users/:id', ({ params }) => {
    const id = parseInt(params.id)
    const index = users.findIndex(u => u.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '用户不存在' },
        { status: 404 }
      )
    }

    users.splice(index, 1)

    return HttpResponse.json({
      code: 200,
      message: '删除成功'
    })
  })
]
