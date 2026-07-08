const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/tasks/:userId - 获取指定用户的任务
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_time DESC',
      [userId]
    );
    res.json(tasks);
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

// POST /api/tasks - 创建任务（需要身份验证）
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: '任务标题不能为空' });
    }

    db.run(
      'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title.trim(), description || null]
    );

    // 获取刚创建的任务
    const task = db.get(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId]
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ error: '创建任务失败' });
  }
});

// PUT /api/tasks/:id/complete - 完成任务（需要身份验证）
router.put('/:id/complete', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查任务是否存在且属于当前用户
    const task = db.get('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (task.user_id !== userId) {
      return res.status(403).json({ error: '只能完成自己的任务' });
    }

    if (task.status === 'done') {
      return res.status(400).json({ error: '任务已完成' });
    }

    // 完成任务
    db.run(
      "UPDATE tasks SET status = 'done', completed_time = datetime('now', 'localtime') WHERE id = ?",
      [id]
    );

    const updatedTask = db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedTask);
  } catch (error) {
    console.error('完成任务失败:', error);
    res.status(500).json({ error: '完成任务失败' });
  }
});

// DELETE /api/tasks/:id - 删除任务（需要身份验证）
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查任务是否存在且属于当前用户
    const task = db.get('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (task.user_id !== userId) {
      return res.status(403).json({ error: '只能删除自己的任务' });
    }

    if (task.status === 'done') {
      return res.status(400).json({ error: '已完成的任务不能删除' });
    }

    // 删除任务
    db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: '任务已删除' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ error: '删除任务失败' });
  }
});

module.exports = router;
