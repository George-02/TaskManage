const db = require('../db');

// 用户身份验证中间件
function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: '缺少用户身份信息' });
  }

  // 验证用户是否存在
  const user = db.get('SELECT id, name FROM users WHERE id = ?', [userId]);

  if (!user) {
    return res.status(401).json({ error: '用户不存在' });
  }

  // 将用户信息添加到请求对象
  req.user = user;
  next();
}

module.exports = authMiddleware;
