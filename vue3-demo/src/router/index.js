import { createRouter, createWebHistory } from 'vue-router'
import { getUserRole } from '@/utils/auth' // 假设有获取用户角色的方法
import NProgress from 'nprogress' // 页面过渡动画
import 'nprogress/nprogress.css'

// 角色权限路由表
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { roles: ['admin', 'user'] }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/views/Admin.vue'),
        meta: { roles: ['admin'] }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { roles: [] }
    },
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { roles: [] }
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫（权限验证）
router.beforeEach((to, from, next) => {
    NProgress.start()
    const userRole = getUserRole() // 获取当前用户角色
    if (!to.meta.roles || to.meta.roles.length === 0) {
        next()
    } else if (userRole && to.meta.roles.includes(userRole)) {
        next()
    } else {
        next('/login')
    }
})

router.afterEach(() => {
    NProgress.done()
})

// 动态路由加载示例
export function addDynamicRoutes(dynamicRoutes) {
    dynamicRoutes.forEach(route => {
        router.addRoute(route)
    })
}

export default router