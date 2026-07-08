<template>
  <div class="my-tasks">
    <div class="content-wrapper">
      <!-- 左侧任务区域 -->
      <div class="tasks-section">
        <div class="page-header">
          <h2>🌸 我的任务</h2>
          <el-button class="create-btn" @click="showCreateDialog = true" size="small">
            <span>✨</span> 新建任务
          </el-button>
        </div>

        <el-tabs v-model="activeTab" class="task-tabs">
          <el-tab-pane label="🌟 进行中" name="doing">
            <div class="task-list">
              <div v-if="doingTasks.length === 0" class="empty-state">
                <div class="empty-icon">🎯</div>
                <p>暂无进行中的任务</p>
                <p class="empty-hint">点击右上角创建新任务吧~</p>
              </div>
              <TaskItem
                v-for="task in doingTasks"
                :key="task.id"
                :task="task"
                :show-actions="true"
                @complete="handleComplete"
                @delete="handleDelete"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="🎀 已完成" name="done">
            <div class="task-list">
              <div v-if="doneTasks.length === 0" class="empty-state">
                <div class="empty-icon">🌈</div>
                <p>暂无已完成的任务</p>
                <p class="empty-hint">完成任务后会在这里显示哦~</p>
              </div>
              <TaskItem
                v-for="task in doneTasks"
                :key="task.id"
                :task="task"
                :show-actions="false"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧区域 -->
      <div class="right-section">
        <!-- 积分窗口 -->
        <div class="points-section">
          <div class="points-header">
            <h3>🏆 我的积分</h3>
            <el-button class="points-detail-btn" size="small" @click="showPointsDialog = true">
              📊 积分流水
            </el-button>
          </div>
          <div class="points-display">
            <div class="points-total">
              <span class="points-number">{{ points.totalPoints }}</span>
              <span class="points-label">总积分</span>
            </div>
            <div class="points-detail">
              <div class="point-item">
                <span class="point-icon">✅</span>
                <span class="point-text">任务 +{{ points.taskPoints }}</span>
              </div>
              <div class="point-item">
                <span class="point-icon">📅</span>
                <span class="point-text">打卡 +{{ points.checkinPoints }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 打卡区域 -->
        <div class="checkin-section">
          <div class="checkin-header">
            <h3>📅 每日打卡</h3>
            <el-button
              class="checkin-btn"
              :disabled="todayChecked"
              @click="handleCheckin"
              :loading="checking"
              size="small"
            >
              {{ todayChecked ? '💖 已打卡' : '🎯 打卡' }}
            </el-button>
          </div>
          <div class="calendar-wrapper">
            <div class="calendar-header-custom">
              <button class="month-btn" @click="changeMonth(-1)">◀</button>
              <span class="current-month">{{ currentMonthLabel }}</span>
              <button class="month-btn" @click="changeMonth(1)">▶</button>
            </div>
            <el-calendar v-model="currentDate" ref="calendarRef">
              <template #date-cell="{ data }">
                <div
                  class="calendar-day"
                  :class="{
                    'checked-day': isCheckedDate(data.day),
                    'is-today': isToday(data.day),
                    'is-current-month': isCurrentMonth(data.day),
                    'is-other-month': !isCurrentMonth(data.day)
                  }"
                >
                  <span class="day-number">{{ data.day.split('-')[2] }}</span>
                  <span v-if="isCheckedDate(data.day)" class="check-mark">✨</span>
                </div>
              </template>
            </el-calendar>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建任务弹窗 -->
    <el-dialog
      v-model="showCreateDialog"
      title="✨ 创建新任务"
      width="500px"
      :close-on-click-modal="false"
      class="create-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="📝 任务标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="输入任务标题~"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="📄 任务描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="输入任务描述（可选）~"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button class="cancel-btn" @click="showCreateDialog = false">取消</el-button>
        <el-button class="submit-btn" @click="handleCreate" :loading="creating">
          🎉 创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 积分流水弹窗 -->
    <el-dialog
      v-model="showPointsDialog"
      title="📊 积分流水"
      width="450px"
      class="points-dialog"
    >
      <div class="points-flow-list">
        <div v-if="pointsFlow.length === 0" class="empty-points">
          <span>暂无积分记录</span>
        </div>
        <div v-else class="flow-item" v-for="(item, index) in pointsFlow" :key="index" :class="{ 'spend': item.type === 'spend' }">
          <div class="flow-left">
            <span class="flow-icon">{{ item.icon }}</span>
            <div class="flow-info">
              <span class="flow-title">{{ item.title }}</span>
              <span class="flow-time">{{ item.time }}</span>
            </div>
          </div>
          <span class="flow-points" :class="{ 'earn': item.type === 'earn', 'spend-text': item.type === 'spend' }">
            {{ item.pointsText }}
          </span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { taskApi, checkinApi, pointsApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import TaskItem from '../components/TaskItem.vue'

const userStore = useUserStore()
const tasks = ref([])
const activeTab = ref('doing')
const showCreateDialog = ref(false)
const showPointsDialog = ref(false)
const creating = ref(false)
const checking = ref(false)
const formRef = ref(null)
const calendarRef = ref(null)
const currentDate = ref(new Date())
const checkedDates = ref([])
const todayChecked = ref(false)
const points = ref({
  totalPoints: 0,
  taskPoints: 0,
  checkinPoints: 0,
  taskCount: 0,
  checkinCount: 0
})
const pointsFlow = ref([])

// 当前月份标签
const currentMonthLabel = computed(() => {
  const date = currentDate.value
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
})

// 切换月份
function changeMonth(delta) {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() + delta)
  currentDate.value = date
}

