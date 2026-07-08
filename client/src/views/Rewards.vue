<template>
  <div class="rewards-page">
    <div class="page-header">
      <h2>🎁 积分兑换</h2>
      <div class="my-points">
        <span class="points-icon">🏆</span>
        <span class="points-text">我的积分: <strong>{{ currentPoints }}</strong></span>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 奖励列表 -->
      <div class="rewards-section">
        <h3 class="section-title">🛍️ 可兑换奖励</h3>
        <div class="rewards-grid">
          <div
            v-for="reward in rewards"
            :key="reward.id"
            class="reward-card"
            :class="{ 'can-afford': currentPoints >= reward.points_cost }"
          >
            <div class="reward-icon">{{ reward.icon }}</div>
            <div class="reward-info">
              <h4 class="reward-name">{{ reward.name }}</h4>
              <p class="reward-desc">{{ reward.description }}</p>
              <div class="reward-cost">
                <span class="cost-points">{{ reward.points_cost }} 积分</span>
              </div>
            </div>
            <el-button
              class="redeem-btn"
              :disabled="currentPoints < reward.points_cost"
              @click="handleRedeem(reward)"
            >
              {{ currentPoints >= reward.points_cost ? '🎉 兑换' : '积分不足' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 我的物品 -->
      <div class="items-section">
        <h3 class="section-title">🎒 我的物品</h3>
        <el-tabs v-model="itemsTab" class="items-tabs">
          <el-tab-pane label="未使用" name="unused">
            <div class="items-list">
              <div v-if="unusedItems.length === 0" class="empty-items">
                <span>暂无未使用的物品</span>
              </div>
              <div v-else class="item-card" v-for="item in unusedItems" :key="item.id">
                <div class="item-left">
                  <span class="item-icon">{{ item.reward_icon }}</span>
                  <div class="item-info">
                    <span class="item-name">{{ item.reward_name }}</span>
                    <span class="item-time">{{ formatTime(item.created_time) }}</span>
                  </div>
                </div>
                <el-button class="use-btn" size="small" @click="handleUse(item)">
                  🎯 使用
                </el-button>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="已使用" name="used">
            <div class="items-list">
              <div v-if="usedItems.length === 0" class="empty-items">
                <span>暂无已使用的物品</span>
              </div>
              <div v-else class="item-card used" v-for="item in usedItems" :key="item.id">
                <div class="item-left">
                  <span class="item-icon">{{ item.reward_icon }}</span>
                  <div class="item-info">
                    <span class="item-name">{{ item.reward_name }}</span>
                    <span class="item-time">使用于: {{ formatTime(item.used_time) }}</span>
                  </div>
                </div>
                <span class="used-badge">✅ 已使用</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { pointsApi, rewardsApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const currentPoints = ref(0)
const rewards = ref([])
const myItems = ref([])
const itemsTab = ref('unused')

const unusedItems = computed(() => myItems.value.filter(item => !item.is_used))
const usedItems = computed(() => myItems.value.filter(item => item.is_used))

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

async function loadPoints() {
  try {
    const pointsData = await pointsApi.getPoints(userStore.userId)
    currentPoints.value = pointsData.totalPoints
  } catch (error) {
    console.error('获取积分失败:', error)
  }
}

async function loadRewards() {
  try {
    rewards.value = await rewardsApi.getRewards()
  } catch (error) {
    console.error('获取奖励列表失败:', error)
  }
}

async function loadMyItems() {
  try {
    myItems.value = await rewardsApi.getMyItems(userStore.userId)
  } catch (error) {
    console.error('获取物品列表失败:', error)
  }
}

async function handleRedeem(reward) {
  try {
    await ElMessageBox.confirm(
      `确定要用 ${reward.points_cost} 积分兑换 ${reward.icon} ${reward.name} 吗？`,
      '🎁 确认兑换',
      {
        confirmButtonText: '确定兑换',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const result = await rewardsApi.redeem(reward.id)
    ElMessage.success(`🎉 ${result.message}！剩余积分: ${result.remainingPoints}`)

    // 刷新数据
    loadPoints()
    loadMyItems()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '兑换失败')
    }
  }
}

async function handleUse(item) {
  try {
    await ElMessageBox.confirm(
      `确定要使用 ${item.reward_icon} ${item.reward_name} 吗？`,
      '🎯 确认使用',
      {
        confirmButtonText: '确定使用',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    await rewardsApi.useItem(item.id)
    ElMessage.success('🎉 物品已使用！')

    // 刷新数据
    loadMyItems()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '使用失败')
    }
  }
}

onMounted(() => {
  loadPoints()
  loadRewards()
  loadMyItems()
})
</script>

<style scoped>
.rewards-page {
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.page-header h2 {
  color: #ad1457;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.my-points {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.points-icon {
  font-size: 20px;
}

.points-text {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.points-text strong {
  font-size: 18px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.rewards-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  color: #ad1457;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.rewards-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-right: 4px;
}

.rewards-grid::-webkit-scrollbar {
  width: 6px;
}

.rewards-grid::-webkit-scrollbar-track {
  background: #fce4ec;
  border-radius: 3px;
}

.rewards-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #f48fb1 0%, #ce93d8 100%);
  border-radius: 3px;
}

.reward-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 16px;
  border: 2px solid #f8bbd0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.reward-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.15);
}

.reward-card.can-afford {
  border-color: #81c784;
  background: rgba(255, 255, 255, 0.9);
}

.reward-icon {
  font-size: 40px;
}

.reward-info {
  text-align: center;
  width: 100%;
}

.reward-name {
  color: #880e4f;
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
}

.reward-desc {
  color: #ad1457;
  margin: 0 0 8px 0;
  font-size: 12px;
  opacity: 0.8;
}

.reward-cost {
  display: flex;
  justify-content: center;
}

.cost-points {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.redeem-btn {
  width: 100%;
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  border: none;
  color: white;
  border-radius: 16px;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3);
}

.redeem-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  transform: scale(1.02);
}

.redeem-btn:disabled {
  background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%);
  color: #9e9e9e;
}

/* 我的物品区域 */
.items-section {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 12px;
  border: 2px solid #f8bbd0;
}

.items-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.items-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.items-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.items-tabs :deep(.el-tabs__item) {
  color: #e91e63;
  font-weight: 600;
  font-size: 13px;
}

.items-tabs :deep(.el-tabs__item.is-active) {
  color: #ad1457;
}

.items-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #f48fb1 0%, #ce93d8 100%);
  border-radius: 10px;
  height: 2px;
}

.items-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.items-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.items-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.items-list::-webkit-scrollbar {
  width: 6px;
}

.items-list::-webkit-scrollbar-track {
  background: #fce4ec;
  border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #f48fb1 0%, #ce93d8 100%);
  border-radius: 3px;
}

.empty-items {
  text-align: center;
  padding: 40px 20px;
  color: #e91e63;
  font-weight: 600;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid #f8bbd0;
  transition: all 0.3s ease;
}

.item-card:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);
}

.item-card.used {
  opacity: 0.7;
  background: rgba(245, 245, 245, 0.8);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  font-size: 28px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 14px;
  color: #880e4f;
  font-weight: 600;
}

.item-time {
  font-size: 11px;
  color: #f48fb1;
}

.use-btn {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  border: none;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.use-btn:hover {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
}

.used-badge {
  font-size: 12px;
  color: #81c784;
  font-weight: 600;
  background: rgba(129, 199, 132, 0.2);
  padding: 4px 10px;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .items-section {
    width: 100%;
  }

  .rewards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
