<template>
    <div class="suggestion-mgr">
        <el-card>
            <div class="filter-bar">
                <el-select v-model="filters.region" placeholder="选择区域" clearable style="width: 160px; margin-right: 12px;">
                    <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
                </el-select>
                <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 160px; margin-right: 12px;">
                    <el-option v-for="status in statuses" :key="status" :label="status" :value="status" />
                </el-select>
                <el-button type="primary" @click="fetchSuggestions">筛选</el-button>
                <el-button @click="resetFilters" style="margin-left: 8px;">重置</el-button>
                <el-button type="success" @click="exportData" style="float: right;">导出数据</el-button>
            </div>
            <el-table
                :data="suggestions"
                border
                style="width: 100%; margin-top: 16px;"
                @selection-change="handleSelectionChange"
                ref="suggestionTable"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="编号" width="80" />
                <el-table-column prop="title" label="建议标题" />
                <el-table-column prop="region" label="区域" width="120" />
                <el-table-column prop="status" label="状态" width="100" />
                <el-table-column prop="responsible" label="责任人" width="120" />
                <el-table-column label="操作" width="180">
                    <template #default="scope">
                        <el-button size="small" @click="changeStatus(scope.row)">变更状态</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin-top: 16px;">
                <el-select v-model="selectedResponsible" placeholder="批量分配责任人" style="width: 180px;">
                    <el-option v-for="user in users" :key="user" :label="user" :value="user" />
                </el-select>
                <el-button type="primary" :disabled="!multipleSelection.length || !selectedResponsible" @click="assignResponsible" style="margin-left: 8px;">
                    批量分配
                </el-button>
            </div>
        </el-card>
        <el-dialog v-model="statusDialog.visible" title="变更状态" width="300px">
            <el-select v-model="statusDialog.newStatus" placeholder="选择新状态" style="width: 100%;">
                <el-option v-for="status in statuses" :key="status" :label="status" :value="status" />
            </el-select>
            <template #footer>
                <el-button @click="statusDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="confirmChangeStatus">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟数据
const regions = ['东区', '西区', '南区', '北区']
const statuses = ['待处理', '处理中', '已完成', '已驳回']
const users = ['张三', '李四', '王五', '赵六']

const filters = reactive({
    region: '',
    status: ''
})

const suggestions = ref([])
const allSuggestions = ref([
    { id: 1, title: '修缮道路', region: '东区', status: '待处理', responsible: '' },
    { id: 2, title: '增设路灯', region: '西区', status: '处理中', responsible: '张三' },
    { id: 3, title: '垃圾清理', region: '南区', status: '已完成', responsible: '李四' },
    { id: 4, title: '绿化提升', region: '北区', status: '待处理', responsible: '' }
])

const fetchSuggestions = () => {
    suggestions.value = allSuggestions.value.filter(item => {
        return (!filters.region || item.region === filters.region) &&
                     (!filters.status || item.status === filters.status)
    })
}

const resetFilters = () => {
    filters.region = ''
    filters.status = ''
    fetchSuggestions()
}

onMounted(() => {
    fetchSuggestions()
})

// 批量分配
const multipleSelection = ref([])
const selectedResponsible = ref('')

const handleSelectionChange = (val) => {
    multipleSelection.value = val
}

const assignResponsible = () => {
    multipleSelection.value.forEach(item => {
        item.responsible = selectedResponsible.value
    })
    ElMessage.success('批量分配成功')
    fetchSuggestions()
}

// 状态变更
const statusDialog = reactive({
    visible: false,
    row: null,
    newStatus: ''
})

const changeStatus = (row) => {
    statusDialog.row = row
    statusDialog.newStatus = row.status
    statusDialog.visible = true
}

const confirmChangeStatus = () => {
    if (statusDialog.row) {
        statusDialog.row.status = statusDialog.newStatus
        ElMessage.success('状态变更成功')
        fetchSuggestions()
    }
    statusDialog.visible = false
}

// 数据导出
const exportData = () => {
    // 简单导出为CSV
    const header = ['编号', '建议标题', '区域', '状态', '责任人']
    const rows = suggestions.value.map(item => [
        item.id, item.title, item.region, item.status, item.responsible
    ])
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'suggestions.csv'
    link.click()
}
</script>

<style scoped>
.suggestion-mgr {
    padding: 24px;
}
.filter-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}
</style>