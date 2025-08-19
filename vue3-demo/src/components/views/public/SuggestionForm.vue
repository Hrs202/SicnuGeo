<template>
  <div class="suggestion-form">
    <!-- 地图标点选择 -->
    <el-card class="map-card">
      <template #header>
        <span>选择建议位置</span>
      </template>
      <div class="map-select">
        <cesium-viewer
          ref="mapRef"
          :enablePick="true"
          @click="onMapClick"
          style="height: 300px; width: 100%"
        />
        <div v-if="form.location" class="location-info">
          <el-tag type="success">已选位置：{{ form.location.lng.toFixed(6) }}, {{ form.location.lat.toFixed(6) }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 建议表单 -->
    <el-card class="form-card">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="问题类型" prop="category">
          <el-select v-model="form.category" placeholder="请选择问题类型">
            <el-option label="交通" value="traffic" />
            <el-option label="绿地" value="greenspace" />
            <el-option label="市政设施" value="infrastructure" />
            <el-option label="环境" value="environment" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="建议内容" prop="content">
          <el-input v-model="form.content" type="textarea" rows="4" placeholder="请输入您的建议" />
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
            class="upload-demo"
            action="/api/suggestion/upload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            :on-remove="handleFileRemove"
            :before-upload="beforeUpload"
            :file-list="form.attachments"
            :limit="5"
            :auto-upload="true"
            :multiple="true"
            list-type="picture-card"
            accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
          >
            <template #trigger>
              <i class="el-icon-plus"></i>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png/gif图片或mp4视频，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交建议</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 历史建议记录 -->
    <el-card class="history-card">
      <template #header>
        <span>我的建议历史</span>
      </template>
      <el-table :data="history" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="提交时间" width="160" sortable />
        <el-table-column prop="category" label="类型" width="100" :formatter="formatCategory" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="位置" width="120">
          <template #default="scope">
            <el-button 
              type="text"
              @click="locateOnMap(scope.row.location)"
            >
              查看位置
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="附件" width="200">
          <template #default="scope">
            <div class="attachment-list">
              <template v-for="file in scope.row.attachments" :key="file.url">
                <el-image
                  v-if="file.type === 'image'"
                  :src="file.url"
                  :preview-src-list="[file.url]"
                  fit="cover"
                  class="attachment-thumbnail"
                />
                <el-button
                  v-else
                  type="primary"
                  size="small"
                  @click="playVideo(file.url)"
                >
                  播放视频
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
      
      <!-- 视频播放对话框 -->
      <el-dialog
        v-model="videoDialogVisible"
        title="视频播放"
        width="70%"
        destroy-on-close
      >
        <video
          v-if="currentVideoUrl"
          :src="currentVideoUrl"
          controls
          style="width: 100%"
        ></video>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import CesiumViewer from '@/components/gis/CesiumViewer.vue'
import * as Cesium from 'cesium'

const formRef = ref()
const mapRef = ref()
const viewer = ref()
const loading = ref(false)
const videoDialogVisible = ref(false)
const currentVideoUrl = ref('')

// 表单数据
const form = reactive({
  location: null as null | { lng: number; lat: number; address: string },
  category: '',
  content: '',
  attachments: [] as any[]
})

// 标记点实体
let markerEntity: any = null

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 文件上传配置
const uploadConfig = reactive({
  fileTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    video: ['video/mp4', 'video/webm']
  },
  maxSize: 10 * 1024 * 1024, // 10MB
  uploading: false
})

const rules = {
  category: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入建议内容', trigger: 'blur' }],
  location: [{ required: true, message: '请选择建议位置', trigger: 'change' }]
}

const history = ref<any[]>([])

// 地图点击选择位置
const onMapClick = async (e: any) => {
  if (!viewer.value) return
  
  // 获取点击位置的笛卡尔坐标
  const position = viewer.value.scene.pickPosition(e.position)
  if (!position) return

  // 转换为经纬度坐标
  const cartographic = Cesium.Cartographic.fromCartesian(position)
  const lng = Cesium.Math.toDegrees(cartographic.longitude)
  const lat = Cesium.Math.toDegrees(cartographic.latitude)
  
  try {
    // 获取地理编码信息
    const address = await getAddressFromCoordinates(lng, lat)
    
    // 更新表单位置
    form.location = { lng, lat, address }
    
    // 更新标记点
    updateMarker(position)
    
    ElMessage.success('已选择位置：' + address)
  } catch (error) {
    console.error('获取地址失败:', error)
    ElMessage.error('获取地址信息失败')
  }
}

// 获取地理编码信息
const getAddressFromCoordinates = async (lng: number, lat: number) => {
  try {
    const response = await fetch(`https://api.map.baidu.com/reverse_geocoding/v3/?ak=YOUR_BAIDU_AK&output=json&location=${lat},${lng}`)
    const data = await response.json()
    return data.result.formatted_address
  } catch (error) {
    console.error('地理编码请求失败:', error)
    return '未知地址'
  }
}

