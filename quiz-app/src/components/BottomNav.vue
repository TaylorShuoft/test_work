<template>
  <div class="bottom-nav">
    <div class="nav-item" :class="{ active: current === 'quiz' }" @click="goTo('quiz')" aria-label="Go to Quiz">
      <svg width="36" height="36" viewBox="0 0 48 48" fill="currentColor">
        <circle cx="24" cy="24" r="20" />
        <circle cx="19" cy="21" r="2" class="inner" />
        <circle cx="29" cy="21" r="2" class="inner" />
        <rect x="16" y="28" width="16" height="3" rx="1.5" class="inner" />
      </svg>
      <span>复习</span>
    </div>
    <div class="nav-item" :class="{ active: current === 'files' }" @click="goTo('files')" aria-label="Go to Chat">
      <svg width="36" height="36" viewBox="0 0 48 48" fill="currentColor">
        <circle cx="24" cy="24" r="20" />
        <rect x="16" y="18" width="16" height="12" rx="4" class="inner" />
        <rect x="20" y="26" width="8" height="2" rx="1" class="inner" />
      </svg>
      <span>聊天池</span>
    </div>
    <div class="nav-item" :class="{ active: current === 'profile' }" @click="goTo('profile')" aria-label="Go to Profile">
      <svg width="36" height="36" viewBox="0 0 48 48" fill="currentColor">
        <circle cx="24" cy="24" r="20" />
        <path d="M24 18a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c-5.33 0-10 2.67-10 6v2h20v-2c0-3.33-4.67-6-10-6z" class="inner" />
      </svg>
      <span>个人主页</span>
    </div>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'BottomNav',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const pathMap = {
      quiz: '/quiz',
      files: '/chat',
      profile: '/profile',
    };

    let current = 'quiz';
    if (route.path.startsWith('/quiz')) current = 'quiz';
    else if (route.path.startsWith('/chat')) current = 'files';
    else if (route.path.startsWith('/profile')) current = 'profile';

    function goTo(key) {
      router.push(pathMap[key]);
    }

    return { goTo, current };
  },
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100vw;
  height: 70px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 9999;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #888; /* 未选中状态：灰色 */
  font-size: 15px;
  cursor: pointer;
  flex: 1;
  user-select: none;
  transition: color 0.2s;
}

.nav-item svg {
  margin-bottom: 2px;
  transition: fill 0.2s;
}

.nav-item span {
  margin-top: 2px;
}

.nav-item.active {
  color: #42A5F5; /* 选中状态：浅蓝色 */
}

.nav-item.active svg {
  fill: #42A5F5; /* 选中状态：SVG 背景为浅蓝色 */
}

.nav-item.active svg .inner {
  fill: #fff; /* 选中状态：内部元素为白色，确保对比度 */
}

.nav-item:not(.active) svg {
  fill: #888; /* 未选中状态：SVG 背景为灰色 */
}

.nav-item:not(.active) svg .inner {
  fill: #fff; /* 未选中状态：内部元素为白色，确保对比度 */
}

/* 悬停效果 */
.nav-item:hover {
  color: #666;
}

.nav-item:hover svg {
  fill: #666;
}

/* 响应式设计 */
@media (max-width: 400px) {
  .nav-item {
    font-size: 12px;
  }
  .nav-item svg {
    width: 28px;
    height: 28px;
  }
}
</style>