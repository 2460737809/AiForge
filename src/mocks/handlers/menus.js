import { http, HttpResponse } from 'msw'

// 模拟数据
let menus = [
  {
    id: 1,
    name: '控制台',
    path: '/admin/dashboard',
    type: '菜单',
    icon: 'LayoutDashboard',
    parentId: null,
    children: []
  },
  {
    id: 2,
    name: '系统管理',
    path: '',
    type: '目录',
    icon: 'Settings',
    parentId: null,
    children: [
      {
        id: 21,
        name: '用户管理',
        path: '/admin/system/users',
        type: '菜单',
        icon: 'Users',
        parentId: 2
      },
      {
        id: 22,
        name: '角色管理',
        path: '/admin/system/roles',
        type: '菜单',
        icon: 'Shield',
        parentId: 2
      },
      {
        id: 23,
        name: '菜单管理',
        path: '/admin/system/menus',
        type: '菜单',
        icon: 'Settings',
        parentId: 2
      }
    ]
  },
  {
    id: 3,
    name: '日志管理',
    path: '',
    type: '目录',
    icon: 'FileText',
    parentId: null,
    children: [
      {
        id: 31,
        name: '操作日志',
        path: '/admin/system/logs',
        type: '菜单',
        icon: 'FileText',
        parentId: 3
      }
    ]
  }
]

// 菜单接口 handlers
export const menuHandlers = [
  // 获取菜单列表
  http.get('/api/menus', () => {
    return HttpResponse.json({
      code: 200,
      message: '获取成功',
      data: menus
    })
  }),

  // 获取菜单详情
  http.get('/api/menus/:id', ({ params }) => {
    const id = parseInt(params.id)

    // 查找根菜单
    let menu = menus.find(m => m.id === id)
    if (!menu) {
      // 查找子菜单
      for (const parent of menus) {
        if (parent.children) {
          menu = parent.children.find(c => c.id === id)
          if (menu) break
        }
      }
    }

    if (!menu) {
      return HttpResponse.json(
        { code: 404, message: '菜单不存在' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      code: 200,
      message: '获取成功',
      data: menu
    })
  }),

  // 创建菜单
  http.post('/api/menus', async ({ request }) => {
    const data = await request.json()
    const newId = Math.max(...menus.map(m => m.id), ...menus.flatMap(m => m.children?.map(c => c.id) || [])) + 1

    const newMenu = {
      id: newId,
      ...data
    }

    if (data.parentId) {
      const parent = menus.find(m => m.id === data.parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(newMenu)
      }
    } else {
      newMenu.children = []
      menus.push(newMenu)
    }

    return HttpResponse.json({
      code: 200,
      message: '创建成功',
      data: newMenu
    })
  }),

  // 更新菜单
  http.put('/api/menus/:id', async ({ params, request }) => {
    const id = parseInt(params.id)
    const data = await request.json()

    // 查找并更新菜单
    let menu, parent
    menu = menus.find(m => m.id === id)

    if (!menu) {
      for (const p of menus) {
        if (p.children) {
          const childIndex = p.children.findIndex(c => c.id === id)
          if (childIndex !== -1) {
            menu = p.children[childIndex]
            parent = p
            break
          }
        }
      }
    }

    if (!menu) {
      return HttpResponse.json(
        { code: 404, message: '菜单不存在' },
        { status: 404 }
      )
    }

    // 处理父级菜单变更
    if (data.parentId !== undefined && data.parentId !== menu.parentId) {
      // 从原父级移除
      if (parent) {
        const index = parent.children.findIndex(c => c.id === id)
        parent.children.splice(index, 1)
      } else {
        const index = menus.findIndex(m => m.id === id)
        menus.splice(index, 1)
      }

      // 添加到新父级
      if (data.parentId) {
        const newParent = menus.find(m => m.id === data.parentId)
        if (newParent) {
          if (!newParent.children) {
            newParent.children = []
          }
          newParent.children.push(menu)
        }
      } else {
        menus.push(menu)
      }
    }

    Object.assign(menu, data)

    return HttpResponse.json({
      code: 200,
      message: '更新成功',
      data: menu
    })
  }),

  // 删除菜单
  http.delete('/api/menus/:id', ({ params }) => {
    const id = parseInt(params.id)

    // 查找菜单
    let menu, parent
    menu = menus.find(m => m.id === id)

    if (!menu) {
      for (const p of menus) {
        if (p.children) {
          const index = p.children.findIndex(c => c.id === id)
          if (index !== -1) {
            menu = p.children[index]
            parent = p
            break
          }
        }
      }
    }

    if (!menu) {
      return HttpResponse.json(
        { code: 404, message: '菜单不存在' },
        { status: 404 }
      )
    }

    // 删除菜单
    if (parent) {
      const index = parent.children.findIndex(c => c.id === id)
      parent.children.splice(index, 1)
    } else {
      const index = menus.findIndex(m => m.id === id)
      menus.splice(index, 1)
    }

    return HttpResponse.json({
      code: 200,
      message: '删除成功'
    })
  })
]
