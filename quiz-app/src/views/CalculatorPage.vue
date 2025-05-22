<template>
    <div class="calculator">
      <!-- 页面标题 -->
      <div v-if="isMobile" class="header">
        <h1>计算器</h1>
        <button class="back-button" @click="goHome">返回首页</button>
      </div>
  
      <!-- 移动端内容 -->
      <div v-if="isMobile">
        <!-- 分类卡片 -->
        <div v-if="!selectedTool" class="tool-list">
          <div
            v-for="tool in tools"
            :key="tool.id"
            class="tool-card"
            @click="selectTool(tool.id)"
          >
            <h3>{{ tool.name }}</h3>
            <button class="tool-button">进入</button>
          </div>
        </div>
  
        <!-- 动态加载工具组件 -->
        <div v-else class="tool-container">
          <component
            :is="selectedComponent"
            @back="selectedTool = null"
          ></component>
        </div>
      </div>
  
      <!-- 桌面端警告 -->
      <div v-else class="desktop-warning">
        <h1>请用手机打开本页面</h1>
      </div>
    </div>
  </template>
  
  <script>
  // 导入子组件
  import OriginalInverseComplement from '../components/counter/OriginalInverseComplement.vue';
  import IEEE754 from '../components/counter/IEEE754.vue';
  import ComplementArithmetic from '../components/counter/ComplementArithmetic.vue';
  import FloatingPoint from '../components/counter/FloatingPoint.vue';
  
  export default {
    components: {
      OriginalInverseComplement,
      IEEE754,
      ComplementArithmetic,
      FloatingPoint,
    },
    data() {
      return {
        isMobile: false,
        selectedTool: null,
        tools: [
          { id: 'original-inverse-complement', name: '原反补计算', component: 'OriginalInverseComplement' },
          { id: 'ieee754', name: 'IEEE754 转换', component: 'IEEE754' },
          { id: 'complement-arithmetic', name: '补码溢出判断', component: 'ComplementArithmetic' },
          { id: 'floating-point', name: '浮点计算', component: 'FloatingPoint' },
        ],
      };
    },
    created() {
      // 判断是否为移动端
      this.isMobile = this.checkIfMobile();
      if (!this.isMobile) {
        document.body.style.cursor = 'not-allowed';
      }
    },
    computed: {
      selectedComponent() {
        const tool = this.tools.find(t => t.id === this.selectedTool);
        return tool ? tool.component : null;
      },
    },
    methods: {
      checkIfMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /mobile|android|iphone|ipad|phone/i.test(userAgent);
      },
      selectTool(toolId) {
        this.selectedTool = toolId;
      },
      goHome() {
      this.$router.push("/"); // 返回首页
    },
    },
  };
  </script>
  
  <style scoped>
  /* 全局容器 */
  .calculator {
    padding: 20px;
    text-align: center;
    font-family: 'Segoe UI', 'PingFang SC', Arial, sans-serif;
    background: linear-gradient(135deg, #f0f4f8 0%, #e1e7ef 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* 页面标题 */
  .header h1 {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 20px;
    font-weight: 600;
    letter-spacing: 1px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #9b59b6;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #8e44ad;
}
  
  /* 分类卡片列表 */
  .tool-list {
    margin: 20px 0;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .tool-card {
    width:100%;
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;
    animation: fadeIn 0.5s ease-in;
  }
  
  .tool-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .tool-card h3 {
    font-size: 18px;
    color: #34495e;
    margin: 0;
    font-weight: 500;
  }
  
  .tool-button {
    background: linear-gradient(45deg, #9b59b6, #8e44ad);
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .tool-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    background: linear-gradient(45deg, #8e44ad, #9b59b6);
  }
  
  /* 工具容器 */
  .tool-container {
    width: 100%;
    margin: 20px 0;
  }
  
  /* 桌面端警告 */
  .desktop-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: #fff;
    font-size: 28px;
    font-weight: 600;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  /* 动画 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 响应式适配 */
  @media (max-width: 768px) {
    .calculator {
      padding: 15px;
    }
  
    .header h1 {
      font-size: 24px;
    }
  
    .tool-card h3 {
      font-size: 16px;
    }
  
    .tool-button {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
  </style>