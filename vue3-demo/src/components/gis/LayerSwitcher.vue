&lt;template>
  &lt;div class="layer-switcher">
    &lt;el-card class="layer-panel">
      &lt;template #header>
        &lt;div class="panel-header">
          &lt;span>图层管理&lt;/span>
          &lt;el-button-group>
            &lt;el-button 
              type="primary" 
              size="small"
              @click="saveLayerGroup"
              :disabled="!hasChanges"
            >
              保存组合
            &lt;/el-button>
            &lt;el-button 
              size="small"
              @click="resetLayers"
              :disabled="!hasChanges"
            >
              重置
            &lt;/el-button>
          &lt;/el-button-group>
        &lt;/div>
      &lt;/template>

      &lt;!-- 图层组合选择 -->
      &lt;el-select
        v-model="currentGroup"
        placeholder="选择图层组合"
        class="group-select"
        clearable
      >
        &lt;el-option
          v-for="group in savedGroups"
          :key="group.id"
          :label="group.name"
          :value="group.id"
        />
      &lt;/el-select>

      &lt;!-- 图层列表 -->
      &lt;el-collapse v-model="activeCategories">
        &lt;!-- 基础设施图层 -->
        &lt;el-collapse-item name="infrastructure">
          &lt;template #title>
            &lt;i class="el-icon-office-building">&lt;/i>
            基础设施
          &lt;/template>
          
          &lt;div 
            v-for="layer in infrastructureLayers"
            :key="layer.id"
            class="layer-item"
          >
            &lt;div class="layer-header">
              &lt;el-checkbox
                v-model="layer.visible"
                @change="(val) => toggleLayer(layer.id, val)"
              >
                {{ layer.name }}
              &lt;/el-checkbox>
            &lt;/div>
            
            &lt;el-slider
              v-if="layer.visible"
              v-model="layer.opacity"
              :min="0"
              :max="100"
              @change="(val) => updateOpacity(layer.id, val)"
            />
          &lt;/div>
        &lt;/el-collapse-item>

        &lt;!-- 绿地图层 -->
        &lt;el-collapse-item name="greenspace">
          &lt;template #title>
            &lt;i class="el-icon-tree">&lt;/i>
            绿地系统
          &lt;/template>
          
          &lt;div 
            v-for="layer in greenspaceLayers"
            :key="layer.id"
            class="layer-item"
          >
            &lt;div class="layer-header">
              &lt;el-checkbox
                v-model="layer.visible"
                @change="(val) => toggleLayer(layer.id, val)"
              >
                {{ layer.name }}
              &lt;/el-checkbox>
            &lt;/div>
            
            &lt;el-slider
              v-if="layer.visible"
              v-model="layer.opacity"
              :min="0"
              :max="100"
              @change="(val) => updateOpacity(layer.id, val)"
            />
          &lt;/div>
        &lt;/el-collapse-item>

        &lt;!-- 规划项目图层 -->
        &lt;el-collapse-item name="planning">
          &lt;template #title>
            &lt;i class="el-icon-map-location">&lt;/i>
            规划项目
          &lt;/template>
          
          &lt;div 
            v-for="layer in planningLayers"
            :key="layer.id"
            class="layer-item"
          >
            &lt;div class="layer-header">
              &lt;el-checkbox
                v-model="layer.visible"
                @change="(val) => toggleLayer(layer.id, val)"
              >
                {{ layer.name }}
              &lt;/el-checkbox>
            &lt;/div>
            
            &lt;el-slider
              v-if="layer.visible"
              v-model="layer.opacity"
              :min="0"
              :max="100"
              @change="(val) => updateOpacity(layer.id, val)"
            />
          &lt;/div>
        &lt;/el-collapse-item>
      &lt;/el-collapse>
    &lt;/el-card>

    &lt;!-- 保存组合对话框 -->
    &lt;el-dialog
      v-model="saveDialogVisible"
      title="保存图层组合"
      width="30%"
    >
      &lt;el-form :model="saveForm" label-width="80px">
        &lt;el-form-item label="组合名称">
          &lt;el-input v-model="saveForm.name" placeholder="请输入组合名称" />
        &lt;/el-form-item>
        &lt;el-form-item label="描述">
          &lt;el-input
            v-model="saveForm.description"
            type="textarea"
            placeholder="请输入组合描述"
          />
        &lt;/el-form-item>
      &lt;/el-form>
      &lt;template #footer>
        &lt;span class="dialog-footer">
          &lt;el-button @click="saveDialogVisible = false">取消&lt;/el-button>
          &lt;el-button type="primary" @click="confirmSave">保存&lt;/el-button>
        &lt;/span>
      &lt;/template>
    &lt;/el-dialog>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, computed } from 'vue'
import { useMapStore } from '@/stores/useMapStore'
import { ElMessage } from 'element-plus'

// 状态管理
const mapStore = useMapStore()

