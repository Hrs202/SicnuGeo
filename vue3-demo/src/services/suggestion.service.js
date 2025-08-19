import axios from 'axios';

const API_BASE_URL = '/api/suggestions';

export default {
    // 提交新建建议
    submitSuggestion(data) {
        return axios.post(`${API_BASE_URL}/create`, data);
    },

    // 获取建议处理状态
    getSuggestionStatus(suggestionId) {
        return axios.get(`${API_BASE_URL}/status/${suggestionId}`);
    },

    // 加载热点聚类数据
    loadHotspotClusters(params) {
        return axios.get(`${API_BASE_URL}/hotspot-clusters`, { params });
    },

    // 多媒体文件上传
    uploadMedia(formData) {
        return axios.post(`${API_BASE_URL}/upload-media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};