// 检查日期是否是当前月
function isCurrentMonth(dateStr) {
  const date = new Date(dateStr)
  const current = currentDate.value
  return date.getFullYear() === current.getFullYear() && date.getMonth() === current.getMonth()
}

const form = reactive({
  title: '',
  description: ''
})

const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ]
}

const doingTasks = computed(() => tasks.value.filter(t => t.status === 'doing'))
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

// 检查日期是否已打卡
function isCheckedDate(dateStr) {
  return checkedDates.value.includes(dateStr)
}

// 检查是否是今天
function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

// 加载积分
async function loadPoints() {
  try {
    points.value = await pointsApi.getPoints(userStore.userId)
  } catch (error) {
    console.error('获取积分失败:', error)
  }
}

// 加载积分流水
async function loadPointsFlow() {
  try {
    const flow = await pointsApi.getFlow(userStore.userId)
    pointsFlow.value = flow.map(item => ({
      ...item,
      time: formatTime(item.time),
      pointsText: item.points > 0 ? `+${item.points}` : `${item.points}`
    }))
  } catch (error) {
    console.error('获取积分流水失败:', error)
  }
}

// 格式化时间
function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载打卡记录
async function loadCheckins() {
  try {
    checkedDates.value = await checkinApi.getCheckins(userStore.userId)
    const today = new Date().toISOString().split('T')[0]
    todayChecked.value = checkedDates.value.includes(today)
  } catch (error) {
    console.error('获取打卡记录失败:', error)
  }
}

// 打卡
async function handleCheckin() {
  checking.value = true
  try {
    await checkinApi.checkin()
    ElMessage.success('🎉 打卡成功！+5积分')
    todayChecked.value = true
    const today = new Date().toISOString().split('T')[0]
    checkedDates.value.push(today)
    loadPoints() // 刷新积分
  } catch (error) {
    ElMessage.error(error.message || '打卡失败')
  } finally {
    checking.value = false
  }
}

async function loadTasks() {
  try {
    tasks.value = await taskApi.getTasks(userStore.userId)
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  }
}

async function handleCreate() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    creating.value = true
    try {
      await taskApi.createTask({
        title: form.title,
        description: form.description || null
      })
      ElMessage.success('🎉 任务创建成功')
      showCreateDialog.value = false
      form.title = ''
      form.description = ''
      loadTasks()
    } catch (error) {
      ElMessage.error(error.message || '创建失败')
    } finally {
      creating.value = false
    }
  })
}

