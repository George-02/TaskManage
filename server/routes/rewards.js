const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/rewards - 获取所有奖励列表
router.get('/', (req, res) => {
  try {
    const rewards = db.query('SELECT * FROM rewards ORDER BY points_cost ASC');
    res.json(rewards);
  } catch (error) {
    console.error('获取奖励列表失败:', error);
    res.status(500).json({ error: '获取奖励列表失败' });
  }
});

// POST /api/rewards/redeem - 兑换奖励（需要身份验证）
router.post('/redeem', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardId } = req.body;

    // 获取奖励信息
    const reward = db.get('SELECT * FROM rewards WHERE id = ?', [rewardId]);
    if (!reward) {
      return res.status(404).json({ error: '奖励不存在' });
    }

    // 计算用户获得的积分
    const taskPoints = db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'done'",
      [userId]
    );
    const checkinPoints = db.get(
      'SELECT COUNT(*) as count FROM check_ins WHERE user_id = ?',
      [userId]
    );

    // 计算已兑换消耗的积分
    const redeemedPoints = db.get(
      'SELECT COALESCE(SUM(points_cost), 0) as total FROM redemptions WHERE user_id = ?',
      [userId]
    );

    const totalEarned = (taskPoints.count || 0) * 5 + (checkinPoints.count || 0) * 5;
    const totalSpent = redeemedPoints?.total || 0;
    const currentPoints = totalEarned - totalSpent;

    // 检查积分是否足够
    if (currentPoints < reward.points_cost) {
      return res.status(400).json({ error: '积分不足' });
    }

    // 创建兑换记录
    db.run(
      'INSERT INTO redemptions (user_id, reward_id, points_cost) VALUES (?, ?, ?)',
      [userId, rewardId, reward.points_cost]
    );

    res.status(201).json({
      message: '兑换成功',
      reward: reward.name,
      pointsCost: reward.points_cost,
      remainingPoints: currentPoints - reward.points_cost
    });
  } catch (error) {
    console.error('兑换奖励失败:', error);
    res.status(500).json({ error: '兑换奖励失败' });
  }
});

// GET /api/rewards/my-items/:userId - 获取用户物品列表
router.get('/my-items/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const items = db.query(`
      SELECT
        r.id,
        r.points_cost,
        r.is_used,
        r.used_time,
        r.created_time,
        rw.name as reward_name,
        rw.icon as reward_icon,
        rw.description as reward_description
      FROM redemptions r
      JOIN rewards rw ON r.reward_id = rw.id
      WHERE r.user_id = ?
      ORDER BY r.created_time DESC
    `, [userId]);

    res.json(items);
  } catch (error) {
    console.error('获取物品列表失败:', error);
    res.status(500).json({ error: '获取物品列表失败' });
  }
});

// PUT /api/rewards/use/:id - 使用物品（需要身份验证）
router.put('/use/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查物品是否存在且属于当前用户
    const item = db.get('SELECT * FROM redemptions WHERE id = ? AND user_id = ?', [id, userId]);

    if (!item) {
      return res.status(404).json({ error: '物品不存在' });
    }

    if (item.is_used) {
      return res.status(400).json({ error: '物品已使用' });
    }

    // 标记为已使用
    db.run(
      "UPDATE redemptions SET is_used = 1, used_time = datetime('now', 'localtime') WHERE id = ?",
      [id]
    );

    res.json({ message: '物品已使用' });
  } catch (error) {
    console.error('使用物品失败:', error);
    res.status(500).json({ error: '使用物品失败' });
  }
});

module.exports = router;
