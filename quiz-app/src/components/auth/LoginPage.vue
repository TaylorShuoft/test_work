<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            class="submit-btn" 
            @click="handleSubmit"
            :loading="loading"
          >
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="switch-mode">
        <el-link type="primary" @click="toggleMode">
          {{ isLogin ? '没有账号？立即注册' : '已有账号？立即登录' }}
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'LoginPage',
  components: {
    User,
    Lock
  },
  setup() {
    const router = useRouter()
    const formRef = ref(null)
    const isLogin = ref(true)
    const loading = ref(false)

    const form = reactive({
      username: '',
      password: ''
    })

    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, message: '用户名长度不能小于3个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
      ]
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        loading.value = true
        
        const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register'
        const response = await axios.post(endpoint, form)
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
          ElMessage.success(isLogin.value ? '登录成功' : '注册成功')
          router.push('/')
        }
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '操作失败，请重试')
      } finally {
        loading.value = false
      }
    }

    const toggleMode = () => {
      isLogin.value = !isLogin.value
      form.username = ''
      form.password = ''
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    }

    return {
      formRef,
      form,
      rules,
      isLogin,
      loading,
      handleSubmit,
      toggleMode
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
}
</style> 