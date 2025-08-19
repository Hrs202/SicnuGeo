&lt;template>
  &lt;div class="layer-control-panel" :class="{ 'is-collapsed': isCollapsed }">
    &lt;div class="panel-header">
      &lt;h3>图层管理&lt;/h3>
      &lt;div class="header-controls">
        &lt;el-button 
          size="small" 
          :icon="isCollapsed ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"
          @click="isCollapsed = !isCollapsed"
        />
      &lt;/div>
    &lt;/div>

    &lt;div class="panel-content">
      &lt;!-- 搜索框 -->
      &lt;div class="search-box">
        &lt;el-input
          v-model="searchQuery"
          placeholder="搜索图层"
          prefix-icon="el-icon-search"
          clearable
        />
      &lt;/div>

      &lt;!-- 预设视图选择 -->
      &lt;div class="preset-views">
        &lt;el-select 
          v-model="currentPreset" 
          placeholder="选择预设视图"
          @change="handlePresetChange"
        >
          &lt;el-option
            v-for="preset in presetViews"
            :key="preset.id"
            :label="preset.name"
            :value="preset.id"
          />
        &lt;/el-select>
        &lt;el-button 
          size="small" 
          type="primary" 
          @click="saveCurrentView"
        >
          保存当前视图
        &lt;/el-button>
      &lt;/div>

      &lt;!-- 图层树 -->
      &lt;div class="layer-tree">
        &lt;el-tree
          ref="layerTree"
          :data="filteredLayers"
          :props="treeProps"
          show-checkbox
          node-key="id"
          draggable
          @check="handleLayerCheck"
          @node-drag-end="handleLayerDragEnd"
        >
          &lt;template #default="{ node, data }">
            &lt;div class="layer-node">
              &lt;span class="layer-name">{{ data.name }}&lt;/span>
              &lt;div class="layer-controls" v-if="!data.children">
                &lt;el-popover
                  placement="right"
                  trigger="click"
                  width="200"
                >
                  &lt;template #reference>
                    &lt;el-button size="small" circle>
                      &lt;i class="el-icon-setting">&lt;/i>
                    &lt;/el-button>
                  &lt;/template>
                  &lt;div class="layer-settings">
                    &lt;div class="setting-item">
                      &lt;span>透明度&lt;/span>
                      &lt;el-slider
                        v-model="data.opacity"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        @change="(val) => handleOpacityChange(data, val)"
                      />
                    &lt;/div>
                    &lt;div class="setting-item">
                      &lt;span>可见范围&lt;/span>
                      &lt;el-switch
                        v-model="data.rangeVisible"
                        @change="(val) => handleRangeVisibilityChange(data, val)"
                      />
                    &lt;/div>
                  &lt;/div>
                &lt;/el-popover>
              &lt;/div>
            &lt;/div>
          &lt;/template>
        &lt;/el-tree>
      &lt;/div>

      &lt;!-- 图例面板 -->
      &lt;div class="legend-panel">
        &lt;div class="legend-header">
          &lt;h4>图例&lt;/h4>
          &lt;el-button 
            size="small" 
            @click="exportLegend"
          >
            导出
          &lt;/el-button>
        &lt;/div>
        &lt;div class="legend-content">
          &lt;div 
            v-for="item in activeLegendItems" 
            :key="item.id" 
            class="legend-item"
          >
            &lt;div 
              class="legend-symbol" 
              :style="getLegendSymbolStyle(item)"
            >&lt;/div>
            &lt;span class="legend-label">{{ item.label }}&lt;/span>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from 'element-plus'
import html2canvas from 'html2canvas'

// 类型定义
interface Layer {
  id: string
  name: string
  type: string
  visible: boolean
  opacity: number
  rangeVisible: boolean
  children?: Layer[]
  style?: any
}

interface PresetView {
  id: string
  name: string
  layers: string[]
  camera?: any
}

interface LegendItem {
  id: string
  label: string
  symbol: any
}

// Props 定义
const props = defineProps&lt;{
  modelValue?: string[]
  layers?: Layer[]
}>()

// Emits 定义
const emit = defineEmits&lt;{
  (e: 'update:modelValue', value: string[]): void
  (e: 'layer-change', layers: Layer[]): void
  (e: 'view-change', preset: PresetView): void
}>()

