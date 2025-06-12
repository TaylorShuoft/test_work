<template>
    <div class="files-page">
      <h1 class="page-title">文件柜</h1>
      
      <!-- 文件列表 -->
      <div class="files-list">
        <div class="file-grid">
          <div v-for="file in files" :key="file.name" class="file-card">
            <div class="file-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span>{{ file.size }}</span>
              </div>
            </div>
            <div class="file-actions">
              <a :href="file.url" target="_blank" download class="download-btn">
                下载
              </a>
            </div>
          </div>
        </div>
      </div>
      <BottomNav v-if="isMobile" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'FilesPage',
  components: { BottomNav },
  setup() {
    const isMobile = ref(false)
    const files = ref([
      {
        name: '组成原理速成.docx',
        size: '23KB',
        url: '/files/组成原理速成.docx'
      }
    ])

    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      return /mobile|android|iphone|ipad|phone/i.test(userAgent)
    }

    onMounted(() => {
      isMobile.value = checkIfMobile()
    })

    return {
      files,
      isMobile
    }
  }
}
</script>

<style scoped>
.files-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f4f5f7;
}

.page-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.files-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.file-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}

.file-card:hover {
  transform: translateY(-2px);
}

.file-icon {
  font-size: 24px;
  color: #3b82f6;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 10px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.download-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
  text-decoration: none;
  display: inline-block;
}

.download-btn:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .files-page {
    padding: 15px;
  }

  .file-grid {
    grid-template-columns: 1fr;
  }
}
</style>
