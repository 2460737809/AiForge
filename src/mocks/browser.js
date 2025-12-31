import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 设置 Service Worker
export const worker = setupWorker(...handlers)

// 启动 MSW
export const startMockServer = async () => {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
    console.log('🔶 MSW started')
  }
}
