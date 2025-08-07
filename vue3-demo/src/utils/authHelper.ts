// 角色权限矩阵
const PERMISSION_MATRIX: Record<string, string[]> = {
  citizen: [
    'view_map', 
    'submit_feedback',
    'join_forum',
    'vote_topic'
  ],
  government: [
    'manage_layers',
    'process_feedback',
    'publish_projects',
    'moderate_forum'
  ],
  investor: [
    'view_investment_data',
    'access_land_sales'
  ]
}

// 权限检查函数
export const checkPermission = (role: string, permission: string): boolean => {
  return PERMISSION_MATRIX[role]?.includes(permission) || false
}

// 路由守卫实现
export const createRouteGuard = (router) => {
  router.beforeEach((to) => {
    if (to.meta.requiresAuth) {
      const userStore = useUserStore()
      if (!userStore.id) return '/login'
      
      if (to.meta.requiredPermission && 
          !checkPermission(userStore.role, to.meta.requiredPermission)) {
        return '/unauthorized'
      }
    }
  })
}