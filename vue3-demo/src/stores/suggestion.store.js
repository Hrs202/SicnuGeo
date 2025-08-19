import { defineStore } from 'pinia';

export const useSuggestionStore = defineStore('suggestion', {
    state: () => ({
        // 用户提交的建议列表
        suggestions: [],
        // 建议处理状态（可用对象或Map，key为建议ID，value为状态）
        suggestionStatus: {},
        // 空间聚类热点数据
        spatialHotspots: [],
        // 多媒体附件缓存（key为附件ID，value为附件数据）
        mediaCache: {},
    }),
    actions: {
        // 添加新建议
        addSuggestion(suggestion) {
            this.suggestions.push(suggestion);
            if (suggestion.id) {
                this.suggestionStatus[suggestion.id] = 'pending';
            }
        },
        // 更新建议处理状态
        updateSuggestionStatus(id, status) {
            if (this.suggestionStatus[id] !== undefined) {
                this.suggestionStatus[id] = status;
            }
        },
        // 设置空间聚类热点数据
        setSpatialHotspots(hotspots) {
            this.spatialHotspots = hotspots;
        },
        // 缓存多媒体附件
        cacheMedia(id, mediaData) {
            this.mediaCache[id] = mediaData;
        },
        // 清除多媒体附件缓存
        clearMediaCache(id) {
            if (id) {
                delete this.mediaCache[id];
            } else {
                this.mediaCache = {};
            }
        }
    }
});