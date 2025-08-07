import * as Cesium from 'cesium'

// 初始化Cesium Viewer
export const initViewer = (container: HTMLElement, options = {}): Cesium.Viewer => {
  return new Cesium.Viewer(container, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    ...options,
    imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    }),
    terrainProvider: Cesium.createWorldTerrain()
  })
}

// 添加GeoJSON图层
export const addGeoJsonLayer = (
  viewer: Cesium.Viewer, 
  data: any, 
  style = {}
): Cesium.DataSource => {
  return viewer.dataSources.add(
    Cesium.GeoJsonDataSource.load(data, {
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.BLUE.withAlpha(0.5),
      strokeWidth: 2,
      ...style
    })
  )
}

// 执行日照分析
export const runSunlightAnalysis = (
  viewer: Cesium.Viewer,
  position: Cesium.Cartesian3,
  date: Date = new Date()
) => {
  viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
  viewer.shadows = true
  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0
    }
  })
}