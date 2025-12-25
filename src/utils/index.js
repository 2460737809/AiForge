/**
 * 通用工具函数
 */

// 防抖函数
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 格式化文件大小
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期时间
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 生成随机ID
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 检查是否为空值
export function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// 获取URL参数
export function getUrlParam(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) return decodeURIComponent(r[2])
  return null
}

// 设置URL参数
export function setUrlParam(name, value) {
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.replaceState({}, '', url)
}

// 删除URL参数
export function removeUrlParam(name) {
  const url = new URL(window.location.href)
  url.searchParams.delete(name)
  window.history.replaceState({}, '', url)
}

// 本地存储工具
export const storage = {
  set(key, value, expire = null) {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null
    }
    localStorage.setItem(key, JSON.stringify(data))
  },
  
  get(key) {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    const data = JSON.parse(item)
    if (data.expire && Date.now() > data.expire) {
      localStorage.removeItem(key)
      return null
    }
    
    return data.value
  },
  
  remove(key) {
    localStorage.removeItem(key)
  },
  
  clear() {
    localStorage.clear()
  }
}

// 会话存储工具
export const sessionStorage = {
  set(key, value) {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },
  
  get(key) {
    const item = window.sessionStorage.getItem(key)
    if (!item) return null
    return JSON.parse(item)
  },
  
  remove(key) {
    window.sessionStorage.removeItem(key)
  },
  
  clear() {
    window.sessionStorage.clear()
  }
}

// 下载文件
export function downloadFile(url, filename = '') {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `download_${Date.now()}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 复制到剪贴板
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

// 检查是否为移动设备
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 获取设备信息
export function getDeviceInfo() {
  const ua = navigator.userAgent
  return {
    userAgent: ua,
    isMobile: isMobileDevice(),
    isIOS: /iPad|iPhone|iPod/.test(ua),
    isAndroid: /Android/.test(ua),
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isChrome: /Chrome/.test(ua),
    isFirefox: /Firefox/.test(ua),
    isEdge: /Edge/.test(ua)
  }
}

// 数字格式化
export function formatNumber(num, decimals = 2) {
  if (isNaN(num)) return '0'
  return parseFloat(num).toFixed(decimals)
}

// 百分比格式化
export function formatPercentage(num, decimals = 2) {
  if (isNaN(num)) return '0%'
  return `${parseFloat(num).toFixed(decimals)}%`
}

// 颜色工具
export const colorUtils = {
  // 十六进制转RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  // RGB转十六进制
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },
  
  // 获取对比色
  getContrastColor(hexColor) {
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return '#000000'
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }
}