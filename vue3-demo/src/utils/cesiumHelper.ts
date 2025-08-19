import * as Cesium from 'cesium'

// 地块类型对应的颜色配置
const LAND_USE_COLORS = {
  residential: Cesium.Color.fromCssColorString('#FFB6C1'),  // 居住用地
  commercial: Cesium.Color.fromCssColorString('#87CEEB'),   // 商业用地
  industrial: Cesium.Color.fromCssColorString('#CD853F'),   // 工业用地
  publicService: Cesium.Color.fromCssColorString('#98FB98'), // 公共服务用地
  greenSpace: Cesium.Color.fromCssColorString('#90EE90'),   // 绿地
  transportation: Cesium.Color.fromCssColorString('#A9A9A9'), // 交通用地
  default: Cesium.Color.fromCssColorString('#DCDCDC')       // 默认颜色
}

// 时间相关的常量
const TIME_STANDARDS = {
  start: Cesium.JulianDate.fromIso8601('2025-01-01'),
  end: Cesium.JulianDate.fromIso8601('2035-12-31')
}

class CesiumHelper {
  // 初始化查看器
  initViewer(container: HTMLElement, options = {}): Cesium.Viewer {
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

  // 根据地块类型创建材质
  createMaterialByType(type: string): Cesium.MaterialProperty {
    const color = LAND_USE_COLORS[type] || LAND_USE_COLORS.default
    return new Cesium.ColorMaterialProperty(color.withAlpha(0.6))
  }

  // 获取轮廓线颜色
  getOutlineColorByType(type: string): Cesium.Color {
    const baseColor = LAND_USE_COLORS[type] || LAND_USE_COLORS.default
    return baseColor.clone().darken(0.3, new Cesium.Color())
  }

  // 从 GeoJSON 格式转换为 Cesium 坐标
  createPositionFromGeometry(geometry: any): Cesium.Cartesian3 {
    if (!geometry || !geometry.coordinates) {
      throw new Error('Invalid geometry')
    }

    const [lon, lat, height = 0] = geometry.coordinates[0]
    return Cesium.Cartesian3.fromDegrees(lon, lat, height)
  }

  // 创建多边形层级结构
  createPolygonHierarchy(geometry: any): Cesium.PolygonHierarchy {
    if (!geometry || !geometry.coordinates) {
      throw new Error('Invalid geometry')
    }

    const positions = geometry.coordinates[0].map(([lon, lat, height = 0]) => 
      Cesium.Cartesian3.fromDegrees(lon, lat, height)
    )

    return new Cesium.PolygonHierarchy(positions)
  }

  // 添加GeoJSON图层
  async addGeoJsonLayer(
    viewer: Cesium.Viewer, 
    data: any, 
    style = {}
  ): Promise<Cesium.DataSource> {
    return viewer.dataSources.add(
      await Cesium.GeoJsonDataSource.load(data, {
        stroke: Cesium.Color.WHITE,
        fill: Cesium.Color.BLUE.withAlpha(0.5),
        strokeWidth: 2,
        ...style
      })
    )
  }

  // 创建时间间隔集合
  createTimeIntervalCollection(startTime: Date, endTime: Date): Cesium.TimeIntervalCollection {
    return new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromDate(startTime),
        stop: Cesium.JulianDate.fromDate(endTime),
        isStartIncluded: true,
        isStopIncluded: true
      })
    ])
  }

  // 执行日照分析
  runSunlightAnalysis(
    viewer: Cesium.Viewer,
    position: Cesium.Cartesian3,
    date: Date = new Date()
  ) {
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

  // 计算建筑物阴影投影
  calculateBuildingShadow(
    viewer: Cesium.Viewer,
    buildingEntity: Cesium.Entity,
    date: Date
  ): Cesium.Entity[] {
    const shadows: Cesium.Entity[] = []
    // 设置时间
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
    
    // 这里实现太阳位置计算和阴影投影的具体逻辑
    // 为简化示例，返回空数组
    return shadows
  }

  // 执行视线分析
  performViewshedAnalysis(
    viewer: Cesium.Viewer,
    viewpoint: Cesium.Cartesian3,
    direction: Cesium.Cartesian3,
    angle: number,
    distance: number
  ) {
    // 创建视线分析图形
    return viewer.entities.add({
      position: viewpoint,
      cylinder: {
        length: distance,
        topRadius: 0,
        bottomRadius: distance * Math.tan(Cesium.Math.toRadians(angle)),
        material: Cesium.Color.GREEN.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.GREEN
      }
    })
  }

  // 创建高亮效果
  createHighlightMaterial(): Cesium.MaterialProperty {
    return new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW.withAlpha(0.3))
  }

  // 转换经纬度坐标到笛卡尔坐标
  latLongToCartesian(longitude: number, latitude: number, height: number = 0): Cesium.Cartesian3 {
    return Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  }

  // 计算两点之间的地表距离
  calculateGroundDistance(point1: Cesium.Cartesian3, point2: Cesium.Cartesian3): number {
    return Cesium.Cartesian3.distance(point1, point2)
  }

  // 清理资源
  cleanup(viewer: Cesium.Viewer) {
    viewer.entities.removeAll()
    viewer.dataSources.removeAll()
    viewer.destroy()
  }
}

// 导出工具类实例
export const cesiumHelper = new CesiumHelper()