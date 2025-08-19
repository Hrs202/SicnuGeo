<template>
  <svg 
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
    <!-- 树木 -->
    <g class="tree">
      <path 
        d="M12 2v4M12 14v8M8 6l4-4 4 4M6 14l6-6 6 6" 
        class="tree-trunk"
      />
      <path 
        d="M6 14h12" 
        class="tree-branch"
      />
    </g>

    <!-- 水循环 -->
    <g class="water-cycle">
      <path 
        d="M3 16c2.5-3.5 5-3.5 7.5 0M13.5 16c2.5-3.5 5-3.5 7.5 0" 
        class="water-wave"
      />
      <path 
        d="M4 12c1-1 2-1 3 0" 
        class="water-drop"
      />
    </g>

    <!-- 生态链接 -->
    <g class="eco-connections">
      <circle cx="6" cy="18" r="1" class="eco-node" />
      <circle cx="12" cy="18" r="1" class="eco-node" />
      <circle cx="18" cy="18" r="1" class="eco-node" />
      <path 
        d="M6 18h12" 
        class="eco-link"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
// 这是一个纯展示组件，不需要任何脚本逻辑
</script>

<style scoped>
.tree {
  stroke: currentColor;
  stroke-width: 1.5;
}

.tree-trunk {
  stroke-width: 2;
}

.tree-branch {
  stroke-width: 1.5;
}

.water-cycle {
  stroke: currentColor;
  stroke-width: 1.5;
}

.water-wave {
  stroke-dasharray: 4;
}

.water-drop {
  stroke-width: 1;
}

.eco-connections {
  .eco-node {
    fill: currentColor;
    stroke: none;
  }

  .eco-link {
    stroke: currentColor;
    stroke-width: 1;
    stroke-dasharray: 4;
  }
}

/* 悬停动画效果 */
svg:hover {
  .tree {
    transform-origin: bottom;
    animation: sway 2s ease-in-out infinite;
  }

  .water-wave {
    animation: flow 2s linear infinite;
  }

  .water-drop {
    animation: drop 1.5s ease-in infinite;
  }

  .eco-link {
    animation: connect 2s linear infinite;
  }

  .eco-node {
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(2deg); }
}

@keyframes flow {
  to {
    stroke-dashoffset: -8;
  }
}

@keyframes drop {
  0% { transform: translateY(-2px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(2px); opacity: 0; }
}

@keyframes connect {
  to {
    stroke-dashoffset: -8;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
