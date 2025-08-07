import { defineStore } from 'pinia'
import * as Cesium from 'cesium'
import type { MapLayer, PlotData } from '@/types/gis'

interface MapState {
  viewer: Cesium.Viewer | null
  currentTimePeriod: 'current' | 'plan' | 'future'
  plots: Record<string, PlotData>
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    viewer: null,
    currentTimePeriod: 'current',
    plots: {}
  }),
  
  actions: {
    initCesiumViewer(viewer: Cesium.Viewer) {
      this.viewer = viewer
      viewer.scene.globe.enableLighting = true
      viewer.scene.fog.enabled = true
    },
    
    setTimePeriod(period: MapState['currentTimePeriod']) {
      this.currentTimePeriod = period
    },
    
    async loadPlotDetails(plotId: string) {
      if (!this.plots[plotId]) {
        const plotData = await fetchPlotDetails(plotId)
        this.plots[plotId] = plotData
      }
      return this.plots[plotId]
    },
    
    getPlotDetails(plotId: string) {
      return this.plots[plotId]
    },
    
    // 空间分析功能
    performViewshedAnalysis(position: number[]) {
      if (!this.viewer) return
      const cartesian = Cesium.Cartesian3.fromDegrees(...position)
      this.viewer.scene.postProcessStages.add(
        new Cesium.PostProcessStage({
          fragmentShader: viewshedShader
        })
      )
    }
  }
})

const viewshedShader = `
  // 视线分析着色器实现
  uniform sampler2D colorTexture;
  varying vec2 v_textureCoordinates;

  void main(void) {
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    // 视线分析逻辑
    gl_FragColor = color;
  }
`
