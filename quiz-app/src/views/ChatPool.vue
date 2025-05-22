<template>
    <div class="chat-pool">
      <h1 class="chat-title">聊天池👍</h1>
      <div class="chat-container">
        <div class="chat-list">
          <div v-for="(msg, idx) in messages" :key="msg._id || idx" class="chat-msg" :class="{'user-msg': msg.nickname === userNickname, 'other-user-msg': msg.nickname !== userNickname}">
            <span class="user">{{ msg.nickname }}：</span>
            <span class="text">{{ msg.text }}</span>
          </div>
        </div>
      </div>
      <div class="chat-input-bar">
        <input v-model="input" class="chat-input" placeholder="说点什么..." @keyup.enter="sendMsg" />
        <button class="send-btn" @click="sendMsg" :disabled="loading">发送</button>
      </div>
      <BottomNav v-if="isMobile" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BottomNav from '@/components/BottomNav.vue'
export default {
    name: 'ChatPool',
    components: { BottomNav },
    setup() {
        const isMobile = ref(false)
        const checkIfMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            return /mobile|android|iphone|ipad|phone/i.test(userAgent)
        }
        onMounted(() => {
            isMobile.value = checkIfMobile()
            fetchMessages()
        })
        const messages = ref([])
        const input = ref('')
        const loading = ref(false)
        const userNickname = localStorage.getItem('nickname') || '未知用户' // 假设用户昵称存储在本地存储中
        function getToken() {
            return localStorage.getItem('token') || ''
        }
        async function fetchMessages() {
            try {
                const res = await fetch('/api/messages', {
                    headers: { Authorization: 'Bearer ' + getToken() }
                })
                if (res.ok) {
                    messages.value = await res.json()
                }
            } catch (err) {
                console.error('获取消息失败', err)
            }
        }
        async function sendMsg() {
            if (!input.value.trim()) return
            loading.value = true
            try {
                const res = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + getToken()
                    },
                    body: JSON.stringify({ text: input.value })
                })
                if (res.ok) {
                    input.value = ''
                    await fetchMessages()
                }
            } finally {
                loading.value = false
            }
        }
        setInterval(fetchMessages, 5000)
        return { isMobile, messages, input, sendMsg, loading, userNickname }
    }
}
</script>

<style scoped>
.chat-pool {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    min-height: 100vh;
    background: #f7f8fa;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: relative; /* 添加相对定位以便子元素绝对定位 */
}

.chat-title {
    text-align: center;
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
}

.chat-container {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    margin: 10px 0;
    overflow: hidden;
    position: relative; /* 添加相对定位以便子元素绝对定位 */
}

.chat-list {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    margin-bottom: 0;
}

.chat-msg {
    margin-bottom: 10px;
    font-size: 15px;
    color: #333;
    display: flex;
    align-items: baseline;
}

.user-msg {
    justify-content: flex-end;
}

.user-msg .text {
    background-color: #2196F3;
    color: white;
    padding: 8px 12px;
    border-radius: 16px 0 16px 16px;
}

.other-user-msg .text {
    background-color: #eee;
    color: #333;
    padding: 8px 12px;
    border-radius: 0 16px 16px 16px;
}

.user {
    color: #2196F3;
    font-weight: bold;
    margin-right: 5px;
}

.chat-input-bar {
    display: flex;
    padding: 10px;
    background: #fff;
    border-top: 1px solid #eee;
    position: absolute; /* 使用绝对定位 */
    left: 0;
    bottom: 80px; /* 调整底部位置，避免被底部导航栏挡住 */
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
    z-index: 100;
}

.chat-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 15px;
    outline: none;
    margin-right: 8px;
}

.send-btn {
    background: #2196F3;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 8px 18px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s;
}

.send-btn:hover {
    background: #1769aa;
}

.send-btn:disabled {
    background: #888;
}
</style>
