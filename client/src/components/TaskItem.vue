<template>
  <el-card class="task-item" shadow="hover">
    <div class="task-content">
      <div class="task-main">
        <div class="task-title-row">
          <span class="task-bullet">{{ task.status === 'done' ? '🎀' : '🌟' }}</span>
          <h3 class="task-title">{{ task.title }}</h3>
        </div>
        <p v-if="task.description" class="task-desc">{{ task.description }}</p>
        <div class="task-meta">
          <span>🕐</span>
          <span>{{ formatTime(task.created_time) }}</span>
        </div>
      </div>
      <div class="task-actions">
        <el-button
          v-if="task.status === 'doing' && showActions"
          class="complete-btn"
          @click="$emit('complete', task.id)"
        >
          ✨ 完成
        </el-button>
        <el-button
          v-if="task.status === 'doing' && showActions"
          class="delete-btn"
          @click="$emit('delete', task.id)"
        >
          🗑️ 删除
        </el-button>
        <div v-if="task.status === 'done'" class="done-badge">
          <span>🎉 已完成</span>
        </div>
      </div>
    </div>
    <div v-if="task.status === 'done' && task.completed_time" class="task-completed">
      <span>✨ 完成时间: {{ formatTime(task.completed_time) }}</span>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['complete', 'delete'])

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.task-item {
  margin-bottom: 12px;
  border-radius: 16px;
  border: 2px solid #f8bbd0;
  background: linear-gradient(135deg, #fff5f7 0%, #fff0f6 100%);
  transition: all 0.3s ease;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.15);
  border-color: #f48fb1;
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.task-main {
  flex: 1;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.task-bullet {
  font-size: 18px;
}

.task-title {
  font-size: 16px;
  color: #880e4f;
  font-weight: 600;
}

.task-desc {
  font-size: 14px;
  color: #ad1457;
  margin-bottom: 8px;
  padding-left: 26px;
  opacity: 0.8;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f48fb1;
  padding-left: 26px;
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.complete-btn {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  border: none;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3);
}

.complete-btn:hover {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  transform: scale(1.05);
}

.delete-btn {
  background: linear-gradient(135deg, #ef9a9a 0%, #e57373 100%);
  border: none;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(244, 67, 54, 0.2);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #e57373 0%, #ef5350 100%);
  transform: scale(1.05);
}

.done-badge {
  background: linear-gradient(135deg, #a5d6a7 0%, #81c784 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3);
}

.task-completed {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px dashed #f8bbd0;
  font-size: 13px;
  color: #81c784;
  font-weight: 600;
}

@media (max-width: 768px) {
  .task-content {
    flex-direction: column;
  }

  .task-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
