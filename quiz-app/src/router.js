import { createRouter, createWebHistory } from 'vue-router'; // 导入 Vue 3 路由模块
import HomePage from './views/HomePage.vue'; 
import Quiz from './components/Quiz.vue'; 
import FilesPage from './views/FilesPage.vue';
import Counter from './views/CalculatorPage.vue';
import LoginPage from './components/auth/LoginPage.vue';
import UserProfile from './views/UserProfile.vue';
import ChatPool from './views/ChatPool.vue';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: Quiz,
    meta: { requiresAuth: true }
  },
  {
    path: '/files',
    name: 'Files',
    component: FilesPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/counter',
    name: 'Counter',
    component: Counter,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'ChatPool',
    component: ChatPool,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;