<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <div class="header-icon">🌸</div>
          <h2>任务管理系统</h2>
          <p>选择身份开始使用吧~</p>
        </div>
      </template>
      <div class="user-list">
        <el-button
          v-for="user in users"
          :key="user.id"
          class="user-btn"
          size="large"
          @click="handleLogin(user)"
        >
          <span class="user-icon">{{ getUserIcon(user.id) }}</span>
          <span>{{ user.name }}</span>
        </el-button>
      </div>
      <div v-if="loading" class="loading">
        <div class="loading-spinner">🌟</div>
        <span>加载中...</span>
      </div>
    </el-card>
    <div class="decoration">
      <span class="float-icon icon1">✨</span>
      <span class="float-icon icon2">💕</span>
      <span class="float-icon icon3">🌟</span>
      <span class="float-icon icon4">🎀</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { userApi } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const users = ref([])
const loading = ref(true)

const userIcons = ['🌸', '😎', '🦍', '☀️']

function getUserIcon(userId) {
  return userIcons[(userId - 1) % userIcons.length]
}

onMounted(async () => {
  try {
    users.value = await userApi.getUsers()
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
})

function handleLogin(user) {
  userStore.login(user.id, user.name)
  ElMessage.success(`欢迎回来，${user.name}！🎉`)
  router.push('/')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  position: relative;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  border: 3px solid #f8bbd0;
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f6 50%, #fce4ec 100%);
  box-shadow: 0 15px 40px rgba(233, 30, 99, 0.2);
  overflow: visible;
}

.login-card :deep(.el-card__header) {
  background: linear-gradient(90deg, #f8bbd0 0%, #e1bee7 50%, #c5cae9 100%);
  border-radius: 21px 21px 0 0;
  padding: 24px 20px;
  border-bottom: none;
}

.card-header {
  text-align: center;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.card-header h2 {
  margin-bottom: 8px;
  color: #ad1457;
  font-size: 24px;
  font-weight: 700;
}

.card-header p {
  color: #880e4f;
  font-size: 14px;
  font-weight: 600;
}

.user-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 20px;
}

.user-btn {
  width: 100%;
  height: 60px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  border: 2px solid #f8bbd0;
  background: linear-gradient(135deg, #ffffff 0%, #fce4ec 100%);
  color: #880e4f;
  font-weight: 600;
  transition: all 0.3s ease;
  margin: 0;
  padding: 0;
}

.user-btn:hover {
  background: linear-gradient(135deg, #f8bbd0 0%, #e1bee7 100%);
  border-color: #f48fb1;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
}

.user-icon {
  font-size: 28px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 30px;
  color: #e91e63;
}

.loading-spinner {
  font-size: 36px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.float-icon {
  position: absolute;
  font-size: 32px;
  animation: float 6s ease-in-out infinite;
  opacity: 0.6;
}

.icon1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.icon2 {
  top: 20%;
  right: 15%;
  animation-delay: 1.5s;
}

.icon3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 3s;
}

.icon4 {
  bottom: 10%;
  right: 10%;
  animation-delay: 4.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(10deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(20px) rotate(-10deg);
  }
}
</style>
