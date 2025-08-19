&lt;template>
  &lt;div class="time-slider">
    &lt;div class="timeline-panel" :class="{ 'is-playing': isPlaying }">
      &lt;!-- 时间轴控制按钮 -->
      &lt;div class="timeline-controls">
        &lt;el-button-group>
          &lt;el-button 
            :type="isPlaying ? 'primary' : 'default'"
            @click="togglePlay"
          >
            &lt;i :class="isPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'">&lt;/i>
          &lt;/el-button>
          &lt;el-button @click="resetTime">
            &lt;i class="el-icon-refresh-right">&lt;/i>
          &lt;/el-button>
        &lt;/el-button-group>

        &lt;!-- 时间速率控制 -->
        &lt;el-dropdown @command="changeSpeed" trigger="click">
          &lt;el-button>
            {{ currentSpeed }}x
            &lt;i class="el-icon-arrow-down">&lt;/i>
          &lt;/el-button>
          &lt;template #dropdown>
            &lt;el-dropdown-menu>
              &lt;el-dropdown-item 
                v-for="speed in speedOptions" 
                :key="speed"
                :command="speed"
              >
                {{ speed }}x
              &lt;/el-dropdown-item>
            &lt;/el-dropdown-menu>
          &lt;/template>
        &lt;/el-dropdown>
      &lt;/div>

      &lt;!-- 时间轴 -->
      &lt;div class="timeline-slider">
        &lt;el-slider
          v-model="currentTimeIndex"
          :min="0"
          :max="timePoints.length - 1"
          :step="1"
          :marks="timelineMarks"
          :format-tooltip="formatTimeTooltip"
          @change="onTimeChange"
        />
      &lt;/div>

      &lt;!-- 当前阶段显示 -->
      &lt;div class="timeline-info">
        &lt;div class="stage-info">
          &lt;span class="stage-label">当前阶段：&lt;/span>
          &lt;el-tag :type="stageTypeMap[currentStage]">
            {{ stageLabelMap[currentStage] }}
          &lt;/el-tag>
        &lt;/div>
        &lt;div class="time-info">
          {{ formatTimeDisplay(currentTime) }}
        &lt;/div>
      &lt;/div>
    &lt;/div>

    &lt;!-- 规划事件面板 -->
    &lt;el-drawer
      v-model="eventDrawerVisible"
      title="规划历史事件"
      direction="rtl"
      size="400px"
    >
      &lt;el-timeline>
        &lt;el-timeline-item
          v-for="event in timelineEvents"
          :key="event.id"
          :timestamp="formatTimeDisplay(event.time)"
          :type="event.type"
        >
          &lt;el-card class="event-card" :body-style="{ padding: '10px' }">
            &lt;h4>{{ event.title }}&lt;/h4>
            &lt;p>{{ event.description }}&lt;/p>
            &lt;el-button 
              type="text" 
              size="small"
              @click="jumpToEvent(event)"
            >
              查看详情
            &lt;/el-button>
          &lt;/el-card>
        &lt;/el-timeline-item>
      &lt;/el-timeline>
    &lt;/el-drawer>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/useMapStore'
import { ElMessage } from 'element-plus'

// 状态管理
const mapStore = useMapStore()

// 时间阶段定义
enum TimeStage {
  CURRENT = 'current',
  PLANNING = 'planning',
  FUTURE = 'future'
}

const stageLabelMap = {
  [TimeStage.CURRENT]: '现状',
  [TimeStage.PLANNING]: '规划',
  [TimeStage.FUTURE]: '远景'
}

const stageTypeMap = {
  [TimeStage.CURRENT]: 'info',
  [TimeStage.PLANNING]: 'warning',
  [TimeStage.FUTURE]: 'success'
}

// 组件状态
const isPlaying = ref(false)
const currentSpeed = ref(1)
const speedOptions = [0.5, 1, 2, 5]
const currentTimeIndex = ref(0)
const eventDrawerVisible = ref(false)

// 时间点定义
const timePoints = [
  { time: new Date('2025-01-01'), stage: TimeStage.CURRENT },
  { time: new Date('2026-01-01'), stage: TimeStage.CURRENT },
  { time: new Date('2027-01-01'), stage: TimeStage.PLANNING },
  { time: new Date('2028-01-01'), stage: TimeStage.PLANNING },
  { time: new Date('2029-01-01'), stage: TimeStage.PLANNING },
  { time: new Date('2030-01-01'), stage: TimeStage.FUTURE },
  { time: new Date('2031-01-01'), stage: TimeStage.FUTURE },
  { time: new Date('2032-01-01'), stage: TimeStage.FUTURE }
]

