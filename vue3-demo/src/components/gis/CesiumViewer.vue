&lt;template>
  &lt;div class="cesium-container" ref="viewerContainer">
    &lt;!-- Cesium 容器 -->
    &lt;vc-viewer
      ref="viewer"
      :animation="false"
      :timeline="false"
      :scene3DOnly="true"
      :infoBox="false"
      @ready="onViewerReady"
      @left-click="onMapClick"
    >
      &lt;!-- 地形配置 -->
      &lt;vc-terrain-provider-cesium />

      &lt;!-- 3D Tiles 城市模型 -->
      &lt;vc-3dtileset
        v-if="currentMode === 'normal'"
        ref="currentTileset"
        :url="cityModelUrl.current"
        :maximumScreenSpaceError="1"
        @ready="onTilesetReady"
      />
      &lt;vc-3dtileset
        v-if="currentMode === 'planning'"
        ref="planningTileset"
        :url="cityModelUrl.planning"
        :maximumScreenSpaceError="1"
        @ready="onTilesetReady"
      />

      &lt;!-- 分析工具图形 -->
      &lt;template v-if="analysisGraphics">
        &lt;vc-entity
          v-for="graphic in analysisGraphics"
          :key="graphic.id"
          :position="graphic.position"
          :polygon="graphic.polygon"
          :polyline="graphic.polyline"
        />
      &lt;/template>

      &lt;!-- 地理围栏 -->
      &lt;vc-entity
        v-if="selectedArea"
        :polygon="getPolygonGraphics(selectedArea)"
      />
    &lt;/vc-viewer>

    &lt;!-- 工具栏 -->
    &lt;div class="toolbar">
      &lt;el-button-group>
        &lt;el-button 
          :type="currentMode === 'normal' ? 'primary' : ''" 
          @click="switchMode('normal')"
        >
          现状视图
        &lt;/el-button>
        &lt;el-button 
          :type="currentMode === 'planning' ? 'primary' : ''" 
          @click="switchMode('planning')"
        >
          规划视图
        &lt;/el-button>
      &lt;/el-button-group>

      &lt;el-divider direction="vertical" />

      &lt;el-button-group>
        &lt;el-button 
          :type="currentTool === 'sunlight' ? 'primary' : ''" 
          @click="toggleTool('sunlight')"
          title="日照分析"
        >
          &lt;i class="el-icon-sunny" />
        &lt;/el-button>
        &lt;el-button 
          :type="currentTool === 'viewshed' ? 'primary' : ''" 
          @click="toggleTool('viewshed')"
          title="视域分析"
        >
          &lt;i class="el-icon-view" />
        &lt;/el-button>
        &lt;el-button 
          :type="currentTool === 'measure' ? 'primary' : ''" 
          @click="toggleTool('measure')"
          title="测量工具"
        >
          &lt;i class="el-icon-ruler" />
        &lt;/el-button>
      &lt;/el-button-group>
    &lt;/div>

    &lt;!-- 日照分析面板 -->
    &lt;el-drawer
      v-model="toolPanels.sunlight"
      title="日照分析"
      direction="rtl"
      size="400px"
    >
      &lt;div class="analysis-panel">
        &lt;el-form label-position="top">
          &lt;el-form-item label="分析日期">
            &lt;el-date-picker
              v-model="sunlightParams.date"
              type="date"
              placeholder="选择日期"
            />
          &lt;/el-form-item>
          &lt;el-form-item label="时间范围">
            &lt;el-time-picker
              v-model="sunlightParams.startTime"
              placeholder="开始时间"
              format="HH:mm"
            />
            &lt;span class="mx-2">至&lt;/span>
            &lt;el-time-picker
              v-model="sunlightParams.endTime"
              placeholder="结束时间"
              format="HH:mm"
            />
          &lt;/el-form-item>
          &lt;el-button type="primary" @click="runSunlightAnalysis">
            开始分析
          &lt;/el-button>
        &lt;/el-form>
      &lt;/div>
    &lt;/el-drawer>

    &lt;!-- 视域分析面板 -->
    &lt;el-drawer
      v-model="toolPanels.viewshed"
      title="视域分析"
      direction="rtl"
      size="400px"
    >
      &lt;div class="analysis-panel">
        &lt;el-form label-position="top">
          &lt;el-form-item label="观察点高度(米)">
            &lt;el-input-number
              v-model="viewshedParams.height"
              :min="0"
              :max="200"
            />
          &lt;/el-form-item>
          &lt;el-form-item label="视角范围(度)">
            &lt;el-slider
              v-model="viewshedParams.angle"
              :min="0"
              :max="360"
            />
          &lt;/el-form-item>
          &lt;el-form-item label="观察距离(米)">
            &lt;el-input-number
              v-model="viewshedParams.distance"
              :min="100"
              :max="5000"
            />
          &lt;/el-form-item>
          &lt;el-button 
            type="primary" 
            :disabled="!viewshedParams.position"
            @click="runViewshedAnalysis"
          >
            开始分析
          &lt;/el-button>
        &lt;/el-form>
      &lt;/div>
    &lt;/el-drawer>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/useMapStore'
