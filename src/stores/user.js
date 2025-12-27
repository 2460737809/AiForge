import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const permissions = ref([])

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const userRole = computed(() => userInfo.value?.role || 'guest')

  // 方法
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUserInfo = (info) => {
    userInfo.value = info
  }

  const setPermissions = (perms) => {
    permissions.value = perms
  }

  // 登录
  const doLogin = async (credentials) => {
    try {
      const response = await login(credentials)
      const { token: userToken, userInfo: info, permissions: perms } = response.data
      
      setToken(userToken)
      setUserInfo(info)
      setPermissions(perms)
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // 登出
  const doLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setToken('')
      setUserInfo(null)
      setPermissions([])
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const response = await getUserInfo()
      setUserInfo(response.data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // 检查权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  // 初始化用户状态
  const initUser = async () => {
    if (token.value && !userInfo.value) {
      try {
        await fetchUserInfo()
      } catch (error) {
        // Token可能已过期，清除登录状态
        setToken('')
        setUserInfo(null)
        setPermissions([])
      }
    }
  }

  return {
    // 状态
    token,
    userInfo,
    permissions,
    
    // 计算属性
    isLoggedIn,
    username,
    userRole,
    
    // 方法
    setToken,
    setUserInfo,
    setPermissions,
    doLogin,
    doLogout,
    fetchUserInfo,
    hasPermission,
    initUser
  }
})