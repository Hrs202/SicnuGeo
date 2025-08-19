import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        // 用户角色: 'public' | 'planning' | 'street'
        role: 'public',
        // 权限配置
        permissions: [],
        // 个性化设置
        preferences: {},
        // 订阅项目列表
        subscribedProjects: []
    }),
    actions: {
        setRole(role) {
            this.role = role
        },
        setPermissions(permissions) {
            this.permissions = permissions
        },
        setPreferences(preferences) {
            this.preferences = preferences
        },
        updatePreference(key, value) {
            this.preferences[key] = value
        },
        subscribeProject(projectId) {
            if (!this.subscribedProjects.includes(projectId)) {
                this.subscribedProjects.push(projectId)
            }
        },
        unsubscribeProject(projectId) {
            this.subscribedProjects = this.subscribedProjects.filter(id => id !== projectId)
        }
    },
    getters: {
        isPublic: (state) => state.role === 'public',
        isPlanning: (state) => state.role === 'planning',
        isStreet: (state) => state.role === 'street',
        hasPermission: (state) => (perm) => state.permissions.includes(perm)
    }
})