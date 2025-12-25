/**
 * 路由守卫配置
 */

export function setupRouterGuards(router) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || 'Vue3 Project'}`
    }

    // 开始进度条
    if (window.NProgress) {
      window.NProgress.start()
    }

    // 这里可以添加权限验证逻辑
    // const token = localStorage.getItem('token')
    // if (to.meta.requiresAuth && !token) {
    //   next('/login')
    //   return
    // }

    next()
  })

  // 全局后置钩子
  router.afterEach((to, from) => {
    // 结束进度条
    if (window.NProgress) {
      window.NProgress.done()
    }

    // 记录路由变化（可选）
    console.log(`Route changed from ${from.path} to ${to.path}`)
  })

  // 全局错误守卫
  router.onError((error) => {
    console.error('Router error:', error)
    // 这里可以添加错误处理逻辑
  })
}