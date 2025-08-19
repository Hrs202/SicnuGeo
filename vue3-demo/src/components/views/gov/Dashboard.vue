<template>
    <div class="dashboard">
        <!-- KPI 指标看板 -->
        <section class="kpi-board">
            <h2>KPI 指标看板</h2>
            <div class="kpi-list">
                <div class="kpi-item" v-for="kpi in kpis" :key="kpi.label">
                    <div class="kpi-value">{{ kpi.value }}</div>
                    <div class="kpi-label">{{ kpi.label }}</div>
                </div>
            </div>
        </section>

        <!-- 空间热力图 -->
        <section class="heatmap-section">
            <h2>问题分布热力图</h2>
            <div id="heatmap" class="heatmap"></div>
        </section>

        <!-- 待办事项提醒 -->
        <section class="todo-section">
            <h2>待办事项提醒</h2>
            <ul>
                <li v-for="item in todos" :key="item.id">
                    <span :class="{ urgent: item.urgent }">{{ item.title }}</span>
                </li>
            </ul>
        </section>

        <!-- 舆情情感分析图表 -->
        <section class="sentiment-section">
            <h2>舆情情感分析</h2>
            <div id="sentiment-chart" class="sentiment-chart"></div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// KPI 数据
const kpis = ref([
    { label: '建议处理率', value: '92%' },
    { label: '平均响应时间', value: '1.2h' },
    { label: '待处理建议', value: 8 },
    { label: '本月已处理', value: 120 }
])

// 待办事项
const todos = ref([
    { id: 1, title: '审核新建议', urgent: true },
    { id: 2, title: '处理投诉', urgent: false },
    { id: 3, title: '回复舆情', urgent: false }
])

onMounted(() => {
    // 热力图示例
    const heatmap = echarts.init(document.getElementById('heatmap'))
    heatmap.setOption({
        tooltip: {},
        visualMap: {
            min: 0,
            max: 100,
            left: 'right',
            top: 'bottom',
            text: ['高', '低'],
            inRange: { color: ['#e0ffff', '#006edd'] }
        },
        xAxis: { type: 'category', data: ['A区', 'B区', 'C区', 'D区', 'E区'] },
        yAxis: { type: 'category', data: ['问题1', '问题2', '问题3', '问题4', '问题5'] },
        series: [{
            name: '问题分布',
            type: 'heatmap',
            data: [
                [0, 0, 50], [0, 1, 80], [0, 2, 30], [0, 3, 60], [0, 4, 20],
                [1, 0, 70], [1, 1, 10], [1, 2, 90], [1, 3, 40], [1, 4, 60],
                [2, 0, 30], [2, 1, 60], [2, 2, 20], [2, 3, 80], [2, 4, 50],
                [3, 0, 90], [3, 1, 40], [3, 2, 70], [3, 3, 20], [3, 4, 10],
                [4, 0, 60], [4, 1, 30], [4, 2, 50], [4, 3, 70], [4, 4, 80]
            ],
            label: { show: false },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
        }]
    })

    // 舆情情感分析图表
    const sentimentChart = echarts.init(document.getElementById('sentiment-chart'))
    sentimentChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center' },
        series: [
            {
                name: '情感分布',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: true, position: 'outside' },
                data: [
                    { value: 335, name: '正面' },
                    { value: 234, name: '中性' },
                    { value: 154, name: '负面' }
                ]
            }
        ]
    })
})
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 24px;
    background: #f5f7fa;
}
section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    flex: 1 1 350px;
    min-width: 350px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.kpi-board {
    flex-basis: 100%;
}
.kpi-list {
    display: flex;
    gap: 32px;
    margin-top: 16px;
}
.kpi-item {
    text-align: center;
}
.kpi-value {
    font-size: 2rem;
    font-weight: bold;
    color: #409eff;
}
.kpi-label {
    color: #888;
    margin-top: 4px;
}
.heatmap, .sentiment-chart {
    width: 100%;
    height: 260px;
}
.todo-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.todo-section li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}
.todo-section .urgent {
    color: #f56c6c;
    font-weight: bold;
}
</style>