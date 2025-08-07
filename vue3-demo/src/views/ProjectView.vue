<template>
  <div class="project-detail">
    <el-page-header @back="router.back()">
      <template #content>
        <h1>{{ project.name }}</h1>
      </template>
    </el-page-header>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="项目概览">
        <ProjectOverview :project="project" />
      </el-tab-pane>
      
      <el-tab-pane label="时间线">
        <ProjectTimeline :stages="project.timeline" />
      </el-tab-pane>
      
      <el-tab-pane label="参与记录" v-if="project.participation">
        <ParticipationRecords :records="project.participation" />
      </el-tab-pane>
    </el-tabs>
    
    <div class="action-bar">
      <el-button 
        type="primary" 
        v-if="userStore.can('submit_feedback')"
        @click="showFeedbackDialog"
      >
        提出建议
      </el-button>
      
      <el-button 
        :icon="isSubscribed ? 'BellFilled' : 'Bell'"
        @click="toggleSubscription"
      >
        {{ isSubscribed ? '已订阅' : '订阅更新' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { fetchProjectDetails } from '@/services/project.service'

const route = useRoute()
const userStore = useUserStore()
const project = ref<any>(null)
const activeTab = ref('overview')
const isSubscribed = ref(false)

onMounted(async () => {
  const projectId = route.params.id as string
  project.value = await fetchProjectDetails(projectId)
})

const toggleSubscription = () => {
  isSubscribed.value = !isSubscribed.value
  // 调用订阅API
}
</script>