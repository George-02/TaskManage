const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/history', require('./routes/history'));
app.use('/api/checkins', require('./routes/checkins'));
app.use('/api/points', require('./routes/points'));
app.use('/api/rewards', require('./routes/rewards'));

// 生产环境下提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 初始化数据库并启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});
