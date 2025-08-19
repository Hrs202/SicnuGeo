&lt;template>
  &lt;div class="map-container">
    &lt;vc-viewer
      ref="viewerRef"
      :animation="false"
      :timeline="false"
      :navigation="true"
      :infoBox="false"
      @ready="onViewerReady"
      @left-click="onMapClick"
    >
      &lt;!-- 地形配置 -->
      &lt;vc-terrain-provider-cesium />
      
      &lt;!-- 动态规划图层组 -->
      &lt;vc-layer-group v-if="currentLayer" :show="true">
        &lt;vc-entity-group :entities="layerEntities">
          &lt;vc-entity
            v-for="feature in currentLayer.features"
            :key="feature.id"
            :position="feature.position"
            :polygon="feature.polygon"
            :properties="feature.properties"
          >
            &lt;vc-graphics-polygon
              :material="feature.material"
              :outline="true"
              :outlineColor="feature.outlineColor"
            />
          &lt;/vc-entity>
        &lt;/vc-entity-group>
      &lt;/vc-layer-group>

      &lt;!-- 意见反馈点图层 -->
      &lt;vc-entity-group :entities="feedbackPoints">
        &lt;vc-entity
          v-for="point in feedbackPoints"
          :key="point.id"
          :position="point.position"
          :billboard="defaultBillboard"
          :properties="point.properties"
        />
      &lt;/vc-entity-group>

      &lt;!-- 时间轴控制组件 -->
      &lt;time-slider
        v-model="currentTime"
        :timeRange="timeRange"
        @update:modelValue="onTimeChange"
      />

      &lt;!-- 图层控制组件 -->
      &lt;layer-control
        v-model:activeLayer="activeLayerType"
        :layers="availableLayers"
        @change="onLayerChange"
      />
    &lt;/vc-viewer>

    &lt;!-- 地块信息弹窗 -->
    &lt;div v-if="selectedFeature" class="feature-popup">
      &lt;h3>{{ selectedFeature.properties.name }}&lt;/h3>
      &lt;p>用地性质: {{ selectedFeature.properties.landUse }}&lt;/p>
      &lt;p>建筑密度: {{ selectedFeature.properties.density }}&lt;/p>
      &lt;p>容积率: {{ selectedFeature.properties.far }}&lt;/p>
      &lt;button @click="selectedFeature = null">关闭&lt;/button>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup>
import { ref, computed, onMounted } from 'vue'
import { useMapStore } from '@/stores/useMapStore'
import TimeSlider from './TimeSlider.vue'
import LayerControl from './LayerControl.vue'

// 视图引用
const viewerRef = ref(null)

// 状态管理
const mapStore = useMapStore()

// 图层相关状态
const activeLayerType = ref('current') // 当前/规划/远景
const currentLayer = computed(() => mapStore.getLayerByType(activeLayerType.value))
const layerEntities = ref([])
const feedbackPoints = ref([])

// 时间控制
const currentTime = ref(new Date())
const timeRange = {
  start: new Date('2025-01-01'),
  end: new Date('2035-12-31')
}

// 选中要素
const selectedFeature = ref(null)

// 默认标注样式
const defaultBillboard = {
  image: '/icons/feedback-point.png',
  verticalOrigin: 1, // 底部对齐
  scale: 0.5,
  heightReference: 1 // 贴地
}

// 视图就绪回调
const onViewerReady = (viewer) => {
  // 初始化相机位置
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(104.06, 30.67, 5000), // 成都市中心
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  })
  
  // 加载初始数据
  loadLayerData()
  loadFeedbackPoints()
}

// 地图点击事件
const onMapClick = (e) => {
  const picked = viewer.scene.pick(e.position)
  if (picked && picked.id) {
    selectedFeature.value = picked.id
  } else {
    selectedFeature.value = null
  }
}

// 图层切换
const onLayerChange = async (type) => {
  activeLayerType.value = type
  await loadLayerData()
}

// 时间变化
const onTimeChange = (time) => {
  currentTime.value = time
  updateLayerByTime(time)
}

// 加载图层数据
const loadLayerData = async () => {
  try {
    await mapStore.fetchLayerData(activeLayerType.value)
    layerEntities.value = mapStore.getCurrentLayerEntities()
  } catch (error) {
    console.error('加载图层数据失败:', error)
  }
}

// 加载反馈点数据
const loadFeedbackPoints = async () => {
  try {
    const points = await mapStore.fetchFeedbackPoints()
    feedbackPoints.value = points.map(point => ({
      id: point.id,
      position: Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude),
      properties: {
        title: point.title,
        content: point.content,
        createTime: point.createTime
      }
    }))
  } catch (error) {
    console.error('加载反馈点数据失败:', error)
  }
}

// 根据时间更新图层
const updateLayerByTime = (time) => {
  if (!currentLayer.value) return
  
  // 更新图层显示状态
  layerEntities.value.forEach(entity => {
    const validFrom = new Date(entity.properties.validFrom)
    const validTo = new Date(entity.properties.validTo)
    entity.show = time >= validFrom && time <= validTo
  })
}

// 初始化
onMounted(() => {
  // 组件挂载后的初始化逻辑
})
&lt;/script>

&lt;style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.feature-popup {
  position: absolute;
  right: 20px;
  top: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  z-index: 1000;
}

.feature-popup h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.feature-popup p {
  margin: 5px 0;
}

.feature-popup button {
  margin-top: 10px;
  padding: 5px 15px;
  border: none;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
}

.feature-popup button:hover {
  background: #e0e0e0;
}
&lt;/style>
