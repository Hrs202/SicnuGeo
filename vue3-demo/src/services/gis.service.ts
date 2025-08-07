import axios from '@/utils/axios'
import type { MapLayer, PlotData } from '@/types/gis'

// 获取规划图层数据
export const fetchPlanningLayers = async (): Promise<MapLayer[]> => {
  const { data } = await axios.get('/gis/layers', {
    params: { type: 'planning' }
  })
  return data.layers
}

// 获取地块详情
export const fetchPlotDetails = async (plotId: string): Promise<PlotData> => {
  const { data } = await axios.get(`/gis/plots/${plotId}`)
  return data
}

// 提交空间分析请求
export const requestSpatialAnalysis = async (analysisType: 'viewshed' | 'sunlight', params: object) => {
  const { data } = await axios.post('/gis/analysis', {
    analysisType,
    parameters: params
  })
  return data.result
}