const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users - 获取所有用户列表
router.get('/', (req, res) => {
  try {
    const users = db.query('SELECT id, name FROM users ORDER BY id');
    res.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

module.exports = router;
