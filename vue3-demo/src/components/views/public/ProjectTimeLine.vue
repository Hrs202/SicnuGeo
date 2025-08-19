<template>
    <div class="project-timeline">
        <h2>项目全生命周期甘特图</h2>
        <GanttChart :tasks="ganttTasks" />

        <h2>各阶段文档</h2>
        <div class="documents">
            <div v-for="doc in documents" :key="doc.id" class="document-item">
                <span>{{ doc.name }}</span>
                <button @click="viewDocument(doc)">查看</button>
            </div>
        </div>

        <h2>项目订阅提醒</h2>
        <button @click="subscribe" :disabled="subscribed">
            {{ subscribed ? '已订阅' : '订阅提醒' }}
        </button>

        <h2>公众参与记录</h2>
        <ul class="public-records">
            <li v-for="record in publicRecords" :key="record.id">
                <strong>{{ record.user }}</strong>：{{ record.comment }} <em>({{ record.date }})</em>
            </li>
        </ul>

        <!-- 文档预览弹窗 -->
        <div v-if="showPreview" class="preview-modal" @click.self="closePreview">
            <iframe v-if="previewDoc.type === 'pdf'" :src="previewDoc.url" frameborder="0"></iframe>
            <img v-else-if="previewDoc.type === 'image'" :src="previewDoc.url" alt="图纸" />
            <button class="close-btn" @click="closePreview">关闭</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// 假设有一个简单的甘特图组件
import GanttChart from '@/components/common/GanttChart.vue'

const ganttTasks = ref([
    { id: 1, name: '立项', start: '2024-01-01', end: '2024-02-01' },
    { id: 2, name: '设计', start: '2024-02-02', end: '2024-03-15' },
    { id: 3, name: '审批', start: '2024-03-16', end: '2024-04-01' },
    { id: 4, name: '施工', start: '2024-04-02', end: '2024-06-30' },
    { id: 5, name: '验收', start: '2024-07-01', end: '2024-07-15' },
])

const documents = ref([
    { id: 1, name: '立项批文.pdf', url: '/docs/project-approval.pdf', type: 'pdf' },
    { id: 2, name: '设计图纸.png', url: '/docs/design-drawing.png', type: 'image' },
])

const showPreview = ref(false)
const previewDoc = ref({})

function viewDocument(doc) {
    previewDoc.value = doc
    showPreview.value = true
}
function closePreview() {
    showPreview.value = false
    previewDoc.value = {}
}

const subscribed = ref(false)
function subscribe() {
    // 这里可以调用API
    subscribed.value = true
}

const publicRecords = ref([
    { id: 1, user: '张三', comment: '建议优化施工时间。', date: '2024-03-10' },
    { id: 2, user: '李四', comment: '希望增加公示环节。', date: '2024-03-12' },
])
</script>

<style scoped>
.project-timeline {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
}
.documents {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.document-item button {
    margin-left: 12px;
}
.preview-modal {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
.preview-modal iframe, .preview-modal img {
    width: 80vw;
    height: 80vh;
    background: #fff;
    border-radius: 8px;
}
.close-btn {
    position: absolute;
    top: 20px; right: 40px;
    background: #fff;
    border: 1px solid #ccc;
    padding: 6px 16px;
    cursor: pointer;
}
.public-records {
    margin-top: 12px;
    padding-left: 20px;
}
</style>