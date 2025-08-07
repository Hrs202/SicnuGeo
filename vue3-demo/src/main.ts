import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import * as Cesium from 'cesium'
import VueCesium from 'vue-cesium'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 设置Cesium静态资源路径
window.CESIUM_BASE_URL = '/static/Cesium/'

const app = createApp(App)

// 配置Cesium
app.use(VueCesium, {
  cesiumPath: 'https://unpkg.com/cesium@1.107/Build/Cesium/Cesium.js',
  accessToken: import.meta.env.VITE_CESIUM_ION_TOKEN
})

// 状态管理和路由
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 全局错误处理
app.config.errorHandler = (err) => {
  console.error('Global error:', err)
}

app.mount('#app')