async function handleComplete(id) {
  try {
    await ElMessageBox.confirm('确定要完成这个任务吗？', '✨ 确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await taskApi.completeTask(id)
    ElMessage.success('🎉 任务已完成！+5积分')
    loadTasks()
    loadPoints() // 刷新积分
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '🗑️ 警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await taskApi.deleteTask(id)
    ElMessage.success('✨ 任务已删除')
    loadTasks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

onMounted(() => {
  loadTasks()
  loadCheckins()
  loadPoints()
  loadPointsFlow()
})
</script>

<style scoped>
.my-tasks {
  width: 100%;
  height: calc(100vh - 110px);
}

.content-wrapper {
  display: flex;
  gap: 20px;
  height: 100%;
}

.tasks-section {
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f6 50%, #fce4ec 100%);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.15);
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #f8bbd0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.page-header h2 {
  color: #ad1457;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.create-btn {
  background: linear-gradient(135deg, #f48fb1 0%, #ce93d8 100%);
  border: none;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
}

.create-btn:hover {
  background: linear-gradient(135deg, #ec407a 0%, #ab47bc 100%);
  transform: scale(1.05);
}

.task-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding-bottom: 12px;
  border-bottom: 2px dashed #f8bbd0;
}

.task-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.task-tabs :deep(.el-tabs__item) {
  color: #e91e63;
  font-weight: 600;
}

.task-tabs :deep(.el-tabs__item.is-active) {
  color: #ad1457;
}

.task-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #f48fb1 0%, #ce93d8 100%);
  border-radius: 10px;
  height: 3px;
}

.task-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding-top: 12px;
}

.task-tabs :deep(.el-tab-pane) {
  height: 100%;
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

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #e91e63;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  font-weight: 600;
}

.empty-hint {
  font-size: 13px;
  color: #f48fb1;
  opacity: 0.8;
}

/* 右侧区域 */
.right-section {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 积分窗口 */
.points-section {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffe0b2 100%);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.2);
  border: 2px solid #ffcc80;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.points-header h3 {
  color: #e65100;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.points-detail-btn {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border: none;
  color: white;
  border-radius: 16px;
  font-weight: 600;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.points-detail-btn:hover {
  background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
  transform: scale(1.05);
}

.points-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.points-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border-radius: 16px;
  padding: 12px 20px;
  min-width: 100px;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
}

.points-number {
  font-size: 32px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.points-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
  font-weight: 600;
}

.points-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #e65100;
  font-weight: 600;
}

.point-icon {
  font-size: 16px;
}