// 响应式状态
const isCollapsed = ref(false)
const searchQuery = ref('')
const currentPreset = ref('')
const layerTree = ref()

// 预设视图数据
const presetViews = ref&lt;PresetView[]>([
  {
    id: 'infrastructure',
    name: '基础设施视图',
    layers: ['roads', 'metro', 'utilities']
  },
  {
    id: 'greenspace',
    name: '绿地系统视图',
    layers: ['parks', 'waterways', 'forests']
  },
  {
    id: 'landuse',
    name: '用地规划视图',
    layers: ['residential', 'commercial', 'industrial']
  }
])

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const filteredLayers = computed(() => {
  if (!searchQuery.value) return props.layers

  const filterNode = (node: Layer): boolean => {
    if (node.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return true
    }
    if (node.children) {
      return node.children.some(filterNode)
    }
    return false
  }

  return props.layers?.filter(filterNode) || []
})

const activeLegendItems = computed(() => {
  const checkedNodes = layerTree.value?.getCheckedNodes() || []
  return checkedNodes
    .filter(node => !node.children)
    .map(node => ({
      id: node.id,
      label: node.name,
      symbol: node.style
    }))
})

// 方法定义
const handleLayerCheck = (checkedNodes: Layer[]) => {
  const checkedIds = checkedNodes.map(node => node.id)
  emit('update:modelValue', checkedIds)
}

const handleLayerDragEnd = (
  draggingNode: TreeNode,
  dropNode: TreeNode,
  position: 'before' | 'after' | 'inner'
) => {
  // 更新图层顺序
  const layers = layerTree.value.data
  emit('layer-change', layers)
}

const handleOpacityChange = (layer: Layer, value: number) => {
  layer.opacity = value
  emit('layer-change', props.layers || [])
}

const handleRangeVisibilityChange = (layer: Layer, value: boolean) => {
  layer.rangeVisible = value
  emit('layer-change', props.layers || [])
}

const handlePresetChange = (presetId: string) => {
  const preset = presetViews.value.find(p => p.id === presetId)
  if (preset) {
    emit('view-change', preset)
  }
}

const saveCurrentView = async () => {
  const name = await ElMessageBox.prompt('输入视图名称', '保存当前视图', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  if (name.action === 'confirm') {
    const checkedLayers = layerTree.value.getCheckedKeys()
    const newPreset: PresetView = {
      id: `custom-${Date.now()}`,
      name: name.value,
      layers: checkedLayers
    }
    presetViews.value.push(newPreset)
    ElMessage.success('视图已保存')
  }
}

const getLegendSymbolStyle = (item: LegendItem) => {
  return {
    backgroundColor: item.symbol?.color,
    border: item.symbol?.outline ? `1px solid ${item.symbol.outlineColor}` : 'none',
    width: '20px',
    height: '20px'
  }
}

const exportLegend = async () => {
  const legendElement = document.querySelector('.legend-content')
  if (legendElement) {
    try {
      const canvas = await html2canvas(legendElement)
      const link = document.createElement('a')
      link.download = '图例.png'
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('导出图例失败:', error)
      ElMessage.error('导出图例失败')
    }
  }
}
&lt;/script>

&lt;style scoped>
.layer-control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  max-height: calc(100vh - 40px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.is-collapsed {
  width: 50px;
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-content {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.search-box {
  margin-bottom: 12px;
}

.preset-views {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.layer-tree {
  margin-bottom: 12px;
}

.layer-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.layer-controls {
  opacity: 0;
  transition: opacity 0.3s;
}

.layer-node:hover .layer-controls {
  opacity: 1;
}

.layer-settings {
  padding: 8px;
}

.setting-item {
  margin-bottom: 8px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.legend-panel {
  border-top: 1px solid #e4e7ed;
  padding-top: 12px;
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-symbol {
  border-radius: 4px;
}

.legend-label {
  font-size: 12px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .layer-control-panel {
    width: 100%;
    max-width: none;
    top: auto;
    bottom: 0;
    right: 0;
    border-radius: 8px 8px 0 0;
  }

  .is-collapsed {
    width: 100%;
    height: 40px;
  }
}
&lt;/style>
