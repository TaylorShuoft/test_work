<template>
    <div class="calc-tool">
      <h2>IEEE754 转换</h2>
  
      <!-- 切换正向/反向计算 -->
      <div class="mode-toggle">
        <button
          :class="{ active: mode === 'forward' }"
          @click="mode = 'forward'; reset()"
        >
          十进制 → IEEE754
        </button>
        <button
          :class="{ active: mode === 'reverse' }"
          @click="mode = 'reverse'; reset()"
        >
          IEEE754 → 十进制
        </button>
      </div>
  
      <!-- 正向计算：十进制输入 -->
      <div v-if="mode === 'forward'" class="input-section">
        <input
          v-model="decimalInput"
          placeholder="输入十进制数 (如 42, -42.5, 1/2, -1/2)"
          class="input-box"
          @input="calculateForward"
        />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="calc-button" @click="calculateForward">计算</button>
      </div>
  
      <!-- 反向计算：二进制或十六进制输入 -->
      <div v-if="mode === 'reverse'" class="input-section">
        <input
          v-model="ieeeInput"
          placeholder="输入 32 位二进制或 8 位十六进制 (如 01000001111000000000000000000000 或 41E00000)"
          class="input-box"
          @input="calculateReverse"
        />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="calc-button" @click="calculateReverse">计算</button>
      </div>
  
      <!-- 结果展示 -->
      <div v-if="results" class="result-section">
        <div v-if="mode === 'forward'">
          <h3>计算步骤</h3>
          <ul>
            <li>十进制数：{{ results.decimal }}</li>
            <li>二进制表示：{{ results.binaryRaw }}</li>
            <li>规格化形式：{{ results.normalized }}</li>
            <li>符号位 (S)：<span class="s-part">{{ results.S }}</span></li>
            <li>阶码 (E)：<span class="e-part">{{ results.E }}</span> (十进制: {{ results.E_decimal }})</li>
            <li>尾数 (M)：<span class="m-part">{{ results.M }}</span></li>
            <li>
              IEEE754 二进制：
              <span class="s-part">{{ results.S }}</span>&nbsp;
              <span class="e-part">{{ results.E }}</span>&nbsp;
              <span class="m-part">{{ results.M }}</span>
            </li>
            <li>IEEE754 十六进制：{{ results.hex }}</li>
          </ul>
        </div>
        <div v-if="mode === 'reverse'">
          <h3>计算步骤</h3>
          <ul>
            <li>
              输入 IEEE754：
              <span class="s-part">{{ results.S }}</span>&nbsp;
              <span class="e-part">{{ results.E }}</span>&nbsp;
              <span class="m-part">{{ results.M }}</span>
              (十六进制: {{ results.hex }})
            </li>
            <li>符号位 (S)：<span class="s-part">{{ results.S }}</span></li>
            <li>阶码 (E)：<span class="e-part">{{ results.E }}</span> (十进制: {{ results.E_decimal }})</li>
            <li>尾数 (M)：<span class="m-part">{{ results.M }}</span></li>
            <li>规格化形式：{{ results.normalized }}</li>
            <li>十进制值：{{ results.decimal }}</li>
          </ul>
        </div>
      </div>
  
      <button class="back-button" @click="$emit('back')">返回</button>
    </div>
  </template>
  
  <script>
  // 引入 big.js 进行高精度计算
  import Big from 'big.js';
  
  export default {
    data() {
      return {
        mode: 'forward', // forward: 十进制 → IEEE754, reverse: IEEE754 → 十进制
        decimalInput: '',
        ieeeInput: '',
        errorMessage: '',
        results: null,
      };
    },
    methods: {
      reset() {
        this.decimalInput = '';
        this.ieeeInput = '';
        this.errorMessage = '';
        this.results = null;
      },
      // 正向计算：十进制 → IEEE754
      calculateForward() {
        this.errorMessage = '';
        this.results = null;
  
        try {
          // 1. 解析十进制输入
          let num = this.parseDecimalInput(this.decimalInput);
          if (isNaN(num)) throw new Error('无效的数字');
  
          // 使用 big.js 转换
          const bigNum = new Big(num);
  
          // 2. 特殊情况处理
          if (bigNum.eq(0)) {
            this.results = {
              decimal: '0',
              binaryRaw: '0',
              normalized: '0 × 2^0',
              S: '0',
              E: '00000000',
              E_decimal: '0',
              M: '00000000000000000000000',
              binary: '00000000000000000000000000000000',
              hex: '00000000',
            };
            return;
          }
  
          // 3. 确定符号位
          const S = bigNum.lt(0) ? '1' : '0';
          const absNum = bigNum.abs();
  
          // 4. 转换为二进制并规格化
          const { binaryRaw, mantissa, exponent } = this.toScientificBinary(absNum);
          const normalized = `${mantissa} × 2^${exponent}`;
  
          // 5. 计算阶码 E = e + 127
          const e = exponent;
          const E = e + 127;
          if (E < 0 || E > 255) throw new Error('阶码超出范围 (0-255)');
          const E_binary = E.toString(2).padStart(8, '0');
  
          // 6. 获取尾数 M（小数点后 23 位）
          const mantissaFraction = mantissa.startsWith('1.') ? mantissa.slice(2) : mantissa;
          const M = mantissaFraction.padEnd(23, '0').slice(0, 23);
  
          // 7. 拼接 IEEE754 二进制
          const binary = S + E_binary + M;
  
          // 8. 转换为十六进制
          const hex = parseInt(binary, 2).toString(16).padStart(8, '0').toUpperCase();
  
          this.results = {
            decimal: num.toString(),
            binaryRaw,
            normalized,
            S,
            E: E_binary,
            E_decimal: E.toString(),
            M,
            binary,
            hex,
          };
        } catch (e) {
          this.errorMessage = e.message;
        }
      },
      // 反向计算：IEEE754 → 十进制
      calculateReverse() {
        this.errorMessage = '';
        this.results = null;
  
        try {
          // 1. 解析输入（二进制或十六进制）
          let binary = this.parseIEEEInput(this.ieeeInput);
          if (binary.length !== 32 || !/^[01]+$/.test(binary)) {
            throw new Error('请输入有效的 32 位二进制或 8 位十六进制');
          }
  
          // 2. 解析 S, E, M
          const S = binary[0];
          const E_binary = binary.slice(1, 9);
          const M = binary.slice(9);
  
          // 3. 计算 e = E - 127
          const E = parseInt(E_binary, 2);
          const e = E - 127;
  
          // 4. 还原尾数 1.M
          const mantissa = '1.' + M;
          const mantissaValue = this.binaryFractionToDecimal(mantissa);
  
          // 5. 规格化形式
          const normalized = `${mantissa} × 2^${e}`;
  
          // 6. 计算十进制值：(-1)^S × (1.M) × 2^e
          const sign = Math.pow(-1, parseInt(S));
          const bigMantissa = new Big(mantissaValue);
          const bigPower = new Big(2).pow(e);
          const decimal = bigMantissa.times(bigPower).times(sign);
  
          // 7. 转换为十六进制
          const hex = parseInt(binary, 2).toString(16).padStart(8, '0').toUpperCase();
  
          this.results = {
            binary,
            hex,
            S,
            E: E_binary,
            E_decimal: E.toString(),
            M,
            normalized,
            decimal: decimal.toFixed(6), // 保留 6 位小数
          };
        } catch (e) {
          this.errorMessage = e.message;
        }
      },
      // 解析十进制输入（支持小数、分数）
      parseDecimalInput(input) {
        input = input.trim();
        if (input.includes('/')) {
          const [numerator, denominator] = input.split('/').map(n => parseFloat(n.trim()));
          if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
            throw new Error('无效的分数格式');
          }
          return numerator / denominator;
        }
        return parseFloat(input);
      },
      // 将十进制数转换为规格化二进制形式
      toScientificBinary(num) {
        // 分离整数和小数部分
        let intPart = num.div(1).round(0, 0); // 向下取整
        let fracPart = num.minus(intPart);
  
        // 整数部分转二进制
        let intBinary = intPart.eq(0) ? '0' : '';
        let tempInt = intPart.abs();
        while (tempInt.gte(1)) {
          intBinary = (tempInt.mod(2).toString()) + intBinary;
          tempInt = tempInt.div(2).round(0, 0);
        }
  
        // 小数部分转二进制
        let fracBinary = '';
        let precision = 30; // 限制小数部分精度
        while (fracPart.gt(0) && fracBinary.length < precision) {
          fracPart = fracPart.times(2);
          const bit = fracPart.gte(1) ? 1 : 0;
          fracBinary += bit;
          fracPart = fracPart.minus(bit);
        }
  
        // 合并整数和小数部分
        let binary = intBinary + (fracBinary ? '.' + fracBinary : '');
  
        // 规格化：1.***** × 2^e
        let mantissa, exponent;
        const dotIndex = binary.indexOf('.');
        const firstOne = binary.indexOf('1');
  
        if (firstOne === -1) {
          // 全 0
          return { binaryRaw: '0', mantissa: '0', exponent: 0 };
        }
  
        if (dotIndex === -1) {
          // 纯整数
          exponent = binary.length - firstOne - 1;
          mantissa = '1.' + binary.slice(firstOne + 1);
        } else if (firstOne < dotIndex) {
          // 小数点前有 1
          exponent = dotIndex - firstOne - 1;
          mantissa = '1.' + binary.slice(firstOne + 1, dotIndex) + binary.slice(dotIndex + 1);
        } else {
          // 小数点后有 1
          const fracFirstOne = binary.slice(dotIndex + 1).indexOf('1') + dotIndex + 1;
          exponent = -(fracFirstOne - dotIndex);
          mantissa = '1.' + binary.slice(fracFirstOne + 1);
        }
  
        // 移除尾数中的小数点（仅保留小数部分）
        const mantissaFraction = mantissa.slice(2) || '0';
  
        return { binaryRaw: binary, mantissa: '1.' + mantissaFraction, exponent };
      },
      // 解析 IEEE754 输入（二进制或十六进制）
      parseIEEEInput(input) {
        input = input.trim().toUpperCase();
        if (/^[01]+$/.test(input)) {
          // 二进制输入
          return input;
        } else if (/^[0-9A-F]{8}$/.test(input)) {
          // 十六进制输入
          const binary = parseInt(input, 16).toString(2).padStart(32, '0');
          return binary;
        }
        throw new Error('输入格式错误');
      },
      // 将二进制小数（如 1.1101）转换为十进制
      binaryFractionToDecimal(binary) {
        const [intPart, fracPart] = binary.split('.');
        let value = new Big(intPart || '0');
        if (fracPart) {
          let fracValue = new Big(0);
          for (let i = 0; i < fracPart.length; i++) {
            const bit = parseInt(fracPart[i]);
            fracValue = fracValue.plus(new Big(bit).times(new Big(2).pow(-(i + 1))));
          }
          value = value.plus(fracValue);
        }
        return value;
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
  
  /* 模式切换按钮 */
  .mode-toggle {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .mode-toggle button {
    background: rgba(155, 89, 182, 0.2); /* 紫色透明背景 */
    color: #34495e;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s, transform 0.2s;
  }
  
  .mode-toggle button:hover {
    background: rgba(155, 89, 182, 0.3);
    transform: translateY(-1px);
  }
  
  .mode-toggle button.active {
    background: #9b59b6;
    color: #fff;
    font-weight: 600;
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
  
  .result-section h3 {
    font-size: 18px;
    color: #34495e;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .result-section ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .result-section li {
    margin-bottom: 12px;
    font-size: 15px;
    color: #34495e;
    display: flex;
    align-items: center;
    gap: 8px;
    word-break: break-all; /* 防止长字符串溢出 */
  }
  
  .result-section li::before {
    content: '•';
    color: #9b59b6; /* 与计算器主题色一致 */
    font-size: 18px;
  }
  
  /* S, E, M 颜色标记 */
  .s-part {
    color: #e74c3c; /* 红色，符号位 */
    font-weight: 600;
  }
  
  .e-part {
    color: #9b59b6; /* 紫色，阶码 */
    font-weight: 600;
  }
  
  .m-part {
    color: #3498db; /* 蓝色，尾数 */
    font-weight: 600;
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
  
    .mode-toggle button {
      padding: 6px 12px;
      font-size: 13px;
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
  
    .result-section h3 {
      font-size: 16px;
    }
  
    .result-section li {
      font-size: 14px;
    }
  }
  </style>