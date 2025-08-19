import axios from 'axios';

/**
 * 认证授权服务
 * 提供用户登录、注销、访问令牌管理、权限验证、SSO单点登录集成
 */


const API_URL = '/api/auth/';

class AuthService {
    // 用户登录
    async login(username, password) {
        const response = await axios.post(API_URL + 'login', { username, password });
        if (response.data.accessToken) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    }

    // 用户注销
    logout() {
        localStorage.removeItem('user');
    }

    // 获取当前用户
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    // 获取访问令牌
    getAccessToken() {
        const user = this.getCurrentUser();
        return user ? user.accessToken : null;
    }

    // 权限验证
    hasPermission(permission) {
        const user = this.getCurrentUser();
        return user && user.permissions && user.permissions.includes(permission);
    }

    // SSO单点登录集成（示例：重定向到SSO登录页面）
    redirectToSSO() {
        window.location.href = API_URL + 'sso-login';
    }

    // 处理SSO回调
    async handleSSOCallback(query) {
        const response = await axios.post(API_URL + 'sso-callback', query);
        if (response.data.accessToken) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    }
}

export default new AuthService();