import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 设置 Service Worker
export const worker = setupWorker(...handlers)

// 启动 MSW
export const startMockServer = async () => {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: import.meta.env.BASE_URL + 'mockServiceWorker.js'
    }
  })
  console.log('🔶 MSW started')
}
