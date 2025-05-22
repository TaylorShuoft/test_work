<template>
  <div class="quiz">
    <!-- 左上角返回按钮 -->
    <button class="back-button" @click="goHome">返回首页</button>

    <div class="blurred-content" :class="{ blurred: isBlurred }">
      <!-- 当前题目 -->
      <h1>{{ subject }}答题页</h1>

      <div v-if="currentQuestion">
        <h2>{{ questionType }}题 ({{ currentQuestion.id }})</h2>
        <p>{{ currentQuestion.text }}</p>

        <!-- 答案选项及左右导航按钮 -->
        <div class="options-container">
          <!-- 左侧导航按钮 -->
          <button class="nav-button left" @click="previousQuestion">←</button>

          <!-- 答案选项 -->
          <div class="options">
            <template v-if="questionType !== '填空'">
              <button
                v-for="(option, index) in currentOptions"
                :key="index"
                class="option-button"
                :class="{
                  correct: selectedAnswer === option && isCorrect,
                  incorrect: selectedAnswer === option && !isCorrect
                }"
                @click="selectAnswer(option)"
              >
                {{ option }}
              </button>
            </template>
            <template v-else>
              <input
                v-model="userInput"
                type="text"
                class="fill-in-input"
                placeholder="请输入答案"
              />
              <button class="submit-button" @click="submitFillInAnswer">提交</button>
            </template>
          </div>

          <!-- 右侧导航按钮 -->
          <button class="nav-button right" @click="nextQuestion">→</button>
        </div>

        <!-- 显示正确答案 -->
        <p v-if="showCorrectAnswer" class="correct-answer">
          正确答案是：{{ currentQuestion.answer }}
        </p>
        <p v-if="showAnswerRight" class="correct-right">
          对了！回答正确！：{{ currentQuestion.answer }}
        </p>
      </div>

      <!-- 没有更多题目时 -->
      <div v-else>
        <h2>恭喜你，已经完成所有题目！</h2>
        <button class="restart-button" @click="restartQuiz">重新开始</button>
      </div>
    </div>

    <!-- 答题卡组件 -->
    <select-quiz
      :groupedQuestions="groupedQuestions"
      :currentQuestionIndex="currentQuestionIndex"
      :answers="answers"
      @navigate="navigateToQuestion"
      @toggle-blur="toggleBlur"
    />
  </div>
</template>
<script>
// 导入 JSON 数据
import quizData from "@/assets/quiz.json";
// 导入答题卡组件
import SelectQuiz from "@/components/select_quiz.vue";

