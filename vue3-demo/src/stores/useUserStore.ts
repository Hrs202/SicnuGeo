import { defineStore } from 'pinia'
import { checkPermission } from '@/utils/authHelper'

type UserRole = 'citizen' | 'government' | 'investor'

interface UserState {
  id: string | null
  name: string
  role: UserRole
  profile: any
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    name: 'Guest',
    role: 'citizen',
    profile: {}
  }),
  
  actions: {
    login(userData: any) {
      this.id = userData.id
      this.name = userData.name
      this.role = userData.role
      this.profile = userData.profile
    },
    
    logout() {
      this.id = null
      this.name = 'Guest'
      this.role = 'citizen'
      this.profile = {}
    },
    
    // 权限检查
    can(permission: string): boolean {
      return checkPermission(this.role, permission)
    }
  }
})