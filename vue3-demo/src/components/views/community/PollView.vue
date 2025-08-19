<template>
    <div class="poll-view">
        <h1>公众投票</h1>

        <!-- 议题展示 -->
        <section class="poll-topic">
            <h2>{{ poll.topic }}</h2>
            <p>{{ poll.description }}</p>
        </section>

        <!-- 投票选项 -->
        <section class="poll-options" v-if="!hasVoted">
            <h3>请选择你的选项：</h3>
            <el-radio-group v-model="selectedOption">
                <el-radio
                    v-for="option in poll.options"
                    :key="option.id"
                    :label="option.id"
                >
                    {{ option.text }}
                </el-radio>
            </el-radio-group>
            <el-button type="primary" @click="submitVote" :disabled="!selectedOption">
                提交投票
            </el-button>
        </section>

        <!-- 实时结果图表 -->
        <section class="poll-results" v-if="hasVoted || pollResults.length">
            <h3>实时投票结果</h3>
            <PollChart :results="pollResults" :options="poll.options" />
        </section>

        <!-- 投票理由评论区 -->
        <section class="poll-comments">
            <h3>投票理由</h3>
            <el-input
                type="textarea"
                v-model="comment"
                placeholder="说说你的理由..."
                rows="3"
            />
            <el-button type="success" @click="submitComment" :disabled="!comment">
                发表理由
            </el-button>
            <ul class="comments-list">
                <li v-for="c in comments" :key="c.id">
                    <span class="user">{{ c.user }}：</span>
                    <span class="text">{{ c.text }}</span>
                </li>
            </ul>
        </section>

        <!-- 历史投票存档 -->
        <section class="poll-history">
            <h3>历史投票存档</h3>
            <ul>
                <li v-for="h in history" :key="h.id">
                    <strong>{{ h.topic }}</strong> - {{ h.date }}
                </li>
            </ul>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PollChart from './PollChart.vue' // 你需要实现一个简单的图表组件
import { ElRadioGroup, ElRadio, ElButton, ElInput } from 'element-plus'

const poll = reactive({
    topic: '是否支持城市绿化提升计划？',
    description: '本次议题旨在征集公众对城市绿化提升计划的意见。',
    options: [
        { id: 1, text: '支持' },
        { id: 2, text: '反对' },
        { id: 3, text: '无意见' }
    ]
})

const selectedOption = ref(null)
const hasVoted = ref(false)
const pollResults = ref([
    // 示例数据
    { optionId: 1, count: 12 },
    { optionId: 2, count: 8 },
    { optionId: 3, count: 5 }
])

const comment = ref('')
const comments = ref([
    { id: 1, user: '用户A', text: '绿化很重要，支持！' },
    { id: 2, user: '用户B', text: '担心施工影响交通。' }
])

const history = ref([
    { id: 1, topic: '是否支持垃圾分类？', date: '2024-05-01' },
    { id: 2, topic: '是否同意修建新公园？', date: '2024-04-15' }
])

function submitVote() {
    if (!selectedOption.value) return
    // 模拟投票逻辑
    const result = pollResults.value.find(r => r.optionId === selectedOption.value)
    if (result) result.count += 1
    else pollResults.value.push({ optionId: selectedOption.value, count: 1 })
    hasVoted.value = true
}

function submitComment() {
    if (!comment.value) return
    comments.value.unshift({
        id: Date.now(),
        user: '匿名用户',
        text: comment.value
    })
    comment.value = ''
}

onMounted(() => {
    // 这里可以加载真实数据
})
</script>

<style scoped>
.poll-view {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
}
.poll-topic {
    margin-bottom: 24px;
}
.poll-options {
    margin-bottom: 24px;
}
.poll-results {
    margin-bottom: 24px;
}
.poll-comments {
    margin-bottom: 24px;
}
.comments-list {
    margin-top: 12px;
    padding-left: 0;
    list-style: none;
}
.comments-list li {
    margin-bottom: 8px;
}
.user {
    color: #409eff;
    font-weight: bold;
}
.poll-history ul {
    padding-left: 0;
    list-style: none;
}
.poll-history li {
    margin-bottom: 6px;
}
</style>