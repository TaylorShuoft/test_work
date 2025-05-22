<template>
    <div class="calc-tool">
      <h2>浮点计算</h2>
      <p>功能开发中，敬请期待！</p>
      <button class="back-button" @click="$emit('back')">返回</button>
    </div>
  </template>
  
  <script>
  export default {
    // 占位组件，无逻辑
  };
  </script>
  
  <style scoped>
  /* 计算工具容器 */
  .calc-tool {
    margin: 20px 0;
    padding: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    max-width: 100%;
    animation: fadeIn 0.5s ease-in;
  }
  
  .calc-tool h2 {
    font-size: 22px;
    color: #34495e;
    margin-bottom: 15px;
    font-weight: 500;
  }
  
  .calc-tool p {
    font-size: 16px;
    color: #34495e;
    margin-bottom: 20px;
  }
  
  /* 返回按钮 */
  .back-button {
    background: linear-gradient(45deg, #7f8c8d, #95a5a6);
    color: #fff;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .back-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
    .calc-tool {
      padding: 15px;
    }
  
    .calc-tool h2 {
      font-size: 20px;
    }
  
    .back-button {
      padding: 14px 32px;
      font-size: 16px;
    }
  }
  </style>