// 规划事件数据
const timelineEvents = [
  {
    id: 1,
    time: new Date('2025-06-01'),
    title: '城市总体规划修编',
    description: '完成城市总体规划修编和审批',
    type: 'primary'
  },
  {
    id: 2,
    time: new Date('2027-03-15'),
    title: '轨道交通建设',
    description: '开启城市轨道交通网络建设',
    type: 'success'
  },
  {
    id: 3,
    time: new Date('2028-09-01'),
    title: '生态廊道工程',
    description: '启动城市生态廊道建设工程',
    type: 'warning'
  },
  {
    id: 4,
    time: new Date('2030-12-31'),
    title: '智慧城市转型',
    description: '完成智慧城市基础设施建设',
    type: 'info'
  }
]

// 计算时间轴标记点
const timelineMarks = computed(() => {
  const marks: Record&lt;number, any> = {}
  timePoints.forEach((point, index) => {
    if (index % 2 === 0) {
      marks[index] = {
        label: point.time.getFullYear(),
        style: {
          color: '#409EFF',
          fontWeight: 'bold'
        }
      }
    }
  })
  return marks
})

// 计算当前时间和阶段
const currentTime = computed(() => timePoints[currentTimeIndex.value].time)
const currentStage = computed(() => timePoints[currentTimeIndex.value].stage)

// 格式化时间显示
const formatTimeDisplay = (time: Date) => {
  return time.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化时间轴提示
const formatTimeTooltip = (index: number) => {
  const point = timePoints[index]
  return `${point.time.getFullYear()} (${stageLabelMap[point.stage]})`
}

// 播放控制
let playInterval: number | null = null

const togglePlay = () => {
  if (isPlaying.value) {
    stopPlay()
  } else {
    startPlay()
  }
}

const startPlay = () => {
  if (playInterval) return
  
  isPlaying.value = true
  playInterval = window.setInterval(() => {
    if (currentTimeIndex.value >= timePoints.length - 1) {
      currentTimeIndex.value = 0
    } else {
      currentTimeIndex.value++
    }
  }, 1000 / currentSpeed.value)
}

const stopPlay = () => {
  if (playInterval) {
    clearInterval(playInterval)
    playInterval = null
  }
  isPlaying.value = false
}

// 重置时间
const resetTime = () => {
  stopPlay()
  currentTimeIndex.value = 0
}

// 改变播放速度
const changeSpeed = (speed: number) => {
  currentSpeed.value = speed
  if (isPlaying.value) {
    stopPlay()
    startPlay()
  }
}

// 时间变化处理
const onTimeChange = async (index: number) => {
  const point = timePoints[index]
  
  // 更新三维场景
  try {
    await mapStore.updateTimeStage(point.stage)
    
    // 检查是否有关联事件
    const nearestEvent = findNearestEvent(point.time)
    if (nearestEvent) {
      ElMessage.info(`${nearestEvent.title}：${nearestEvent.description}`)
    }
  } catch (error) {
    console.error('更新时间阶段失败:', error)
    ElMessage.error('更新时间阶段失败')
  }
}

// 查找最近的规划事件
const findNearestEvent = (time: Date) => {
  return timelineEvents.find(event => 
    Math.abs(event.time.getTime() - time.getTime()) &lt; 24 * 60 * 60 * 1000
  )
}

// 跳转到事件
const jumpToEvent = (event: any) => {
  const index = timePoints.findIndex(point => 
    Math.abs(point.time.getTime() - event.time.getTime()) &lt; 24 * 60 * 60 * 1000
  )
  
  if (index !== -1) {
    currentTimeIndex.value = index
    eventDrawerVisible.value = false
  }
}

// 监听时间变化
watch(currentTime, (newTime) => {
  // 发出时间变化事件
  mapStore.setCurrentTime(newTime)
})

// 组件销毁时清理
onUnmounted(() => {
  stopPlay()
})
&lt;/script>

&lt;style scoped>
.time-slider {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 800px;
}

.timeline-panel {
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.timeline-slider {
  padding: 0 20px;
}

.timeline-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 20px;
}

.stage-info {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .stage-label {
    font-weight: bold;
  }
}

.time-info {
  color: #606266;
  font-size: 14px;
}

.event-card {
  h4 {
    margin: 0;
    margin-bottom: 8px;
  }
  
  p {
    margin: 0;
    margin-bottom: 8px;
    color: #606266;
    font-size: 14px;
  }
}

:deep(.el-slider__button) {
  border-color: #409EFF;
}

:deep(.el-slider__bar) {
  background-color: #409EFF;
}

.is-playing {
  :deep(.el-slider__button) {
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
&lt;/style>
