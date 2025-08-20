import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // 复制 Cesium 资源文件
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/Workers',
          dest: 'public/cesium'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/ThirdParty',
          dest: 'public/cesium'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Assets',
          dest: 'public/cesium'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Widgets',
          dest: 'public/cesium'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'cesium': path.resolve(__dirname, 'node_modules/cesium/Source')
    }
  },
  build: {
    chunkSizeWarningLimit: 2000, // 增加块大小警告限制
    rollupOptions: {
      external: ['cesium'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          cesium: 'Cesium'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['cesium'] // 排除 Cesium 的依赖预构建
  },
  server: {
    open: true,
    port: 3000
  }
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
