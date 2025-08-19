import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useGisStore = defineStore('gis', () => {
    // 当前视图模式: 'normal' | 'plan'
    const viewMode = ref('normal')

    // 激活的图层集合（可以用图层ID数组表示）
    const activeLayers = ref([])

    // 三维相机位置
    const cameraPosition = reactive({
        x: 0,
        y: 0,
        z: 0,
        heading: 0,
        pitch: 0,
        roll: 0
    })

    // 空间分析参数（可根据实际需求扩展）
    const spatialAnalysisParams = reactive({
        bufferDistance: 0,
        area: 0,
        height: 0
    })

    // 切换视图模式
    function setViewMode(mode) {
        viewMode.value = mode
    }

    // 设置激活图层
    function setActiveLayers(layers) {
        activeLayers.value = layers
    }

    // 更新三维相机位置
    function setCameraPosition(pos) {
        Object.assign(cameraPosition, pos)
    }

    // 更新空间分析参数
    function setSpatialAnalysisParams(params) {
        Object.assign(spatialAnalysisParams, params)
    }

    return {
        viewMode,
        activeLayers,
        cameraPosition,
        spatialAnalysisParams,
        setViewMode,
        setActiveLayers,
        setCameraPosition,
        setSpatialAnalysisParams
    }
})