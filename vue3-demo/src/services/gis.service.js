import axios from 'axios';

/**
 * gis.service.js
 * 地图数据服务对接
 * 提供三维模型元数据获取、空间分析、GeoScene图层加载、时空数据查询等功能
 */


const BASE_URL = 'https://your-gis-api-server.com/api'; // 替换为实际GIS服务地址

// 获取三维模型元数据
export async function fetchModelMetadata(modelId) {
    const res = await axios.get(`${BASE_URL}/models/${modelId}/metadata`);
    return res.data;
}

// 请求空间分析结果
export async function requestSpatialAnalysis(params) {
    const res = await axios.post(`${BASE_URL}/spatial-analysis`, params);
    return res.data;
}

// 加载GeoScene图层服务
export async function loadGeoSceneLayer(layerId) {
    const res = await axios.get(`${BASE_URL}/geoscene/layers/${layerId}`);
    return res.data;
}

// 时空数据查询
export async function querySpatiotemporalData(queryParams) {
    const res = await axios.get(`${BASE_URL}/spatiotemporal/query`, { params: queryParams });
    return res.data;
}