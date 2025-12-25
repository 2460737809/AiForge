import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // 开发环境下打印请求信息
    if (import.meta.env.DEV) {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data
      })
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data, config } = response

    // 开发环境下打印响应信息
    if (import.meta.env.DEV) {
      console.log('Response:', {
        url: config.url,
        data: data
      })
    }

    // 根据后端约定的状态码处理响应
    if (data.code !== undefined) {
      // 成功响应
      if (data.code === 200 || data.code === 0) {
        return data
      }

      // token过期或无效
      if (data.code === 401) {
        handleUnauthorized()
        return Promise.reject(new Error('登录已过期，请重新登录'))
      }

      // 权限不足
      if (data.code === 403) {
        ElMessage.error('权限不足')
        return Promise.reject(new Error('权限不足'))
      }

      // 其他错误
      const message = data.message || '请求失败'
      console.error(message)
      return Promise.reject(new Error(message))
    }

    // 如果没有code字段，直接返回数据
    return data
  },
  (error) => {
    console.error('Response error:', error)

    let message = '网络错误'

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 401:
          handleUnauthorized()
          message = '登录已过期，请重新登录'
          break
        case 403:
          message = '权限不足'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message = '网络连接失败，请检查网络'
    } else {
      // 其他错误
      message = error.message || '未知错误'
    }

    // 显示错误消息
    console.error(message)

    return Promise.reject(new Error(message))
  }
)

// 处理未授权访问
function handleUnauthorized() {
  const userStore = useUserStore()
  
  if (confirm('登录状态已过期，请重新登录')) {
    userStore.doLogout()
    // 跳转到登录页
    window.location.href = '/login'
  } else {
    // 用户取消，清除登录状态
    userStore.doLogout()
  }
}

// 封装常用的请求方法
const request = {
  get(url, params = {}, config = {}) {
    return service.get(url, { params, ...config })
  },

  post(url, data = {}, config = {}) {
    return service.post(url, data, config)
  },

  put(url, data = {}, config = {}) {
    return service.put(url, data, config)
  },

  delete(url, params = {}, config = {}) {
    return service.delete(url, { params, ...config })
  },

  patch(url, data = {}, config = {}) {
    return service.patch(url, data, config)
  },

  upload(url, formData, config = {}) {
    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  },

  download(url, params = {}, filename) {
    return service.get(url, {
      params,
      responseType: 'blob'
    }).then(response => {
      // 创建下载链接
      const blob = new Blob([response])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || `download_${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
  }
}

export default service
export { request }