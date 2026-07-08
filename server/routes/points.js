const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/points/:userId - 获取用户积分
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // 计算完成任务获得的积分（每个任务5分）
    const taskPoints = db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'done'",
      [userId]
    );

    // 计算打卡获得的积分（每次打卡5分）
    const checkinPoints = db.get(
      'SELECT COUNT(*) as count FROM check_ins WHERE user_id = ?',
      [userId]
    );

    // 计算已兑换消耗的积分
    const redeemedPoints = db.get(
      'SELECT COALESCE(SUM(points_cost), 0) as total FROM redemptions WHERE user_id = ?',
      [userId]
    );

    const totalTaskPoints = (taskPoints?.count || 0) * 5;
    const totalCheckinPoints = (checkinPoints?.count || 0) * 5;
    const totalEarned = totalTaskPoints + totalCheckinPoints;
    const totalSpent = redeemedPoints?.total || 0;
    const totalPoints = totalEarned - totalSpent;

    res.json({
      totalPoints: Math.max(0, totalPoints),
      totalEarned,
      totalSpent,
      taskPoints: totalTaskPoints,
      checkinPoints: totalCheckinPoints,
      taskCount: taskPoints?.count || 0,
      checkinCount: checkinPoints?.count || 0
    });
  } catch (error) {
    console.error('获取积分失败:', error);
    res.status(500).json({ error: '获取积分失败' });
  }
});

// GET /api/points/flow/:userId - 获取积分流水
router.get('/flow/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const flow = [];

    // 获取完成任务记录（+积分）
    const tasks = db.query(
      "SELECT title, completed_time FROM tasks WHERE user_id = ? AND status = 'done' AND completed_time IS NOT NULL",
      [userId]
    );
    tasks.forEach(task => {
      flow.push({
        type: 'earn',
        icon: '✅',
        title: `完成任务: ${task.title}`,
        points: 5,
        time: task.completed_time,
        timestamp: new Date(task.completed_time).getTime()
      });
    });

    // 获取打卡记录（+积分）
    const checkins = db.query(
      'SELECT check_date FROM check_ins WHERE user_id = ?',
      [userId]
    );
    checkins.forEach(checkin => {
      flow.push({
        type: 'earn',
        icon: '📅',
        title: '每日打卡',
        points: 5,
        time: checkin.check_date,
        timestamp: new Date(checkin.check_date).getTime()
      });
    });

    // 获取兑换记录（-积分）
    const redemptions = db.query(`
      SELECT r.points_cost, r.created_time, rw.name as reward_name, rw.icon as reward_icon
      FROM redemptions r
      JOIN rewards rw ON r.reward_id = rw.id
      WHERE r.user_id = ?
    `, [userId]);
    redemptions.forEach(redemption => {
      flow.push({
        type: 'spend',
        icon: redemption.reward_icon,
        title: `兑换: ${redemption.reward_name}`,
        points: -redemption.points_cost,
        time: redemption.created_time,
        timestamp: new Date(redemption.created_time).getTime()
      });
    });

    // 按时间倒序排序
    flow.sort((a, b) => b.timestamp - a.timestamp);

    res.json(flow);
  } catch (error) {
    console.error('获取积分流水失败:', error);
    res.status(500).json({ error: '获取积分流水失败' });
  }
});

module.exports = router;
