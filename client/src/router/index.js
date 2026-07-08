import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'MyTasks',
    component: () => import('../views/MyTasks.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/Members.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rewards',
    name: 'Rewards',
    component: () => import('../views/Rewards.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
