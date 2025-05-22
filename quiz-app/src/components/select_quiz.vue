<template>
  <div class="select-quiz" :class="{ hidden: hidden }">
    <div class="container">
      <!-- 显示/隐藏按钮 -->
      <button class="toggle-button" @click="toggleVisibility">答题卡</button>

      <!-- 按题型分块显示 -->
      <div class="quiz-map-container" v-if="!hidden">
        <div v-for="(questions, type) in groupedQuestions" :key="type" class="quiz-section">
          <h3>{{ type }}</h3>
          <div class="quiz-map">
            <button
              v-for="(question, index) in questions"
              :key="index"
              class="quiz-button"
              :class="answers[question.globalIndex]"
              @click="$emit('navigate', question.globalIndex)"
            >
              {{ question.id }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    groupedQuestions: Object, // 按题型分组后的题目数据
    currentQuestionIndex: Number, // 当前题目索引
    answers: Array // 答案状态数组
  },
  data() {
    return {
      hidden: true // 答题卡是否隐藏
    };
  },
  methods: {
    toggleVisibility() {
      this.hidden = !this.hidden;
      this.$emit('toggle-blur', !this.hidden);
    }
  }
};
</script>

<style scoped>
.select-quiz {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 1000;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.toggle-button {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

.toggle-button:hover {
  background-color: #0056b3;
}

.quiz-map-container {
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px 20px;
  margin-top: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  max-height: 400px; /* 设置最大高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
  text-align: center;
}

.quiz-section {
  margin-bottom: 20px;
}

.quiz-section h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

.quiz-map {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.quiz-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  color: black;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.quiz-button.correct {
  background-color: #007bff;
}

.quiz-button.incorrect {
  background-color: #f44336;
}

.quiz-button.unanswered {
  background-color: #ffffff;
  border: 1px solid #ccc;
}
</style>