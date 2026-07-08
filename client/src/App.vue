<template>
  <div class="app-container">
    <AppHeader v-if="userStore.isLoggedIn" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from './stores/user'
import AppHeader from './components/AppHeader.vue'

const userStore = useUserStore()
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%);
  min-height: 100vh;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
}
</style>
