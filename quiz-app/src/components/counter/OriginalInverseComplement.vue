<template>
    <div class="calc-tool">
      <h2>原码、反码、补码计算</h2>
      <div class="input-section">
        <input
          v-model="inputValue"
          placeholder="输入数字 (如 42, -42, 0x2A, 0b101010, 1/2, -1/2)"
          class="input-box"
          @input="calculateCodes"
        />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="calc-button" @click="calculateCodes">计算</button>
      </div>
      <div v-if="results" class="result-section">
        <p><strong>原码：</strong> {{ results.original }}</p>
        <p><strong>反码：</strong> {{ results.inverse }}</p>
        <p><strong>补码：</strong> {{ results.complement }}</p>
      </div>
      <button class="back-button" @click="$emit('back')">返回</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        inputValue: '',
        errorMessage: '',
        results: null,
      };
    },
    methods: {
      calculateCodes() {
        this.errorMessage = '';
        this.results = null;
  
        let value;
        try {
          // 处理输入
          const input = this.inputValue.trim().toLowerCase();
  
          // 分数处理 (如 1/2, -1/2)
          if (input.includes('/')) {
            const [numerator, denominator] = input.split('/').map(n => parseFloat(n.trim()));
            if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
              throw new Error('无效的分数格式');
            }
            value = Math.floor(numerator / denominator); // 取整
          }
          // 二进制 (0b开头)
          else if (input.startsWith('0b')) {
            value = parseInt(input.slice(2), 2);
            if (isNaN(value)) throw new Error('无效的二进制数');
          }
          // 十六进制 (0x开头)
          else if (input.startsWith('0x')) {
            value = parseInt(input.slice(2), 16);
            if (isNaN(value)) throw new Error('无效的十六进制数');
          }
          // 十进制 (支持正负)
          else {
            value = parseFloat(input);
            if (isNaN(value)) throw new Error('无效的数字');
            value = Math.floor(value); // 取整
          }
  
          // 计算原码、反码、补码 (8位定点数)
          const isNegative = value < 0;
          const absValue = Math.abs(value);
          if (absValue > 127) {
            throw new Error('数字超出8位定点数范围 (-128 ~ 127)');
          }
  
          // 原码：符号位 + 绝对值二进制
          let original = (isNegative ? '1' : '0') + absValue.toString(2).padStart(7, '0');
          // 反码：正数=原码，负数=原码除符号位取反
          let inverse = isNegative
            ? original[0] + original.slice(1).replace(/0/g, 'x').replace(/1/g, '0').replace(/x/g, '1')
            : original;
          // 补码：正数=原码，负数=反码+1
          let complement = isNegative
            ? (parseInt(inverse, 2) + 1).toString(2).padStart(8, '0')
            : original;
  
          this.results = {
            original,
            inverse,
            complement,
          };
        } catch (e) {
          this.errorMessage = e.message;
        }
      },
    },
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
  
  /* 输入区域 */
  .input-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .input-box {
    width: 100%;
    max-width: 300px;
    padding: 16px;
    font-size: 18px;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s;
  }
  
  .input-box:focus {
    border-color: #9b59b6;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 14px;
    margin: 5px 0;
  }
  
  .calc-button {
    background: linear-gradient(45deg, #9b59b6, #8e44ad);
    color: #fff;
    padding: 16px 36px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .calc-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    background: linear-gradient(45deg, #8e44ad, #9b59b6);
  }
  
  /* 结果区域 */
  .result-section {
    margin-top: 20px;
    padding: 16px;
    background: #f9fbfc;
    border-radius: 8px;
    text-align: left;
  }
  
  .result-section p {
    font-size: 16px;
    color: #34495e;
    margin: 8px 0;
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
  
    .input-box {
      font-size: 16px;
      padding: 14px;
    }
  
    .calc-button,
    .back-button {
      padding: 14px 32px;
      font-size: 16px;
    }
  }
  </style>