import { cesiumHelper } from '@/utils/cesiumHelper'
import type { Viewer, Cartesian3, Entity } from 'cesium'

// 状态管理
const mapStore = useMapStore()

// 组件引用
const viewerContainer = ref&lt;HTMLElement>()
const viewer = ref&lt;Viewer>()

// 模式切换
const currentMode = ref&lt;'normal' | 'planning'>('normal')
const cityModelUrl = {
  current: 'http://your-server/3dtiles/current',
  planning: 'http://your-server/3dtiles/planning'
}

// 工具状态
const currentTool = ref&lt;'sunlight' | 'viewshed' | 'measure' | null>(null)
const toolPanels = ref({
  sunlight: false,
  viewshed: false
})

// 分析参数
const sunlightParams = ref({
  date: new Date(),
  startTime: new Date('2025-01-01 08:00'),
  endTime: new Date('2025-01-01 16:00')
})

const viewshedParams = ref({
  position: null as Cartesian3 | null,
  height: 1.8,
  angle: 120,
  distance: 1000
})

// 分析结果图形
const analysisGraphics = ref&lt;Entity[]>([])
const selectedArea = ref(null)

// 初始化事件
const onViewerReady = (viewerInstance: Viewer) => {
  viewer.value = viewerInstance
  mapStore.setViewer(viewerInstance)
  
  // 设置默认视角
  cesiumHelper.setDefaultView(viewerInstance)
}

// 模型加载完成
const onTilesetReady = (tileset: any) => {
  if (!viewer.value) return
  
  // 优化模型显示
  cesiumHelper.optimizeTileset(tileset)
  
  // 调整视角以适应模型
  viewer.value.zoomTo(tileset)
}

// 切换模式
const switchMode = (mode: 'normal' | 'planning') => {
  currentMode.value = mode
  clearAnalysis()
}

// 切换工具
const toggleTool = (tool: 'sunlight' | 'viewshed' | 'measure') => {
  if (currentTool.value === tool) {
    currentTool.value = null
    toolPanels.value[tool] = false
    return
  }
  
  currentTool.value = tool
  Object.keys(toolPanels.value).forEach(key => {
    toolPanels.value[key] = key === tool
  })
  
  if (tool === 'viewshed') {
    enableViewshedPicking()
  }
}

// 地图点击事件
const onMapClick = (e: any) => {
  if (!viewer.value) return
  
  if (currentTool.value === 'viewshed') {
    const position = viewer.value.scene.pickPosition(e.position)
    if (position) {
      viewshedParams.value.position = position
    }
  }
}

// 启用视点拾取
const enableViewshedPicking = () => {
  if (!viewer.value) return
  
  viewer.value.scene.globe.enableCursorStyle = true
  viewer.value.scene.screenSpaceCameraController.enableRotate = false
}

// 执行日照分析
const runSunlightAnalysis = async () => {
  if (!viewer.value) return
  
  try {
    clearAnalysis()
    const results = await cesiumHelper.analyzeSunlight(
      viewer.value,
      sunlightParams.value
    )
    analysisGraphics.value = results
  } catch (error) {
    console.error('日照分析失败:', error)
    ElMessage.error('日照分析失败')
  }
}

// 执行视域分析
const runViewshedAnalysis = async () => {
  if (!viewer.value || !viewshedParams.value.position) return
  
  try {
    clearAnalysis()
    const results = await cesiumHelper.analyzeViewshed(
      viewer.value,
      viewshedParams.value
    )
    analysisGraphics.value = results
  } catch (error) {
    console.error('视域分析失败:', error)
    ElMessage.error('视域分析失败')
  }
}

// 清理分析结果
const clearAnalysis = () => {
  analysisGraphics.value = []
  viewshedParams.value.position = null
}

// 销毁时清理资源
onUnmounted(() => {
  if (viewer.value) {
    viewer.value.destroy()
  }
})
&lt;/script>

&lt;style scoped>
.cesium-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  align-items: center;
}

.analysis-panel {
  padding: 20px;
}

/* 自定义 Cesium 样式 */
:deep(.cesium-viewer-toolbar) {
  display: none;
}

:deep(.cesium-viewer-bottom) {
  display: none;
}

/* 分析工具样式 */
.el-button-group {
  .el-button {
    padding: 8px 15px;
    
    i {
      margin-right: 5px;
    }
  }
}

.el-drawer__body {
  padding: 0;
}

.el-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}
&lt;/style>