export default {
  name: "QuizPage",
  components: {
    SelectQuiz,
  },
  data() {
    return {
      subject: "", // 当前科目
      questions: [], // 当前科目的所有题目
      currentQuestionIndex: 0, // 当前题目索引
      selectedAnswer: null, // 用户选择的答案
      userInput: "", // 用户输入的答案（填空题）
      isCorrect: false, // 答案是否正确
      showCorrectAnswer: false, // 是否显示正确答案
      showAnswerRight: false,// 是否显示答案正确
      answers: [], // 答题状态数组：'correct', 'incorrect', 'unanswered'
      isBlurred: false, // 是否虚化页面
      isAnsweringDisabled: false, // 是否禁用作答
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    questionType() {
      if (!this.currentQuestion) return "";

      const type = this.currentQuestion.type;
      if (type === "单选题") {
        return "单选";
      } else if (type === "判断题") {
        return "判断";
      } else if (type === "填空题") {
        return "填空";
      } else {
        return "未知题型";
      }
    },
    currentOptions() {
      if (!this.currentQuestion) return [];
      return this.currentQuestion.options || [];
    },
    groupedQuestions() {
      const groups = {};
      this.questions.forEach((question, index) => {
        const type = question.type || "其他";
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push({ ...question, globalIndex: index }); // 添加全局索引
      });
      return groups;
    },
  },
  created() {
    this.subject = this.$route.query.subject;
    if (quizData[this.subject]) {
      const subjectData = quizData[this.subject];
      this.questions = [
        ...(subjectData["单选题"] || []).map((q) => ({ ...q, type: "单选题" })),
        ...(subjectData["判断题"] || []).map((q) => ({ ...q, type: "判断题" })),
        ...(subjectData["填空题"] || []).map((q) => ({ ...q, type: "填空题" })),
      ];
      this.answers = Array(this.questions.length).fill("unanswered");
    } else {
      this.goHome(); // 如果没有数据则返回首页
    }
  },
  methods: {
    goHome() {
      this.$router.push("/"); // 返回首页
    },
    selectAnswer(option) {
      if (this.isAnsweringDisabled) return; // 如果作答被禁用，则直接返回
      if (this.isBlurred) return;

      this.selectedAnswer = option;
      this.isCorrect = option === this.currentQuestion.answer;
      if (this.isCorrect) {
        this.answers[this.currentQuestionIndex] = "correct";
        this.isAnsweringDisabled = true;
        this.showAnswerRight = true;
        setTimeout(() => {
          this.showAnswerRight = false;
          this.isAnsweringDisabled = false;
          this.nextQuestion();
        }, 500);
      } else {
        this.answers[this.currentQuestionIndex] = "incorrect";
        this.showCorrectAnswer = true;
        this.isAnsweringDisabled = true; // 禁用作答

        setTimeout(() => {
          this.isAnsweringDisabled = false;
          this.nextQuestion();
        }, 2000);
      }
    },
    submitFillInAnswer() {
      if (this.isAnsweringDisabled) return; // 如果作答被禁用，则直接返回
      if (this.isBlurred) return;

      this.selectedAnswer = this.userInput.trim();
      this.isCorrect = this.selectedAnswer === this.currentQuestion.answer;
      if (this.isCorrect) {
        this.answers[this.currentQuestionIndex] = "correct";
        this.isAnsweringDisabled = true;
        this.showAnswerRight = true;
        setTimeout(() => {
         this.showAnswerRight = false;
          this.isAnsweringDisabled = false;
          this.nextQuestion();
        }, 500);
      } else {
        this.answers[this.currentQuestionIndex] = "incorrect";
        this.showCorrectAnswer = true;
        this.isAnsweringDisabled = true; // 禁用作答

        setTimeout(() => {
          this.isAnsweringDisabled = false;
          this.nextQuestion();
        }, 2000);
      }
      this.userInput = ""; // 清空用户输入
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.resetState();
      } else {
        this.showNextAlert();
      }
    },
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.resetState();
      } else {
        this.showPreviousAlert();
      }
    },
    navigateToQuestion(index) {
      this.currentQuestionIndex = index;
      this.resetState();
    },
    resetState() {
      this.selectedAnswer = null;
      this.userInput = ""; // 清空用户输入
      this.isCorrect = false;
      this.showCorrectAnswer = false;
    },
    restartQuiz() {
      this.currentQuestionIndex = 0;
      this.answers = Array(this.questions.length).fill("unanswered");
      this.resetState();
    },
    showPreviousAlert() {
      alert("无法后退");
    },
    showNextAlert() {
      alert("已经是最后一题");
    },
    toggleBlur() {
      this.isBlurred = !this.isBlurred; // 切换虚化状态
    },
  },
};
</script>
<style scoped>
.quiz {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
  position: relative;
}

.blurred-content {
  transition: filter 0.3s ease;
}

.blurred-content.blurred {
  filter: blur(5px); /* 页面虚化效果 */
}

.select-quiz {
  position: fixed;
  z-index: 1000; /* 确保答题卡不被虚化 */
}

.back-button {
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  filter: none;
}
.back-button:hover {
  background-color: #0056b3;
}

.options-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%;
  max-width: 400px; /* 适合 iPhone 12 Pro 的屏幕宽度 */
  margin: 0 auto; /* 水平居中 */
}

.nav-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 18px;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #0056b3;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1; /* 占据剩余空间 */
  margin: 0 20px;
}

.option-button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 12px;
  padding: 15px 20px;
  font-size: 16px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.option-button.correct {
  background-color: #007bff;
  color: white;
}

.option-button.incorrect {
  background-color: #f44336;
  color: white;
}

.fill-in-input {
  width: 90%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 16px;
}

.submit-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #0056b3;
}

.correct-answer {
  margin-top: 20px;
  color: #f44336;
  font-size: 18px;
}
.correct-right{
  margin-top: 20px;
  color: #007bff;
  font-size: 18px;
}
.restart-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.restart-button:hover {
  background-color: #0056b3;
}
</style>