// 更新地图标记
const updateMarker = (position: Cesium.Cartesian3) => {
  if (!viewer.value) return
  
  // 移除旧标记
  if (markerEntity) {
    viewer.value.entities.remove(markerEntity)
  }
  
  // 添加新标记
  markerEntity = viewer.value.entities.add({
    position: position,
    billboard: {
      image: '/images/marker.png',
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      scale: 0.5
    }
  })
  
  // 定位到标记点
  viewer.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      form.location.lng,
      form.location.lat,
      1000
    ),
    duration: 1
  })
}

// 附件上传前验证
const beforeUpload = (file: File) => {
  // 检查文件类型
  const isValidType = uploadConfig.fileTypes.image.includes(file.type) ||
    uploadConfig.fileTypes.video.includes(file.type)
  
  if (!isValidType) {
    ElMessage.error('只支持上传jpg、png、gif图片或mp4、webm视频文件')
    return false
  }
  
  // 检查文件大小
  if (file.size > uploadConfig.maxSize) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  
  return true
}

// 附件上传成功
const handleUploadSuccess = (res: any, file: any, fileList: any) => {
  if (res.code === 0) {
    form.attachments = fileList.map((f: any) => ({
      name: f.name,
      url: f.response?.url || f.url,
      type: f.raw.type.startsWith('image/') ? 'image' : 'video',
      size: f.size,
      uploadTime: new Date().toISOString()
    }))
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error(res.message || '文件上传失败')
  }
}

// 附件上传失败
const handleUploadError = (err: any) => {
  console.error('文件上传失败:', err)
  ElMessage.error('文件上传失败，请重试')
}

// 附件上传进度
const handleUploadProgress = (event: any, file: any) => {
  uploadConfig.uploading = true
}

// 移除附件
const handleFileRemove = (file: any) => {
  const index = form.attachments.findIndex(f => f.url === file.url)
  if (index > -1) {
    form.attachments.splice(index, 1)
  }
}

// 提交建议
const submitForm = () => {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return
    // 模拟提交，实际应调用后端API
    const record = {
      ...form,
      time: new Date().toLocaleString()
    }
    history.value.unshift(record)
    localStorage.setItem('suggestionHistory', JSON.stringify(history.value))
    ElMessage.success('建议提交成功！')
    resetForm()
  })
}

// 重置表单
const resetForm = () => {
  form.location = null
  form.category = ''
  form.content = ''
  form.attachments = []
}

// 加载历史记录
const loadHistory = async () => {
  try {
    // 实际开发中应该调用后端API
    const response = await fetch(`/api/suggestions?page=${pagination.currentPage}&size=${pagination.pageSize}`)
    const data = await response.json()
    
    if (data.code === 0) {
      history.value = data.data.records
      pagination.total = data.data.total
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
    ElMessage.error('加载历史记录失败')
    
    // 降级使用本地存储
    const saved = localStorage.getItem('suggestionHistory')
    if (saved) {
      const allHistory = JSON.parse(saved)
      history.value = allHistory.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
      )
      pagination.total = allHistory.length
    }
  }
}

// 页码变化处理
const handlePageChange = (page: number) => {
  pagination.currentPage = page
  loadHistory()
}

// 每页条数变化处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadHistory()
}

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})

// 类型格式化
// 定位到建议位置
const locateOnMap = (location: { lng: number; lat: number }) => {
  if (!viewer.value) return
  
  viewer.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      location.lng,
      location.lat,
      1000
    ),
    duration: 1
  })
}

// 播放视频
const playVideo = (url: string) => {
  currentVideoUrl.value = url
  videoDialogVisible.value = true
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'primary'
    case 'completed': return 'success'
    case 'rejected': return 'danger'
    default: return 'info'
  }
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'processing': return '处理中'
    case 'completed': return '已完成'
    case 'rejected': return '已驳回'
    default: return '未知'
  }
}

const formatCategory = (row: any) => {
  switch (row.category) {
    case 'traffic': return '交通'
    case 'greenspace': return '绿地'
    case 'infrastructure': return '市政设施'
    case 'environment': return '环境'
    case 'other': return '其他'
    default: return row.category
  }
}
</script>

<style scoped>
.suggestion-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 0;
}

.map-card, .form-card, .history-card {
  margin: 0 auto;
  max-width: 700px;
}

.map-select {
  position: relative;
}

.location-info {
  margin-top: 10px;
}

.upload-demo {
  width: 100%;
}

.history-card {
  margin-bottom: 40px;
}

.attachment-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.attachment-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-upload-list__item) {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.location-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
