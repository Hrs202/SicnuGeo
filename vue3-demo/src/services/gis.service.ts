import axios from '@/utils/axios'
import type { Cartesian3 } from 'cesium'

export interface MapLayer {
  id: string
  type: 'current' | 'planned' | 'future'
  name: string
  features: GeoFeature[]
  validFrom: Date
  validTo: Date
}

export interface GeoFeature {
  id: string
  type: string
  geometry: GeoGeometry
  properties: {
    name: string
    landUse: string
    density: number
    far: number
    height: number
    [key: string]: any
  }
}

export interface GeoGeometry {
  type: 'Polygon' | 'Point'
  coordinates: number[][]
}

export interface FeedbackPoint {
  id: string
  longitude: number
  latitude: number
  title: string
  content: string
  createTime: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface ViewshedParams {
  position: Cartesian3
  direction: Cartesian3
  angle: number
  distance: number
}

export interface SunlightParams {
  buildingId: string
  date: Date
  timeRange: [string, string]
}

class GisService {
  // 图层管理
  async getLayerByType(type: 'current' | 'planned' | 'future'): Promise<MapLayer> {
    try {
      const { data } = await axios.get('/gis/layers', {
        params: { type }
      })
      return data
    } catch (error) {
      console.error('获取图层数据失败:', error)
      throw error
    }
  }

  // 地块详情
  async getFeatureDetails(featureId: string): Promise<GeoFeature> {
    try {
      const { data } = await axios.get(`/gis/features/${featureId}`)
      return data
    } catch (error) {
      console.error('获取地块详情失败:', error)
      throw error
    }
  }

  // 反馈点管理
  async getFeedbackPoints(): Promise<FeedbackPoint[]> {
    try {
      const { data } = await axios.get('/gis/feedback/points')
      return data
    } catch (error) {
      console.error('获取反馈点数据失败:', error)
      throw error
    }
  }

  async createFeedbackPoint(point: Omit<FeedbackPoint, 'id' | 'createTime' | 'status'>): Promise<FeedbackPoint> {
    try {
      const { data } = await axios.post('/gis/feedback/points', point)
      return data
    } catch (error) {
      console.error('创建反馈点失败:', error)
      throw error
    }
  }

  // 空间分析
  async calculateViewshed(params: ViewshedParams) {
    try {
      const { data } = await axios.post('/gis/analysis/viewshed', params)
      return data
    } catch (error) {
      console.error('视线分析失败:', error)
      throw error
    }
  }

  async calculateSunlight(params: SunlightParams) {
    try {
      const { data } = await axios.post('/gis/analysis/sunlight', params)
      return data
    } catch (error) {
      console.error('日照分析失败:', error)
      throw error
    }
  }

  // 批量获取地块数据
  async batchGetFeatures(ids: string[]): Promise<GeoFeature[]> {
    try {
      const { data } = await axios.post('/gis/features/batch', { ids })
      return data
    } catch (error) {
      console.error('批量获取地块数据失败:', error)
      throw error
    }
  }

  // 获取时间段内的规划变更
  async getPlanningChanges(startTime: Date, endTime: Date) {
    try {
      const { data } = await axios.get('/gis/changes', {
        params: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        }
      })
      return data
    } catch (error) {
      console.error('获取规划变更数据失败:', error)
      throw error
    }
  }
}

// 导出服务实例
export const gisService = new GisService()