const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/history - 获取所有完成记录（按时间倒序）
router.get('/', (req, res) => {
  try {
    const history = db.query(`
      SELECT
        t.id,
        t.title,
        t.description,
        t.completed_time,
        u.name as user_name,
        u.id as user_id
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'done'
      ORDER BY t.completed_time DESC
    `);

    res.json(history);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    res.status(500).json({ error: '获取历史记录失败' });
  }
});

module.exports = router;
