import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/AiForge/', // GitHub Pages 部署路径
    plugins: [
      vue(),
      // gzip 压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 大于 10kb 才压缩
        algorithm: 'gzip',
        ext: '.gz'
      }),
      // 打包体积分析
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 10001,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      // 启用压缩
      minify: 'esbuild',
      // 确保 public 目录文件被正确复制
      copyPublicDir: true,
      // 代码分割优化
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // 手动分包策略
          manualChunks: {
            // 将 Vue 核心库单独打包
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 将 UI 组件库单独打包
            'ui-vendor': ['radix-vue', 'lucide-vue-next'],
            // 将 Three.js 相关打包
            'three-vendor': ['three', 'cannon-es']
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler' // 使用现代编译器 API，避免 legacy-js-api 警告
        }
      }
    }
  }
})