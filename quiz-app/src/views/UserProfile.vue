<template>
  <div class="user-profile">
    <div class="profile-header">
      <img class="avatar" src="https://img.icons8.com/ios-filled/100/000000/user-male-circle.png" alt="头像" />
      <h2>{{ nickname }}</h2>
      <p>{{ email || '未设置邮箱' }}</p>
      <button @click="isEditingEmail = true" class="edit-button">编辑邮箱</button>
    </div>
    <div class="profile-info">
      <h3>个人信息</h3>
      <ul>
        <li><strong>昵称：</strong>{{ nickname }}</li>
        <li><strong>邮箱：</strong>{{ email || '未设置' }}</li>
        <li><strong>注册时间：</strong>{{ registerDate }}</li>
      </ul>
    </div>
    <div v-if="isEditingEmail" class="email-edit">
      <h3>编辑信息</h3>
      <input v-model="newEmail" placeholder="请输入新邮箱" type="email" />
      <div class="button-group">
        <button @click="updateEmail" class="save-button">保存</button>
        <button @click="isEditingEmail = false" class="cancel-button">取消</button>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
    <BottomNav v-if="isMobile" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'UserProfile',
  components: { BottomNav },
  setup() {
    const isMobile = ref(false)
    const nickname = ref('')
    const email = ref('')
    const registerDate = ref('')
    const isEditingEmail = ref(false)
    const newEmail = ref('')
    const errorMessage = ref('')
    const successMessage = ref('')

    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      return /mobile|android|iphone|ipad|phone/i.test(userAgent)
    }

    function getToken() {
      return localStorage.getItem('token') || ''
    }

    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/user', {
          headers: { Authorization: 'Bearer ' + getToken() }
        })
        if (res.ok) {
          const data = await res.json()
          nickname.value = data.username
          email.value = data.email
          registerDate.value = new Date(data.createdAt).toLocaleDateString()
        } else {
          throw new Error('获取用户信息失败')
        }
      } catch (err) {
        console.error('获取用户信息失败', err)
      }
    }

    async function updateEmail() {
      try {
        errorMessage.value = ''
        successMessage.value = ''
        const res = await fetch('/api/auth/update-email', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: newEmail.value })
        })
        const data = await res.json()
        if (res.ok) {
          email.value = data.email
          successMessage.value = '邮箱更新成功'
          isEditingEmail.value = false
          newEmail.value = ''
        } else {
          errorMessage.value = data.message || '更新邮箱失败'
        }
      } catch (err) {
        errorMessage.value = '更新邮箱失败，请稍后重试'
        console.error('更新邮箱失败', err)
      }
    }

    onMounted(() => {
      isMobile.value = checkIfMobile()
      fetchUser()
    })

    return {
      isMobile,
      nickname,
      email,
      registerDate,
      isEditingEmail,
      newEmail,
      errorMessage,
      successMessage,
      updateEmail
    }
  }
}
</script>

<style scoped>
.user-profile {
  padding: 30px 10px;
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.profile-header {
  margin-bottom: 20px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin-bottom: 10px;
  border: 2px solid #3498db;
}

h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #2c3e50;
}

p {
  color: #888;
  margin: 0 0 10px 0;
}

.edit-button {
  background: #3498db;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-button:hover {
  background: #2980b9;
}

.profile-info {
  text-align: left;
  margin-top: 20px;
}

.profile-info h3 {
  font-size: 18px;
  color: #3498db;
  margin-bottom: 10px;
}

.profile-info ul {
  list-style: none;
  padding: 0;
}

.profile-info li {
  font-size: 16px;
  margin-bottom: 8px;
  color: #34495e;
}

.email-edit {
  text-align: left;
  margin-top: 20px;
}

.email-edit h3 {
  font-size: 18px;
  color: #3498db;
  margin-bottom: 10px;
}

.email-edit input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.save-button, .cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-button {
  background: #2ecc71;
  color: #fff;
}

.save-button:hover {
  background: #27ae60;
}

.cancel-button {
  background: #e74c3c;
  color: #fff;
}

.cancel-button:hover {
  background: #c0392b;
}

.error {
  color: #e74c3c;
  margin-top: 10px;
}

.success {
  color: #2ecc71;
  margin-top: 10px;
}
</style>