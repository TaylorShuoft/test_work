<template>
    <div class="calc-tool">
      <h2>补码加减法 & 溢出判断</h2>
  
      <!-- 输入 x 和 y -->
      <div class="input-section">
        <div class="input-group">
          <label>x:</label>
          <input
            v-model="xInput"
            placeholder="输入 x (如 5, 0.11, -0.111)"
            class="input-box"
            @input="calculate"
          />
        </div>
        <div class="input-group">
          <label>y:</label>
          <input
            v-model="yInput"
            placeholder="输入 y (如 3, 0.11, -0.111)"
            class="input-box"
            @input="calculate"
          />
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="calc-button" @click="calculate">计算</button>
      </div>
  
      <!-- 结果展示 -->
      <div v-if="results" class="result-section">
        <h3>计算步骤</h3>
        <ul>
          <li>输入 x = {{ results.x }}, y = {{ results.y }}</li>
          <li>[x]补 = <span class="s-part">{{ results.xComplement.slice(0, 2) }}</span>{{ results.xComplement.slice(2) }}</li>
          <li>[y]补 = <span class="s-part">{{ results.yComplement.slice(0, 2) }}</span>{{ results.yComplement.slice(2) }}</li>
          <li>加法 [x + y]补 = <span class="s-part">{{ results.sumComplement.slice(0, 2) }}</span>{{ results.sumComplement.slice(2) }}</li>
          <li>减法 [x - y]补 = <span class="s-part">{{ results.diffComplement.slice(0, 2) }}</span>{{ results.diffComplement.slice(2) }}</li>
          <li>
            加法双符号位：<span :class="results.sumSignClass">{{ results.sumSignBits }}</span>
            ({{ results.sumOverflow }})
          </li>
          <li>
            减法双符号位：<span :class="results.diffSignClass">{{ results.diffSignBits }}</span>
            ({{ results.diffOverflow }})
          </li>
       
        </ul>
      </div>
  
      <button class="back-button" @click="$emit('back')">返回</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        xInput: '',
        yInput: '',
        errorMessage: '',
        results: null,
      };
    },
    methods: {
      calculate() {
        this.errorMessage = '';
        this.results = null;
  
        try {
          // 1. 解析输入（支持整数和小数）
          const x = parseFloat(this.xInput.trim());
          const y = parseFloat(this.yInput.trim());
          if (isNaN(x) || isNaN(y)) throw new Error('请输入有效的数字');
  
          // 2. 获取整数和小数部分，并对齐位数
          const xParts = this.getNumberParts(x);
          const yParts = this.getNumberParts(y);
          const maxIntLength = Math.max(xParts.intBinary.length, yParts.intBinary.length);
          const maxFracLength = Math.max(xParts.fracBinary.length, yParts.fracBinary.length);
  
          // 对齐整数和小数部分
          xParts.intBinary = xParts.intBinary.padStart(maxIntLength, '0');
          yParts.intBinary = yParts.intBinary.padStart(maxIntLength, '0');
          xParts.fracBinary = xParts.fracBinary.padEnd(maxFracLength, '0');
          yParts.fracBinary = yParts.fracBinary.padEnd(maxFracLength, '0');
  
          // 3. 计算补码
          const xComplement = this.toComplement(xParts, x < 0);
          const yComplement = this.toComplement(yParts, y < 0);
          const negYComplement = this.toComplement(yParts, y >= 0); // 用于减法 [x - y]补 = [x]补 + [-y]补
  
          // 4. 加法 [x + y]补
          const sumComplement = this.addComplements(xComplement, yComplement);
          const sumSignBits = sumComplement.slice(0, 2);
          const { overflow: sumOverflow, signClass: sumSignClass } = this.checkOverflow(sumSignBits);
          const sumDecimal = sumOverflow.includes('溢出') ? '溢出' : this.complementToDecimal(sumComplement, maxIntLength, maxFracLength);
  
          // 5. 减法 [x - y]补
          const diffComplement = this.addComplements(xComplement, negYComplement);
          const diffSignBits = diffComplement.slice(0, 2);
          const { overflow: diffOverflow, signClass: diffSignClass } = this.checkOverflow(diffSignBits);
          const diffDecimal = diffOverflow.includes('溢出') ? '溢出' : this.complementToDecimal(diffComplement, maxIntLength, maxFracLength);
  
          this.results = {
            x,
            y,
            xComplement,
            yComplement,
            sumComplement,
            diffComplement,
            sumSignBits,
            sumOverflow,
            sumSignClass,
            diffSignBits,
            diffOverflow,
            diffSignClass,
            sumDecimal,
            diffDecimal,
          };
        } catch (e) {
          this.errorMessage = e.message;
        }
      },
      // 获取数字的整数和小数部分
      getNumberParts(num) {
        const absNum = Math.abs(num);
        const intPart = Math.floor(absNum);
        let fracPart = (absNum.toString().split('.')[1] || '0');
  
        // 验证小数部分是否仅包含 0 和 1
        if (!/^[01]+$/.test(fracPart)) {
          throw new Error('小数部分必须仅包含 0 和 1');
        }
  
        // 整数部分转二进制
        const intBinary = intPart.toString(2);
        return { intBinary, fracBinary: fracPart };
      },
      // 将数字转换为补码
      toComplement(parts, isNegative) {
        let { intBinary, fracBinary } = parts;
  
        let complement;
        if (isNegative) {
          // 负数：原码取反 + 1
          let original = '11' + intBinary + '.' + fracBinary;
          let inverse = original.slice(0, 2) + original.slice(2).replace(/0/g, 'x').replace(/1/g, '0').replace(/x/g, '1');
          // 取反后的二进制加 1
          let fracPart = inverse.split('.')[1];
          let intPart = inverse.split('.')[0].slice(2);
          let carry = 1;
          let resultFrac = '';
          for (let i = fracPart.length - 1; i >= 0; i--) {
            const bit = parseInt(fracPart[i]) + carry;
            resultFrac = (bit % 2) + resultFrac;
            carry = Math.floor(bit / 2);
          }
          let resultInt = '';
          for (let i = intPart.length - 1; i >= 0; i--) {
            const bit = parseInt(intPart[i]) + carry;
            resultInt = (bit % 2) + resultInt;
            carry = Math.floor(bit / 2);
          }
          complement = '11' + resultInt + '.' + resultFrac;
        } else {
          // 正数：双符号位 00
          complement = '00' + intBinary + '.' + fracBinary;
        }
  
        return complement;
      },
      // 补码加法（忽略小数点）
      addComplements(comp1, comp2) {
        const bin1 = comp1.slice(0, 2) + comp1.slice(2).replace('.', '');
        const bin2 = comp2.slice(0, 2) + comp2.slice(2).replace('.', '');
        const length = bin1.length - 2; // 总长度 - 符号位长度
        const fracLength = comp1.split('.')[1].length;
  
        let result = '';
        let carry = 0;
        for (let i = length + 1; i >= 0; i--) {
          const bit1 = parseInt(bin1[i]);
          const bit2 = parseInt(bin2[i]);
          const sum = bit1 + bit2 + carry;
          result = (sum % 2) + result;
          carry = Math.floor(sum / 2);
        }
  
        // 重新插入小数点
        return result.slice(0, 2) + result.slice(2, 2 + length - fracLength) + '.' + result.slice(2 + length - fracLength);
      },
      // 补码转十进制
      complementToDecimal(complement, intLength, fracLength) {
        const signBits = complement.slice(0, 2);
        const intPart = complement.slice(2, 2 + intLength);
        let fracPart = complement.slice(2 + intLength + 1);
  
        let value;
        if (signBits === '11') {
          // 负数：取反 + 1 后计算绝对值
          let inverse = (intPart + '.' + fracPart).replace(/0/g, 'x').replace(/1/g, '0').replace(/x/g, '1');
          let fracPartInv = inverse.split('.')[1];
          let intPartInv = inverse.split('.')[0];
          let carry = 1;
          let resultFrac = '';
          for (let i = fracPartInv.length - 1; i >= 0; i--) {
            const bit = parseInt(fracPartInv[i]) + carry;
            resultFrac = (bit % 2) + resultFrac;
            carry = Math.floor(bit / 2);
          }
          let resultInt = '';
          for (let i = intPartInv.length - 1; i >= 0; i--) {
            const bit = parseInt(intPartInv[i]) + carry;
            resultInt = (bit % 2) + resultInt;
            carry = Math.floor(bit / 2);
          }
          let intValue = parseInt(resultInt, 2) || 0;
          let fracValue = 0;
          for (let i = 0; i < resultFrac.length; i++) {
            fracValue += parseInt(resultFrac[i]) * Math.pow(2, -(i + 1));
          }
          value = -(intValue + fracValue);
        } else {
          let intValue = parseInt(intPart, 2) || 0;
          let fracValue = 0;
          for (let i = 0; i < fracPart.length; i++) {
            fracValue += parseInt(fracPart[i]) * Math.pow(2, -(i + 1));
          }
          value = intValue + fracValue;
        }
  
        return value.toFixed(fracLength);
      },
      // 判断溢出
      checkOverflow(signBits) {
        let overflow, signClass;
        switch (signBits) {
          case '00':
            overflow = '不溢出';
            signClass = 'no-overflow';
            break;
          case '01':
            overflow = '正溢出';
            signClass = 'positive-overflow';
            break;
          case '10':
            overflow = '负溢出';
            signClass = 'negative-overflow';
            break;
          case '11':
            overflow = '不溢出';
            signClass = 'no-overflow';
            break;
          default:
            overflow = '未知';
            signClass = 'error';
        }
        return { overflow, signClass };
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
  
  .input-group {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 300px;
  }
  
  .input-group label {
    font-size: 16px;
    color: #34495e;
    font-weight: 500;
    width: 20px;
  }
  
  .input-box {
    flex: 1;
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
    word-break: break-all;
  }
  
  .result-section li::before {
    content: '•';
    color: #9b59b6;
    font-size: 18px;
  }
  
  /* 符号位颜色标记 */
  .s-part {
    color: #e74c3c; /* 红色，符号位 */
    font-weight: 600;
  }
  
  /* 双符号位颜色标记 */
  .no-overflow {
    color: #2ecc71; /* 绿色，不溢出 */
    font-weight: 600;
  }
  
  .positive-overflow {
    color: #e67e22; /* 橙色，正溢出 */
    font-weight: 600;
  }
  
  .negative-overflow {
    color: #e74c3c; /* 红色，负溢出 */
    font-weight: 600;
  }
  
  .error {
    color: #e74c3c; /* 红色，错误 */
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