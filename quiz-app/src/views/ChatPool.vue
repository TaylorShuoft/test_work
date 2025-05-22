<template>
    <div class="chat-pool">
      <h1 class="chat-title">聊天池👍</h1>
      <div class="chat-container">
        <button class="more-messages-btn" @click="toggleMoreMessages">{{ showAll ? '收起消息' : '更多消息' }}</button>
        <div class="chat-list" ref="chatList" @scroll="handleScroll">
          <div v-for="(msg, idx) in displayedMessages" :key="msg._id || idx" class="chat-msg" :class="{'user-msg': msg.nickname === userNickname, 'other-user-msg': msg.nickname !== userNickname}">
            <span class="user">{{ msg.nickname }}：</span>
            <span class="text">{{ msg.text }}</span>
          </div>
        </div>
      </div>
      <div class="chat-input-bar" :style="{ bottom: isMobile ? '60px' : '0' }">
        <input v-model="input" class="chat-input" placeholder="说点什么..." @keyup.enter="sendMsg" />
        <button class="send-btn" @click="sendMsg" :disabled="loading">发送</button>
      </div>
      <BottomNav v-if="isMobile" />
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import BottomNav from '@/components/BottomNav.vue'

export default {
    name: 'ChatPool',
    components: { BottomNav },
    setup() {
        const isMobile = ref(false)
        const messages = ref([])
        const input = ref('')
        const loading = ref(false)
        const userNickname = localStorage.getItem('nickname') || '未知用户'
        const displayedCount = ref(8)
        const showAll = ref(false)

        const checkIfMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            return /mobile|android|iphone|ipad|phone/i.test(userAgent)
        }

        onMounted(() => {
            isMobile.value = checkIfMobile()
            fetchMessages()
        })

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
                    if (!showAll.value && displayedCount.value < messages.value.length) {
                        displayedCount.value = Math.min(displayedCount.value, messages.value.length)
                    } else if (showAll.value) {
                        displayedCount.value = messages.value.length
                    }
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
                    if (!showAll.value && displayedCount.value < messages.value.length) {
                        displayedCount.value = Math.min(8, messages.value.length)
                    }
                }
            } finally {
                loading.value = false
            }
        }

        const displayedMessages = computed(() => {
            return messages.value.slice(-displayedCount.value)
        })

        const handleScroll = ({ target }) => {
            if (target.scrollTop === 0 && displayedCount.value < messages.value.length && !showAll.value) {
                displayedCount.value = Math.min(displayedCount.value + 12, messages.value.length)
            }
        }

        const toggleMoreMessages = () => {
            showAll.value = !showAll.value
            displayedCount.value = showAll.value ? messages.value.length : 8
        }

        setInterval(fetchMessages, 5000)

        return { isMobile, messages, input, sendMsg, loading, userNickname, displayedMessages, handleScroll, toggleMoreMessages, showAll }
    }
}
</script>

<style scoped>
.chat-pool {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    height: 88vh;
    background: #f4f5f7;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
}

.chat-title {
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
    letter-spacing: 0.5px;
}

.chat-container {
    flex: 1;
    height: calc(50% - 60px);
    border: none;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 10px 0;
    overflow: hidden;
    position: relative; /* Add relative positioning for absolute button */
}

.chat-list {
    height: calc(100% - 40px); /* Adjust height to account for button */
    padding: 15px;
    padding-top: 45px; /* Add padding to avoid overlap with button */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: #ccc #f4f5f7;
}

.chat-list::-webkit-scrollbar {
    width: 6px;
}

.chat-list::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.chat-msg {
    display: flex;
    align-items: flex-start;
    max-width: 80%;
}

.user-msg {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.user {
    font-size: 13px;
    font-weight: 500;
    color: #555;
    margin: 8px 8px 0 8px;
    line-height: 1.5;
}

.text {
    padding: 10px 14px;
    font-size: 15px;
    line-height: 1.4;
    border-radius: 12px;
    position: relative;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-msg .text {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #fff;
    border-bottom-right-radius: 4px;
}

.other-user-msg .text {
    background: #e5e7eb;
    color: #1a1a1a;
    border-bottom-left-radius: 4px;
}

.chat-input-bar {
    display: flex;
    padding: 12px;
    background: #ffffff;
    border-top: 1px solid #e5e5e5;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
    z-index: 100;
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}

.chat-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    margin-right: 10px;
    transition: border-color 0.2s;
}

.chat-input:focus {
    border-color: #3b82f6;
}

.send-btn {
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.send-btn:hover {
    background: #1d4ed8;
}

.send-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}

.more-messages-btn {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    z-index: 10;
}

.more-messages-btn:hover {
    background: #1d4ed8;
}
</style>