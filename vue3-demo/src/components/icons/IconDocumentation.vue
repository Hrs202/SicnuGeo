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
    &lt;!-- 文档主体 -->
    &lt;path 
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
      class="doc-body"
    />
    
    &lt;!-- 文档折角 -->
    &lt;path 
      d="M14 2v6h6" 
      class="doc-fold"
    />
    
    &lt;!-- 文档内容线条 -->
    &lt;path 
      d="M8 13h8M8 17h8M8 9h2" 
      class="doc-lines"
    />

    &lt;!-- 信息图标 -->
    &lt;g class="info-icon">
      &lt;circle cx="18" cy="19" r="3" />
      &lt;path d="M17.8 18h.4v2h-.4z" />
      &lt;circle cx="18" cy="16.8" r=".2" />
    &lt;/g>
  &lt;/svg>
&lt;/template>

&lt;script setup lang="ts">
// 这是一个纯展示组件，不需要任何脚本逻辑
&lt;/script>

&lt;style scoped>
.doc-body {
  stroke: currentColor;
  stroke-width: 1.5;
  fill: none;
}

.doc-fold {
  stroke: currentColor;
  stroke-width: 1.5;
  fill: none;
}

.doc-lines {
  stroke: currentColor;
  stroke-width: 1.5;
}

.info-icon {
  stroke: currentColor;
  fill: none;
  
  circle {
    stroke-width: 1.5;
  }
  
  path {
    stroke-width: 2;
    fill: currentColor;
  }
}

/* 悬停动画效果 */
svg:hover {
  .doc-body {
    stroke-width: 2;
    transition: stroke-width 0.2s ease;
  }
  
  .info-icon {
    transform: scale(1.1);
    transform-origin: center;
    transition: transform 0.2s ease;
    
    circle {
      fill: currentColor;
      opacity: 0.1;
      transition: all 0.2s ease;
    }
  }
  
  .doc-lines {
    stroke-width: 2;
    stroke-dasharray: 12;
    stroke-dashoffset: 24;
    animation: dash 1s linear infinite;
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}
&lt;/style>
