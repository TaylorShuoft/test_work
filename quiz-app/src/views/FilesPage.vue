<template>
    <div class="files-page">
      <h1>文件柜</h1>
      <!-- 左上角返回按钮 -->
      <button class="back-button" @click="goHome">返回首页</button>
      <div class="file-cabinet">
        <!-- 检查是否有文件，如果没有则显示"当前没有新文件" -->
        <div v-if="files.length === 0" class="no-files-message">
          <p>当前没有新文件</p>
        </div>
        <div v-else v-for="file in files" :key="file.name" class="file-card">
          <div class="file-icon">
            <!-- 图标 -->
            <img src="https://img.icons8.com/ios/50/000000/file.png" alt="file-icon" />
          </div>
          <div class="file-info">
            <!-- 文件名 -->
            <p class="file-name">{{ file.name }}</p>
            <!-- 下载按钮 -->
            <a :href="file.url" target="_blank" download class="download-button">下载</a>
          </div>
        </div>
      </div>
    </div>
    <BottomNav v-if="isMobile" />
</template>

<script>
import { ref, onMounted } from 'vue'
import BottomNav from '@/components/BottomNav.vue'
export default {
  name: "FilesPage",
  components: { BottomNav },
  setup() {
    const isMobile = ref(false)
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      return /mobile|android|iphone|ipad|phone/i.test(userAgent)
    }
    onMounted(() => {
      isMobile.value = checkIfMobile()
    })
    return {
      isMobile,
      files: []
    }
  },
  methods: {
    goHome() {
      this.$router.push("/"); // 返回首页
    },
  }
};
</script>

<style scoped>
.files-page {
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5; /* 浅灰背景像书架背景 */
  min-height: 100vh;
  position: relative; /* 添加相对定位 */
}

.files-page h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.file-cabinet {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 每行两列 */
  gap: 15px; /* 卡片间隔 */
  justify-items: center;
  padding: 10px;
}

.file-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 140px;
  height: 180px; /* 卡片高度像书架 */
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.file-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
}

.file-icon img {
  width: 50px;
  height: 50px;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  text-align: center;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #f39c12;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #e67e22;
}

.download-button {
  text-decoration: none;
  color: #fff;
  background-color: #f39c12;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
}

.download-button:hover {
  background-color: #e67e22;
}

/* 新添加的样式用于"当前没有新文件"消息 */
.no-files-message {
  margin-top: 50px;
  font-size: 18px;
  color: #666;
}
</style>
