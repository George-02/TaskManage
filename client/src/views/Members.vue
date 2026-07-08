<template>
  <div class="members-page">
    <div class="page-header">
      <h2 class="page-title">👥 成员任务</h2>
      <el-tabs v-model="activeUser" class="member-tabs">
        <el-tab-pane
          v-for="user in users"
          :key="user.id"
          :label="user.name"
          :name="String(user.id)"
        >
          <template #label>
            <span class="tab-label">
              <span class="tab-icon">{{ getUserIcon(user.id) }}</span>
              {{ user.name }}
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="content-area">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">🌟</div>
        <span>加载中...</span>
      </div>

      <div v-else class="task-list">
        <div v-if="getUserTasks(Number(activeUser)).length === 0" class="empty-state">
          <div class="empty-icon">🌙</div>
          <p>该用户暂无任务</p>
        </div>

        <div v-else class="task-sections">
          <div v-if="getDoingTasks(Number(activeUser)).length > 0" class="task-section">
            <h3 class="section-title">🌟 进行中 ({{ getDoingTasks(Number(activeUser)).length }})</h3>
            <TaskItem
              v-for="task in getDoingTasks(Number(activeUser))"
              :key="task.id"
              :task="task"
              :show-actions="false"
            />
          </div>

          <div v-if="getDoneTasks(Number(activeUser)).length > 0" class="task-section">
            <h3 class="section-title">🎀 已完成 ({{ getDoneTasks(Number(activeUser)).length }})</h3>
            <TaskItem
              v-for="task in getDoneTasks(Number(activeUser))"
              :key="task.id"
              :task="task"
              :show-actions="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { userApi, taskApi } from '../api'
import { ElMessage } from 'element-plus'
import TaskItem from '../components/TaskItem.vue'

const users = ref([])
const tasksMap = ref({})
const activeUser = ref('')
const loading = ref(false)

const userIcons = ['🌸', '😎', '🦍', '☀️']

function getUserIcon(userId) {
  return userIcons[(userId - 1) % userIcons.length]
}

function getUserTasks(userId) {
  return tasksMap.value[userId] || []
}

function getDoingTasks(userId) {
  return getUserTasks(userId).filter(t => t.status === 'doing')
}

function getDoneTasks(userId) {
  return getUserTasks(userId).filter(t => t.status === 'done')
}

async function loadUsers() {
  try {
    users.value = await userApi.getUsers()
    if (users.value.length > 0) {
      activeUser.value = String(users.value[0].id)
      await loadUserTasks(users.value[0].id)
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

async function loadUserTasks(userId) {
  loading.value = true
  try {
    const tasks = await taskApi.getTasks(userId)
    tasksMap.value[userId] = tasks
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 监听标签切换
import { watch } from 'vue'
watch(activeUser, (newVal) => {
  if (newVal) {
    loadUserTasks(Number(newVal))
  }
})

onMounted(loadUsers)
</script>

<style scoped>
.members-page {
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f6 50%, #fce4ec 100%);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.15);
  height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #f8bbd0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.page-title {
  color: #ad1457;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
}

.member-tabs {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.member-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  margin-left: auto;
}

.member-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.member-tabs :deep(.el-tabs__item) {
  color: #e91e63;
  font-weight: 600;
  height: 36px;
  line-height: 36px;
}

.member-tabs :deep(.el-tabs__item.is-active) {
  color: #ad1457;
}

.member-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #f48fb1 0%, #ce93d8 100%);
  border-radius: 10px;
  height: 3px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-icon {
  font-size: 16px;
}

.content-area {
  flex: 1;
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #e91e63;
  height: 100%;
}

.loading-spinner {
  font-size: 36px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #e91e63;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-weight: 600;
}

.task-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.task-list::-webkit-scrollbar {
  width: 8px;
}

.task-list::-webkit-scrollbar-track {
  background: #fce4ec;
  border-radius: 4px;
}

.task-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #f48fb1 0%, #ce93d8 100%);
  border-radius: 4px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #ec407a 0%, #ab47bc 100%);
}

.task-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 15px;
  color: #ad1457;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px dashed #f8bbd0;
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f6 50%, #fce4ec 100%);
  z-index: 1;
  font-weight: 700;
}
</style>
