<template>
    <div class="project-admin">
        <h2>项目管理后台</h2>
        <el-form :model="project" label-width="100px" class="project-form">
            <el-form-item label="项目名称">
                <el-input v-model="project.name" placeholder="请输入项目名称" />
            </el-form-item>
            <el-form-item label="信息公开级别">
                <el-select v-model="project.publicLevel" placeholder="请选择公开级别">
                    <el-option label="公开" value="public" />
                    <el-option label="内部" value="internal" />
                    <el-option label="保密" value="private" />
                </el-select>
            </el-form-item>
            <el-form-item label="项目文档">
                <el-upload
                    class="upload-demo"
                    action="#"
                    :file-list="project.files"
                    :on-change="handleFileChange"
                    :auto-upload="false"
                    multiple
                >
                    <el-button size="small" type="primary">选择文件</el-button>
                </el-upload>
            </el-form-item>
            <el-form-item label="审批流程">
                <el-select v-model="project.approvalFlow" placeholder="请选择审批流程">
                    <el-option label="标准流程" value="standard" />
                    <el-option label="简化流程" value="simple" />
                    <el-option label="自定义流程" value="custom" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="saveProject">保存项目</el-button>
                <el-button @click="resetForm">重置</el-button>
            </el-form-item>
        </el-form>
        <el-divider />
        <h3>已创建项目</h3>
        <el-table :data="projects" style="width: 100%">
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="publicLevel" label="公开级别" />
            <el-table-column prop="approvalFlow" label="审批流程" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" @click="editProject(scope.$index)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteProject(scope.$index)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const defaultProject = () => ({
    name: '',
    publicLevel: '',
    files: [],
    approvalFlow: ''
})

const project = reactive(defaultProject())
const projects = ref([])

function saveProject() {
    if (!project.name) {
        ElMessage.error('项目名称不能为空')
        return
    }
    if (editIndex.value !== null) {
        projects.value[editIndex.value] = { ...project, files: [...project.files] }
        ElMessage.success('项目已更新')
    } else {
        projects.value.push({ ...project, files: [...project.files] })
        ElMessage.success('项目已创建')
    }
    resetForm()
}

function resetForm() {
    Object.assign(project, defaultProject())
    editIndex.value = null
}

const editIndex = ref(null)
function editProject(index) {
    Object.assign(project, projects.value[index])
    project.files = [...projects.value[index].files]
    editIndex.value = index
}

function deleteProject(index) {
    projects.value.splice(index, 1)
    ElMessage.success('项目已删除')
    resetForm()
}

function handleFileChange(file, fileList) {
    project.files = fileList
}
</script>

<style scoped>
.project-admin {
    max-width: 700px;
    margin: 40px auto;
    background: #fff;
    padding: 32px;
    border-radius: 8px;
    box-shadow: 0 2px 8px #eee;
}
.project-form {
    margin-bottom: 32px;
}
</style>