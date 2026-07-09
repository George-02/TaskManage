const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// 获取北京时间工具函数
function getBeijingDate() {
  const now = new Date();
  const offset = 8 * 60; // 北京时间 UTC+8
  const localOffset = now.getTimezoneOffset();
  const diff = offset + localOffset;
  const beijingTime = new Date(now.getTime() + diff * 60 * 1000);
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBeijingDateTime() {
  const now = new Date();
  const offset = 8 * 60; // 北京时间 UTC+8
  const localOffset = now.getTimezoneOffset();
  const diff = offset + localOffset;
  const beijingTime = new Date(now.getTime() + diff * 60 * 1000);
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  const hours = String(beijingTime.getHours()).padStart(2, '0');
  const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
  const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// POST /api/checkins - 打卡（需要身份验证）
router.post('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const today = getBeijingDate(); // 获取今天的北京时间日期 YYYY-MM-DD

    // 检查今天是否已打卡
    const existing = db.get(
      'SELECT id FROM check_ins WHERE user_id = ? AND check_date = ?',
      [userId, today]
    );

    if (existing) {
      return res.status(400).json({ error: '今天已经打过卡了' });
    }

    // 打卡
    const now = getBeijingDateTime();
    db.run(
      'INSERT INTO check_ins (user_id, check_date, created_time) VALUES (?, ?, ?)',
      [userId, today, now]
    );

    res.status(201).json({ message: '打卡成功', date: today });
  } catch (error) {
    console.error('打卡失败:', error);
    res.status(500).json({ error: '打卡失败' });
  }
});

// GET /api/checkins/:userId - 获取用户打卡记录
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // 获取该用户所有打卡记录
    const checkins = db.query(
      'SELECT check_date FROM check_ins WHERE user_id = ? ORDER BY check_date DESC',
      [userId]
    );

    res.json(checkins.map(c => c.check_date));
  } catch (error) {
    console.error('获取打卡记录失败:', error);
    res.status(500).json({ error: '获取打卡记录失败' });
  }
});

// GET /api/checkins/:userId/today - 检查今天是否已打卡
router.get('/:userId/today', (req, res) => {
  try {
    const { userId } = req.params;
    const today = getBeijingDate(); // 获取今天的北京时间日期

    const existing = db.get(
      'SELECT id FROM check_ins WHERE user_id = ? AND check_date = ?',
      [userId, today]
    );

    res.json({ checked: !!existing });
  } catch (error) {
    console.error('检查打卡状态失败:', error);
    res.status(500).json({ error: '检查打卡状态失败' });
  }
});

module.exports = router;