// 组件状态
const activeCategories = ref(['infrastructure', 'greenspace', 'planning'])
const currentGroup = ref('')
const saveDialogVisible = ref(false)
const saveForm = ref({
  name: '',
  description: ''
})

// 图层定义
const infrastructureLayers = ref([
  { id: 'roads', name: '道路系统', visible: true, opacity: 100 },
  { id: 'buildings', name: '建筑设施', visible: true, opacity: 100 },
  { id: 'pipelines', name: '地下管网', visible: false, opacity: 100 }
])

const greenspaceLayers = ref([
  { id: 'parks', name: '公园绿地', visible: true, opacity: 100 },
  { id: 'waterways', name: '水系', visible: true, opacity: 100 },
  { id: 'ecology', name: '生态廊道', visible: false, opacity: 100 }
])

const planningLayers = ref([
  { id: 'projects', name: '在建项目', visible: true, opacity: 100 },
  { id: 'future', name: '规划项目', visible: true, opacity: 100 },
  { id: 'reserved', name: '预留用地', visible: false, opacity: 100 }
])

// 保存的图层组合
const savedGroups = ref([
  { id: 'default', name: '默认视图', layers: [] },
  { id: 'planning', name: '规划分析', layers: [] }
])

// 计算是否有未保存更改
const hasChanges = computed(() => {
  // 检查是否有图层可见性或透明度的改变
  return true // 这里需要实现实际的检查逻辑
})

// 图层操作方法
const toggleLayer = (layerId: string, visible: boolean) => {
  mapStore.toggleLayer(layerId)
  // 同步到 Cesium 图层
  if (mapStore.viewer) {
    const layer = mapStore.viewer.scene.layers.find(l => l.id === layerId)
    if (layer) {
      layer.show = visible
    }
  }
}

const updateOpacity = (layerId: string, opacity: number) => {
  // 更新 Cesium 图层透明度
  if (mapStore.viewer) {
    const layer = mapStore.viewer.scene.layers.find(l => l.id === layerId)
    if (layer) {
      layer.alpha = opacity / 100
    }
  }
}

// 保存图层组合
const saveLayerGroup = () => {
  saveDialogVisible.value = true
}

const confirmSave = () => {
  if (!saveForm.value.name) {
    ElMessage.warning('请输入组合名称')
    return
  }

  // 收集当前图层状态
  const currentState = {
    infrastructure: infrastructureLayers.value.map(l => ({
      id: l.id,
      visible: l.visible,
      opacity: l.opacity
    })),
    greenspace: greenspaceLayers.value.map(l => ({
      id: l.id,
      visible: l.visible,
      opacity: l.opacity
    })),
    planning: planningLayers.value.map(l => ({
      id: l.id,
      visible: l.visible,
      opacity: l.opacity
    }))
  }

  // 保存到本地存储
  const newGroup = {
    id: Date.now().toString(),
    name: saveForm.value.name,
    description: saveForm.value.description,
    layers: currentState
  }

  savedGroups.value.push(newGroup)
  
  // 保存到本地存储
  localStorage.setItem('layerGroups', JSON.stringify(savedGroups.value))

  saveDialogVisible.value = false
  ElMessage.success('图层组合保存成功')
}

// 重置图层状态
const resetLayers = () => {
  // 重置所有图层到默认状态
  infrastructureLayers.value.forEach(l => {
    l.visible = l.id === 'roads' || l.id === 'buildings'
    l.opacity = 100
    toggleLayer(l.id, l.visible)
    updateOpacity(l.id, l.opacity)
  })

  greenspaceLayers.value.forEach(l => {
    l.visible = l.id === 'parks' || l.id === 'waterways'
    l.opacity = 100
    toggleLayer(l.id, l.visible)
    updateOpacity(l.id, l.opacity)
  })

  planningLayers.value.forEach(l => {
    l.visible = l.id === 'projects'
    l.opacity = 100
    toggleLayer(l.id, l.visible)
    updateOpacity(l.id, l.opacity)
  })

  currentGroup.value = ''
  ElMessage.success('图层已重置')
}

// 初始化：从本地存储加载保存的图层组合
const initSavedGroups = () => {
  const saved = localStorage.getItem('layerGroups')
  if (saved) {
    savedGroups.value = JSON.parse(saved)
  }
}

// 组件挂载时初始化
initSavedGroups()
&lt;/script>

&lt;style scoped>
.layer-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 300px;
}

.layer-panel {
  background: rgba(255, 255, 255, 0.95);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-select {
  width: 100%;
  margin-bottom: 15px;
}

.layer-item {
  margin: 10px 0;
  padding: 5px;
  border-radius: 4px;
  background: #f5f7fa;
}

.layer-header {
  margin-bottom: 10px;
}

:deep(.el-collapse-item__header) {
  font-weight: bold;
  
  i {
    margin-right: 8px;
  }
}

:deep(.el-slider) {
  margin-top: 8px;
  margin-left: 24px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}
&lt;/style>