/* 打卡区域 */
.checkin-section {
  background: linear-gradient(135deg, #fff5f7 0%, #f3e5f5 50%, #e8eaf6 100%);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 25px rgba(156, 39, 176, 0.15);
  overflow: hidden;
  border: 2px solid #e1bee7;
  display: flex;
  flex-direction: column;
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.checkin-header h3 {
  color: #7b1fa2;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.checkin-btn {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  border: none;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.checkin-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  transform: scale(1.05);
}

.checkin-btn:disabled {
  background: linear-gradient(135deg, #a5d6a7 0%, #81c784 100%);
  opacity: 0.8;
}

/* 日历样式 */
.calendar-wrapper {
  height: 340px;
  overflow: hidden;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
}

.calendar-header-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 2px dashed #e1bee7;
  margin-bottom: 8px;
}

.month-btn {
  background: linear-gradient(135deg, #f8bbd0 0%, #e1bee7 100%);
  border: none;
  color: #7b1fa2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.month-btn:hover {
  background: linear-gradient(135deg, #f48fb1 0%, #ce93d8 100%);
  transform: scale(1.1);
}

.current-month {
  color: #7b1fa2;
  font-weight: 700;
  font-size: 15px;
  min-width: 100px;
  text-align: center;
}

.calendar-wrapper :deep(.el-calendar) {
  background: transparent;
  border: none;
  flex: 1;
  overflow: hidden;
}

.calendar-wrapper :deep(.el-calendar__header) {
  display: none;
}

.calendar-wrapper :deep(.el-calendar-table) {
  font-size: 13px;
  height: 100%;
}

.calendar-wrapper :deep(.el-calendar-table tbody) {
  height: 100%;
}

.calendar-wrapper :deep(.el-calendar-table tr) {
  height: calc(100% / 6);
}

.calendar-wrapper :deep(.el-calendar-table thead th) {
  color: #9c27b0;
  font-weight: 600;
  padding: 4px 0;
}

.calendar-wrapper :deep(.el-calendar-table td) {
  border: none;
  padding: 2px;
}

.calendar-wrapper :deep(.el-calendar-day) {
  padding: 0 !important;
  height: auto !important;
}

/* 移除选中时的黑框和悬浮效果 */
.calendar-wrapper :deep(.el-calendar-table td .el-calendar-day:focus) {
  outline: none;
}

.calendar-wrapper :deep(.el-calendar-table td:focus) {
  outline: none;
}

.calendar-wrapper :deep(.el-calendar-table td.is-selected) {
  background: transparent;
}

.calendar-wrapper :deep(.el-calendar-table td:hover) {
  background: transparent !important;
}

.calendar-wrapper :deep(.el-calendar-table td .el-calendar-day:hover) {
  background: transparent !important;
  color: inherit !important;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 2px auto;
  border-radius: 50%;
  position: relative;
  cursor: default;
}

.day-number {
  font-size: 13px;
  font-weight: 600;
  color: #616161;
}

/* 当月日子 */
.is-current-month .day-number {
  color: #616161;
}

/* 其他月日子 */
.is-other-month .day-number {
  color: #d1c4e9;
  font-weight: 400;
}

/* 今天的样式 */
.is-today {
  background: rgba(233, 30, 99, 0.1);
}

.is-today .day-number {
  color: #e91e63;
  font-weight: 700;
}

/* 打卡日样式 */
.checked-day {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
  animation: bounceIn 0.5s ease;
}

.checked-day .day-number {
  color: white;
}

.check-mark {
  font-size: 10px;
  position: absolute;
  bottom: 2px;
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 创建任务弹窗样式 */
.create-dialog :deep(.el-dialog) {
  border-radius: 20px;
  border: 3px solid #f8bbd0;
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f6 100%);
}

.create-dialog :deep(.el-dialog__header) {
  background: linear-gradient(90deg, #f8bbd0 0%, #e1bee7 100%);
  border-radius: 17px 17px 0 0;
  padding: 16px 20px;
}

.create-dialog :deep(.el-dialog__title) {
  color: #ad1457;
  font-weight: 700;
}

.create-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
}

.cancel-btn {
  border-radius: 20px;
  border: 2px solid #f48fb1;
  color: #e91e63;
  font-weight: 600;
}

.cancel-btn:hover {
  background: #fce4ec;
}

.submit-btn {
  background: linear-gradient(135deg, #f48fb1 0%, #ce93d8 100%);
  border: none;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #ec407a 0%, #ab47bc 100%);
}

/* 积分流水弹窗样式 */
.points-dialog :deep(.el-dialog) {
  border-radius: 20px;
  border: 3px solid #ffcc80;
  background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%);
}

.points-dialog :deep(.el-dialog__header) {
  background: linear-gradient(90deg, #ffe0b2 0%, #ffcc80 100%);
  border-radius: 17px 17px 0 0;
  padding: 16px 20px;
}

.points-dialog :deep(.el-dialog__title) {
  color: #e65100;
  font-weight: 700;
}

.points-flow-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.points-flow-list::-webkit-scrollbar {
  width: 6px;
}

.points-flow-list::-webkit-scrollbar-track {
  background: #fff3e0;
  border-radius: 3px;
}

.points-flow-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ffcc80 0%, #ffb74d 100%);
  border-radius: 3px;
}

.empty-points {
  text-align: center;
  padding: 40px;
  color: #e65100;
  font-weight: 600;
}

.flow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid #ffe0b2;
}

.flow-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.flow-icon {
  font-size: 20px;
}

.flow-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flow-title {
  font-size: 14px;
  color: #5d4037;
  font-weight: 600;
}

.flow-time {
  font-size: 12px;
  color: #a1887f;
}

.flow-points {
  font-size: 16px;
  font-weight: 700;
}

.flow-points.earn {
  color: #4caf50;
}

.flow-points.spend-text {
  color: #e91e63;
}

.flow-item.spend {
  background: rgba(255, 235, 238, 0.6);
  border: 1px solid #ffcdd2;
}

/* 响应式布局：手机端上下排列 */
@media (max-width: 768px) {
  .my-tasks {
    height: auto;
  }

  .content-wrapper {
    flex-direction: column;
    height: auto;
  }

  .tasks-section {
    height: 50vh;
  }

  .right-section {
    width: 100%;
  }

  .calendar-wrapper {
    height: 300px;
  }

  .calendar-day {
    width: 32px;
    height: 32px;
  }
}
</style>
