<template>
  <el-header class="app-header">
    <div class="header-content">
      <div class="logo" @click="router.push('/')">
        <span class="logo-icon">🌸</span>
        <span class="logo-text">任务管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        :router="true"
        class="nav-menu"
      >
        <el-menu-item index="/">
          <span class="menu-icon">📝</span>
          我的任务
        </el-menu-item>
        <el-menu-item index="/members">
          <span class="menu-icon">👥</span>
          成员任务
        </el-menu-item>
        <el-menu-item index="/rewards">
          <span class="menu-icon">🎁</span>
          积分兑换
        </el-menu-item>
      </el-menu>
      <div class="user-info">
        <span class="user-avatar">{{ userIcon }}</span>
        <span class="user-name">{{ userStore.userName }}</span>
        <el-button class="logout-btn" @click="handleLogout">退出</el-button>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const userIcons = {
  1: '🌸',
  2: '😎',
  3: '🦍',
  4: '☀️'
}

const userIcon = computed(() => {
  return userIcons[userStore.userId] || '🐰'
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(90deg, #f8bbd0 0%, #e1bee7 50%, #c5cae9 100%);
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.2);
  padding: 0;
  height: 60px !important;
  border-bottom: 3px solid #f48fb1;
}

.header-content {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-right: 40px;
  white-space: nowrap;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #ad1457;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  background: transparent;
  display: flex;
  align-items: center;
}

.nav-menu :deep(.el-menu-item) {
  color: #880e4f;
  font-weight: 600;
  border-bottom: none !important;
  border-radius: 20px;
  margin: 0 4px;
  padding: 0 16px;
  height: 40px;
  line-height: 40px;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.5);
  color: #ad1457;
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.7);
  color: #ad1457;
}

.menu-icon {
  margin-right: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.user-avatar {
  font-size: 24px;
}

.user-name {
  color: #880e4f;
  font-weight: 600;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid #f48fb1;
  color: #c2185b;
  border-radius: 20px;
  font-weight: 600;
}

.logout-btn:hover {
  background: #f48fb1;
  color: white;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    padding: 10px;
  }

  .logo {
    margin-right: 20px;
  }

  .nav-menu {
    order: 3;
    width: 100%;
  }

  .user-info {
    margin-left: auto;
  }
}
</style>
