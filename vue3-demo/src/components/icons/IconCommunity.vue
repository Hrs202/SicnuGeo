&lt;template>
  &lt;svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    &lt;!-- 社区建筑群轮廓 -->
    &lt;path 
      d="M3 21h18M5 21V7l8-4v18M13 7l6 3v11M9 9h1M9 13h1M9 17h1M15 13h1M15 17h1" 
      class="community-buildings"
    />
    &lt;!-- 人群互动图标 -->
    &lt;circle cx="7" cy="4" r="1" class="community-people" />
    &lt;circle cx="11" cy="4" r="1" class="community-people" />
    &lt;circle cx="15" cy="4" r="1" class="community-people" />
    &lt;path 
      d="M7 5v1M11 5v1M15 5v1" 
      class="community-connections"
    />
  &lt;/svg>
&lt;/template>

&lt;script setup lang="ts">
// 这是一个纯展示组件，不需要任何脚本逻辑
&lt;/script>

&lt;style scoped>
.community-buildings {
  stroke: currentColor;
  stroke-width: 2;
}

.community-people {
  fill: currentColor;
  stroke: none;
}

.community-connections {
  stroke: currentColor;
  stroke-width: 1.5;
}

/* 添加悬停效果 */
svg:hover {
  .community-buildings {
    stroke-width: 2.5;
  }
  
  .community-people {
    transform: scale(1.1);
    transform-origin: center;
    transition: transform 0.2s ease;
  }
  
  .community-connections {
    stroke-width: 2;
  }
}
&lt;/style>
