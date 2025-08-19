import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Viewer, Entity } from 'cesium'
import { gisService } from '@/services/gis.service'
import { cesiumHelper } from '@/utils/cesiumHelper'

export interface MapLayer {
  id: string
  type: 'current' | 'planned' | 'future'
  features: any[]
  visible: boolean
  validFrom: Date
  validTo: Date
}

export interface FeedbackPoint {
  id: string
  longitude: number
  latitude: number
  title: string
  content: string
  createTime: string
}

export const useMapStore = defineStore('map', () => {
  // 状态定义
  const viewer = ref&lt;Viewer | null>(null)
  const currentLayerType = ref&lt;'current' | 'planned' | 'future'>('current')
  const layers = ref&lt;Map&lt;string, MapLayer>>(new Map())
  const featureCache = ref&lt;Map&lt;string, any>>(new Map())
  const analysisResults = ref&lt;Map&lt;string, any>>(new Map())

  // 计算属性
  const currentLayer = computed(() => {
    return layers.value.get(currentLayerType.value)
  })

  const visibleFeatures = computed(() => {
    return currentLayer.value?.features.filter(f => f.visible) || []
  })

  // 地图实例管理
  const setViewer = (mapViewer: Viewer) => {
    viewer.value = mapViewer
  }

  // 图层数据加载
  const fetchLayerData = async (type: 'current' | 'planned' | 'future') => {
    try {
      const layerData = await gisService.getLayerByType(type)
      layers.value.set(type, {
        ...layerData,
        visible: true,
        features: layerData.features.map(feature => ({
          ...feature,
          visible: true,
          material: cesiumHelper.createMaterialByType(feature.type),
          outlineColor: cesiumHelper.getOutlineColorByType(feature.type)
        }))
      })
      return true
    } catch (error) {
      console.error('加载图层数据失败:', error)
      return false
    }
  }

  // 获取当前图层实体
  const getCurrentLayerEntities = (): Entity[] => {
    if (!currentLayer.value) return []
    return currentLayer.value.features.map(feature => ({
      id: feature.id,
      position: cesiumHelper.createPositionFromGeometry(feature.geometry),
      polygon: {
        hierarchy: cesiumHelper.createPolygonHierarchy(feature.geometry),
        material: feature.material,
        outline: true,
        outlineColor: feature.outlineColor
      },
      properties: {
        ...feature.properties,
        validFrom: feature.validFrom,
        validTo: feature.validTo
      }
    }))
  }

  // 加载反馈点数据
  const fetchFeedbackPoints = async (): Promise&lt;FeedbackPoint[]> => {
    try {
      return await gisService.getFeedbackPoints()
    } catch (error) {
      console.error('加载反馈点数据失败:', error)
      return []
    }
  }

  // 地块详情数据管理
  const getFeatureDetails = async (featureId: string) => {
    // 检查缓存
    if (featureCache.value.has(featureId)) {
      return featureCache.value.get(featureId)
    }

    try {
      const details = await gisService.getFeatureDetails(featureId)
      featureCache.value.set(featureId, details)
      return details
    } catch (error) {
      console.error('获取地块详情失败:', error)
      return null
    }
  }

  // 空间分析功能
  const performViewshedAnalysis = async (viewpoint: any, parameters: any) => {
    if (!viewer.value) return null

    try {
      const result = await gisService.calculateViewshed(viewpoint, parameters)
      analysisResults.value.set('viewshed', result)
      return result
    } catch (error) {
      console.error('视线分析失败:', error)
      return null
    }
  }

  const performSunlightAnalysis = async (buildingId: string, date: Date) => {
    if (!viewer.value) return null

    try {
      const result = await gisService.calculateSunlight(buildingId, date)
      analysisResults.value.set('sunlight', result)
      return result
    } catch (error) {
      console.error('日照分析失败:', error)
      return null
    }
  }

  // 清理资源
  const cleanup = () => {
    viewer.value = null
    layers.value.clear()
    featureCache.value.clear()
    analysisResults.value.clear()
  }

  return {
    // 状态
    viewer,
    currentLayerType,
    currentLayer,
    visibleFeatures,

    // 方法
    setViewer,
    fetchLayerData,
    getCurrentLayerEntities,
    fetchFeedbackPoints,
    getFeatureDetails,
    performViewshedAnalysis,
    performSunlightAnalysis,
    cleanup,

    // 图层管理
    getLayerByType: (type: string) => layers.value.get(type)
  }
})

