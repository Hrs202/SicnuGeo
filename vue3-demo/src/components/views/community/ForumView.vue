<template>
    <div class="forum-view">
        <header class="forum-header">
            <h1>社区论坛</h1>
            <div class="user-info">
                <span>信用积分：{{ user.credit }}</span>
                <button @click="showPostModal = true">发帖</button>
            </div>
        </header>

        <section class="forum-topics">
            <h2>主题讨论区</h2>
            <div v-for="topic in topics" :key="topic.id" class="topic-card">
                <div class="topic-header">
                    <span class="topic-title">{{ topic.title }}</span>
                    <button @click="toggleFavorite(topic)">
                        {{ topic.isFavorite ? '已收藏' : '收藏' }}
                    </button>
                </div>
                <div class="topic-content">{{ topic.content }}</div>
                <div class="topic-meta">
                    <span>作者：{{ topic.author }}</span>
                    <span>评论数：{{ topic.comments.length }}</span>
                </div>
                <div class="topic-comments">
                    <div v-for="comment in topic.comments" :key="comment.id" class="comment">
                        <span class="comment-author">@{{ comment.author }}</span>:
                        <span class="comment-content">{{ comment.content }}</span>
                    </div>
                    <input
                        v-model="newComments[topic.id]"
                        placeholder="发表评论，支持@用户"
                        @keyup.enter="addComment(topic)"
                    />
                </div>
            </div>
        </section>

        <!-- 发帖弹窗 -->
        <div v-if="showPostModal" class="modal">
            <div class="modal-content">
                <h3>发新帖</h3>
                <input v-model="newPost.title" placeholder="标题" />
                <textarea v-model="newPost.content" placeholder="内容，支持@用户"></textarea>
                <div class="modal-actions">
                    <button @click="submitPost">发布</button>
                    <button @click="showPostModal = false">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 用户信息
const user = reactive({
    name: '张三',
    credit: 120
})

// 主题列表
const topics = ref([
    {
        id: 1,
        title: 'Vue3 新特性讨论',
        content: '大家觉得Vue3最大的提升是什么？',
        author: '李四',
        isFavorite: false,
        comments: [
            { id: 1, author: '王五', content: '@李四 我觉得是Composition API' }
        ]
    },
    {
        id: 2,
        title: '地理信息系统GIS应用',
        content: 'GIS在实际生活中有哪些应用场景？',
        author: '赵六',
        isFavorite: false,
        comments: []
    }
])

// 新评论内容
const newComments = reactive({})

// 新发帖内容
const showPostModal = ref(false)
const newPost = reactive({
    title: '',
    content: ''
})

// 收藏功能
function toggleFavorite(topic) {
    topic.isFavorite = !topic.isFavorite
}

// 添加评论
function addComment(topic) {
    const content = newComments[topic.id]
    if (content && content.trim()) {
        topic.comments.push({
            id: Date.now(),
            author: user.name,
            content
        })
        newComments[topic.id] = ''
        user.credit += 1 // 评论加分
    }
}

// 发帖
function submitPost() {
    if (newPost.title.trim() && newPost.content.trim()) {
        topics.value.unshift({
            id: Date.now(),
            title: newPost.title,
            content: newPost.content,
            author: user.name,
            isFavorite: false,
            comments: []
        })
        user.credit += 5 // 发帖加分
        newPost.title = ''
        newPost.content = ''
        showPostModal.value = false
    }
}
</script>

<style scoped>
.forum-view {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
}
.forum-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.user-info {
    display: flex;
    gap: 16px;
    align-items: center;
}
.forum-topics {
    margin-top: 24px;
}
.topic-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
}
.topic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.topic-title {
    font-weight: bold;
    font-size: 18px;
}
.topic-meta {
    font-size: 12px;
    color: #888;
    margin-top: 8px;
}
.topic-comments {
    margin-top: 12px;
}
.comment {
    margin-bottom: 4px;
}
.comment-author {
    color: #409eff;
}
input, textarea {
    width: 100%;
    margin-top: 8px;
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
}
.modal {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-content {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    width: 400px;
}
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
}
</style>