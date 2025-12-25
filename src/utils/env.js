/**
 * 环境变量工具
 */

// 获取环境变量
export const getEnv = (key, defaultValue = '') => {
  const value = import.meta.env[key]
  return value !== undefined ? value : defaultValue
}

// 判断是否为开发环境
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development'
}

// 判断是否为生产环境
export const isProduction = () => {
  return import.meta.env.MODE === 'production'
}

// 判断是否为测试环境
export const isTest = () => {
  return import.meta.env.MODE === 'test'
}

// 获取API基础URL
export const getApiBaseUrl = () => {
  return getEnv('VITE_API_BASE_URL')
}

// 获取应用标题
export const getAppTitle = () => {
  return getEnv('VITE_APP_TITLE', 'Vue3 Application')
}

// 获取应用基础URL
export const getAppBaseUrl = () => {
  return getEnv('VITE_APP_BASE_URL', '/')
}

// 获取上传URL
export const getUploadUrl = () => {
  return getEnv('VITE_APP_UPLOAD_URL', '/api/upload')
}

// 获取公共路径
export const getPublicPath = () => {
  return getEnv('VITE_APP_PUBLIC_PATH', '/')
}

// 判断是否启用Mock
export const isMockEnabled = () => {
  return getEnv('VITE_APP_MOCK', 'false') === 'true'
}

// 获取所有环境变量（开发环境下）
export const getAllEnvVars = () => {
  if (isDevelopment()) {
    return import.meta.env
  }
  return {}
}

// 环境配置对象
export const envConfig = {
  mode: import.meta.env.MODE,
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  isTest: isTest(),
  apiBaseUrl: getApiBaseUrl(),
  appTitle: getAppTitle(),
  appBaseUrl: getAppBaseUrl(),
  uploadUrl: getUploadUrl(),
  publicPath: getPublicPath(),
  mockEnabled: isMockEnabled()
}