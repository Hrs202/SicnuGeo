&lt;template>
  &lt;div class="time-slider-container" :class="{ 'is-playing': isPlaying }">
    &lt;div class="time-controls">
      &lt;button class="control-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        &lt;i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'">&lt;/i>
      &lt;/button>
      &lt;button class="control-btn" @click="reset" title="重置">
        &lt;i class="fas fa-undo">&lt;/i>
      &lt;/button>
    &lt;/div>

    &lt;div class="timeline">
      &lt;div class="stage-indicators">
        &lt;div 
          v-for="stage in stages" 
          :key="stage.value"
          class="stage-marker"
          :class="{ active: currentStage === stage.value }"
          :style="{ left: getStagePosition(stage) + '%' }"
        >
          {{ stage.label }}
        &lt;/div>
      &lt;/div>

      &lt;el-slider
        v-model="currentTimeValue"
        :min="timeRange.start.getTime()"
        :max="timeRange.end.getTime()"
        :step="stepSize"
        :marks="timelineMarks"
        :format-tooltip="formatTooltip"
        @input="onSliderInput"
        @change="onSliderChange"
      />

      &lt;div class="current-time">
        {{ formatDate(currentTime) }}
      &lt;/div>
    &lt;/div>

    &lt;div class="playback-controls" v-if="isPlaying">
      &lt;el-select v-model="playbackSpeed" size="small">
        &lt;el-option 
          v-for="speed in playbackSpeeds" 
          :key="speed.value"
          :label="speed.label"
          :value="speed.value"
        />
      &lt;/el-select>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElSlider, ElSelect, ElOption } from 'element-plus'

// 类型定义
interface TimelineStage {
  value: 'current' | 'planned' | 'future'
  label: string
  date: Date
}

interface PlaybackSpeed {
  value: number
  label: string
}

// Props 定义
const props = defineProps&lt;{
  modelValue?: Date
  timeRange?: {
    start: Date
    end: Date
  }
}>()

// Emits 定义
const emit = defineEmits&lt;{
  (e: 'update:modelValue', value: Date): void
  (e: 'stage-change', stage: string): void
}>()

// 常量定义
const stages: TimelineStage[] = [
  { value: 'current', label: '现状', date: new Date('2025-01-01') },
  { value: 'planned', label: '规划', date: new Date('2030-01-01') },
  { value: 'future', label: '远景', date: new Date('2035-01-01') }
]

const playbackSpeeds: PlaybackSpeed[] = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 5, label: '5x' },
  { value: 10, label: '10x' }
]

// 响应式状态
const currentTimeValue = ref(props.modelValue?.getTime() || stages[0].date.getTime())
const isPlaying = ref(false)
const playbackSpeed = ref(1)
const stepSize = 24 * 60 * 60 * 1000 // 1天
let playbackInterval: number | null = null

// 计算属性
const timeRange = computed(() => ({
  start: props.timeRange?.start || stages[0].date,
  end: props.timeRange?.end || stages[stages.length - 1].date
}))

const currentTime = computed(() => new Date(currentTimeValue.value))

const currentStage = computed(() => {
  const time = currentTimeValue.value
  if (time &lt;= stages[1].date.getTime()) return 'current'
  if (time &lt;= stages[2].date.getTime()) return 'planned'
  return 'future'
})

const timelineMarks = computed(() => {
  const marks = {}
  stages.forEach(stage => {
    marks[stage.date.getTime()] = stage.label
  })
  return marks
})

// 方法定义
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTooltip = (val: number) => {
  return formatDate(new Date(val))
}

const getStagePosition = (stage: TimelineStage) => {
  const total = timeRange.value.end.getTime() - timeRange.value.start.getTime()
  const current = stage.date.getTime() - timeRange.value.start.getTime()
  return (current / total) * 100
}

const onSliderInput = (value: number) => {
  currentTimeValue.value = value
  emit('update:modelValue', new Date(value))
}

const onSliderChange = (value: number) => {
  const newStage = currentStage.value
  emit('stage-change', newStage)
}

const togglePlay = () => {
  if (isPlaying.value) {
    stopPlayback()
  } else {
    startPlayback()
  }
}

const startPlayback = () => {
  isPlaying.value = true
  playbackInterval = window.setInterval(() => {
    const nextTime = currentTimeValue.value + stepSize * playbackSpeed.value
    if (nextTime > timeRange.value.end.getTime()) {
      stopPlayback()
      return
    }
    currentTimeValue.value = nextTime
    emit('update:modelValue', new Date(nextTime))
  }, 1000)
}

const stopPlayback = () => {
  isPlaying.value = false
  if (playbackInterval) {
    clearInterval(playbackInterval)
    playbackInterval = null
  }
}

const reset = () => {
  stopPlayback()
  currentTimeValue.value = timeRange.value.start.getTime()
  emit('update:modelValue', timeRange.value.start)
  emit('stage-change', 'current')
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    currentTimeValue.value = Math.max(
      currentTimeValue.value - stepSize,
      timeRange.value.start.getTime()
    )
    emit('update:modelValue', new Date(currentTimeValue.value))
  } else if (event.key === 'ArrowRight') {
    currentTimeValue.value = Math.min(
      currentTimeValue.value + stepSize,
      timeRange.value.end.getTime()
    )
    emit('update:modelValue', new Date(currentTimeValue.value))
  } else if (event.key === 'Space') {
    event.preventDefault()
    togglePlay()
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopPlayback()
})

// 监听播放速度变化
watch(playbackSpeed, () => {
  if (isPlaying.value) {
    stopPlayback()
    startPlayback()
  }
})
&lt;/script>

&lt;style scoped>
.time-slider-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 800px;
  z-index: 1000;
}

.time-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.control-btn {
  background: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  background: #f5f7fa;
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.stage-indicators {
  position: relative;
  height: 30px;
  margin-bottom: 10px;
}

.stage-marker {
  position: absolute;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.3s;
}

.stage-marker.active {
  background: #409eff;
  color: white;
}

.current-time {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.playback-controls {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

:deep(.el-slider__runway) {
  margin: 16px 0;
}

:deep(.el-slider__bar) {
  background-color: #409eff;
}

:deep(.el-slider__button) {
  border-color: #409eff;
}

.is-playing :deep(.el-slider__button) {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}
&lt;/style>
