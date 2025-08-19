&lt;template>
  &lt;div class="map-explorer">
    &lt;!-- 三维地图容器 -->
    &lt;cesium-viewer
      ref="mapViewer"
      @click="onMapClick"
    />

    &lt;!-- 图层控制面板 -->
    &lt;layer-switcher />

    &lt;!-- 时间轴控件 -->
    &lt;time-slider />

    &lt;!-- 测量工具栏 -->
    &lt;div class="measure-toolbar" v-if="showMeasureTools">
      &lt;el-radio-group v-model="currentMeasureTool" @change="onMeasureToolChange">
        &lt;el-radio-button label="distance">
          &lt;el-tooltip content="距离测量">
            &lt;i class="el-icon-ruler">&lt;/i>
          &lt;/el-tooltip>
        &lt;/el-radio-button>
        &lt;el-radio-button label="area">
          &lt;el-tooltip content="面积测量">
            &lt;i class="el-icon-crop">&lt;/i>
          &lt;/el-tooltip>
        &lt;/el-radio-button>
        &lt;el-radio-button label="height">
          &lt;el-tooltip content="高度测量">
            &lt;i class="el-icon-sort">&lt;/i>
          &lt;/el-tooltip>
        &lt;/el-radio-button>
      &lt;/el-radio-group>
      &lt;el-button 
        type="danger" 
        icon="el-icon-delete"
        @click="clearMeasurements"
      >
        清除
      &lt;/el-button>
    &lt;/div>

    &lt;!-- 工具栏 -->
    &lt;div class="main-toolbar">
      &lt;el-button-group>
        &lt;el-button 
          :type="showMeasureTools ? 'primary' : 'default'"
          @click="toggleMeasureTools"
        >
          测量工具
        &lt;/el-button>
        &lt;el-button @click="resetView">
          重置视角
        &lt;/el-button>
      &lt;/el-button-group>
    &lt;/div>

    &lt;!-- 地块信息弹窗 -->
    &lt;el-dialog
      v-model="parcelInfoVisible"
      title="地块信息"
      width="400px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      &lt;template v-if="selectedParcel">
        &lt;div class="parcel-info">
          &lt;el-descriptions :column="1" border>
            &lt;el-descriptions-item label="地块编号">
              {{ selectedParcel.id }}
            &lt;/el-descriptions-item>
            &lt;el-descriptions-item label="用地性质">
              {{ selectedParcel.landUse }}
            &lt;/el-descriptions-item>
            &lt;el-descriptions-item label="用地面积">
              {{ selectedParcel.area }} 平方米
            &lt;/el-descriptions-item>
            &lt;el-descriptions-item label="容积率">
              {{ selectedParcel.far }}
            &lt;/el-descriptions-item>
            &lt;el-descriptions-item label="建筑密度">
              {{ selectedParcel.coverage }}%
            &lt;/el-descriptions-item>
            &lt;el-descriptions-item label="绿地率">
              {{ selectedParcel.greenRate }}%
            &lt;/el-descriptions-item>
            &lt;el-descriptions-item label="建筑限高">
              {{ selectedParcel.heightLimit }} 米
            &lt;/el-descriptions-item>
          &lt;/el-descriptions>

          &lt;div class="parcel-actions">
            &lt;el-button 
              type="primary" 
              @click="showParcelDetail(selectedParcel)"
            >
              查看详情
            &lt;/el-button>
          &lt;/div>
        &lt;/div>
      &lt;/template>
    &lt;/el-dialog>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores/useMapStore'
import { cesiumHelper } from '@/utils/cesiumHelper'
import CesiumViewer from '@/components/gis/CesiumViewer.vue'
import LayerSwitcher from '@/components/gis/LayerSwitcher.vue'
import TimeSlider from '@/components/gis/TimeSlider.vue'
import type { Cartesian3 } from 'cesium'

const router = useRouter()
const mapStore = useMapStore()

// 组件引用
const mapViewer = ref()

// 测量工具状态
const showMeasureTools = ref(false)
const currentMeasureTool = ref('')

// 地块信息状态
const parcelInfoVisible = ref(false)
const selectedParcel = ref(null)

// 初始化
onMounted(() => {
  // 初始化地图事件监听
  if (mapViewer.value) {
    const viewer = mapViewer.value.viewer
    mapStore.setViewer(viewer)
  }
})

// 地图点击事件处理
const onMapClick = async (event: any) => {
  if (!mapViewer.value?.viewer) return

  const viewer = mapViewer.value.viewer
  const position = event.position

  if (currentMeasureTool.value) {
    // 处理测量点击
    handleMeasureClick(position)
    return
  }

  // 地块查询
  try {
    const parcel = await queryParcelInfo(viewer, position)
    if (parcel) {
      selectedParcel.value = parcel
      parcelInfoVisible.value = true
    }
  } catch (error) {
    console.error('查询地块信息失败:', error)
  }
}

// 查询地块信息
const queryParcelInfo = async (viewer: any, position: Cartesian3) => {
  // 示例地块数据，实际应该从后端API获取
  return {
    id: 'P2025001',
    landUse: '商业用地',
    area: 5000,
    far: 3.5,
    coverage: 45,
    greenRate: 25,
    heightLimit: 80
  }
}

// 显示地块详情
const showParcelDetail = (parcel: any) => {
  router.push({
    name: 'parcelDetail',
    params: { id: parcel.id }
  })
}

// 测量工具相关方法
const toggleMeasureTools = () => {
  showMeasureTools.value = !showMeasureTools.value
  if (!showMeasureTools.value) {
    currentMeasureTool.value = ''
    clearMeasurements()
  }
}

const onMeasureToolChange = (tool: string) => {
  if (!mapViewer.value?.viewer) return
  
  clearMeasurements()
  cesiumHelper.startMeasurement(mapViewer.value.viewer, tool)
}

const handleMeasureClick = (position: Cartesian3) => {
  if (!mapViewer.value?.viewer) return
  
  cesiumHelper.addMeasurePoint(mapViewer.value.viewer, position)
}

const clearMeasurements = () => {
  if (!mapViewer.value?.viewer) return
  
  cesiumHelper.clearMeasurements(mapViewer.value.viewer)
}

// 重置视角
const resetView = () => {
  if (!mapViewer.value?.viewer) return
  
  cesiumHelper.setDefaultView(mapViewer.value.viewer)
}
&lt;/script>

&lt;style scoped>
.map-explorer {
  width: 100%;
  height: 100vh;
  position: relative;
}

.main-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.measure-toolbar {
  position: absolute;
  top: 70px;
  left: 20px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  .el-radio-group {
    margin-right: 10px;
  }
}

.parcel-info {
  .parcel-actions {
    margin-top: 20px;
    text-align: center;
  }
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}

:deep(.el-descriptions__label) {
  width: 100px;
}
&lt;/style>
