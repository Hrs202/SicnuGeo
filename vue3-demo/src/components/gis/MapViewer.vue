<template>
  <div class="map-container">
    <vc-viewer ref="viewerRef" :shouldAnimate="true" @ready="onViewerReady">
      <!-- 基础底图 -->
      <vc-layer-imagery :alpha="0.8">
        <vc-provider-imagery-arcgis :url="baseMapUrl"/>
      </vc-layer-imagery>
      
      <!-- 规划图层组 -->
      <vc-provider-terrain-cesium/>
      <vc-layer-geojson 
        v-for="layer in activeLayers" 
        :key="layer.id"
        :data="layer.data"
        :show="layer.visible"
        @click="onPlotClick"
      />
      
      <!-- 意见反馈点位 -->
      <vc-layer-geojson
        v-if="feedbackLayer"
        :data="feedbackLayer"
        :show="true"
        :point="pointStyle"
      />
    </vc-viewer>
    
    <!-- 控制组件 -->
    <MapToolbar @layer-toggle="toggleLayer"/>
    <TimeSlider @time-change="handleTimeChange"/>
    
    <!-- 地块信息弹窗 -->
    <PlotInfoModal 
      v-if="selectedPlot" 
      :plotData="selectedPlot"
      @close="selectedPlot = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VcViewer, VcLayerImagery, VcProviderImageryArcgis } from 'vue-cesium'
import { useMapStore } from '@/stores/useMapStore'
import { fetchPlanningLayers } from '@/services/gis.service'

const viewerRef = ref()
const mapStore = useMapStore()
const activeLayers = ref<MapLayer[]>([])
const selectedPlot = ref<PlotData | null>(null)
const feedbackLayer = ref(null)

// 初始化地图
const onViewerReady = ({ Cesium, viewer }: { Cesium: typeof Cesium, viewer: Cesium.Viewer }) => {
  mapStore.initCesiumViewer(viewer)
  loadInitialLayers()
}

// 加载规划图层
const loadInitialLayers = async () => {
  const layers = await fetchPlanningLayers()
  activeLayers.value = layers.map(layer => ({
    ...layer,
    visible: true
  }))
}

// 地块点击事件
const onPlotClick = (entity: Cesium.Entity) => {
  if (entity.properties) {
    const plotId = entity.properties.plotId.getValue()
    selectedPlot.value = mapStore.getPlotDetails(plotId)
  }
}

// 时间轴变化
const handleTimeChange = (timePeriod: 'current' | 'plan' | 'future') => {
  mapStore.setTimePeriod(timePeriod)
  activeLayers.value.forEach(layer => {
    layer.visible = layer.timePeriod === timePeriod
  })
}
</script>