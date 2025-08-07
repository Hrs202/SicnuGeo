import { createRouter, createWebHistory } from 'vue-router'
import { createRouteGuard } from '@/utils/authHelper'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '城市三维地图' }
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/ProjectView.vue'),
    meta: { 
      requiresAuth: true,
      title: '项目详情'
    }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminView.vue'),
    meta: { 
      requiresAuth: true,
      requiredPermission: 'manage_layers',
      title: '管理后台'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 应用权限守卫
createRouteGuard(router)

// 设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title 
    ? `${to.meta.title} - 共享城市愿景` 
    : '共享城市愿景'
})

export default router
