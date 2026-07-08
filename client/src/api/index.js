import axios from 'axios'
import { useUserStore } from '../stores/user'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器：添加用户ID到请求头
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.userId) {
      config.headers['X-User-Id'] = userStore.userId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 用户相关API
export const userApi = {
  getUsers() {
    return api.get('/users')
  }
}

// 任务相关API
export const taskApi = {
  getTasks(userId) {
    return api.get(`/tasks/${userId}`)
  },
  createTask(data) {
    return api.post('/tasks', data)
  },
  completeTask(id) {
    return api.put(`/tasks/${id}/complete`)
  },
  deleteTask(id) {
    return api.delete(`/tasks/${id}`)
  }
}

// 打卡相关API
export const checkinApi = {
  checkin() {
    return api.post('/checkins')
  },
  getCheckins(userId) {
    return api.get(`/checkins/${userId}`)
  },
  checkToday(userId) {
    return api.get(`/checkins/${userId}/today`)
  }
}

// 积分相关API
export const pointsApi = {
  getPoints(userId) {
    return api.get(`/points/${userId}`)
  },
  getFlow(userId) {
    return api.get(`/points/flow/${userId}`)
  }
}

// 奖励相关API
export const rewardsApi = {
  getRewards() {
    return api.get('/rewards')
  },
  redeem(rewardId) {
    return api.post('/rewards/redeem', { rewardId })
  },
  getMyItems(userId) {
    return api.get(`/rewards/my-items/${userId}`)
  },
  useItem(id) {
    return api.put(`/rewards/use/${id}`)
  }
}

export default api
