const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// 获取北京时间工具函数
function getBeijingTime() {
  const now = new Date();
  const offset = 8 * 60; // 北京时间 UTC+8
  const localOffset = now.getTimezoneOffset(); // 本地时区偏移（分钟）
  const diff = offset + localOffset; // 计算差值
  return new Date(now.getTime() + diff * 60 * 1000);
}

function getBeijingDate() {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBeijingDateTime() {
  const beijingTime = getBeijingTime();
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  const hours = String(beijingTime.getHours()).padStart(2, '0');
  const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
  const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 确保 data 目录存在
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'task.db');

let db;

// 保存数据库到文件
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// 检查表是否有某列
function tableHasColumn(tableName, columnName) {
  try {
    const result = db.exec(`PRAGMA table_info(${tableName})`);
    if (result.length > 0) {
      const columns = result[0].values.map(row => row[1]); // 第二个元素是列名
      return columns.includes(columnName);
    }
  } catch (e) {
    // 表不存在
  }
  return false;
}

// 安全添加列
function addColumnIfNotExists(tableName, columnName, columnDef) {
  if (!tableHasColumn(tableName, columnName)) {
    try {
      db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
      console.log(`添加列 ${tableName}.${columnName}`);
    } catch (e) {
      console.log(`列 ${tableName}.${columnName} 已存在或添加失败`);
    }
  }
}

// 初始化数据库
async function initDatabase() {
  const SQL = await initSqlJs();

  // 如果数据库文件存在则加载，否则创建新数据库
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // 创建 users 表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 tasks 表
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'doing' CHECK(status IN ('doing', 'done')),
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_time DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 创建 check_ins 打卡表
  db.run(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      check_date DATE NOT NULL,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, check_date)
    )
  `);

  // 创建 rewards 奖励表
  db.run(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      points_cost INTEGER NOT NULL,
      description TEXT,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 redemptions 兑换记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reward_id INTEGER NOT NULL,
      points_cost INTEGER NOT NULL,
      is_used INTEGER DEFAULT 0,
      used_time DATETIME,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (reward_id) REFERENCES rewards(id)
    )
  `);

  // 表结构迁移：添加缺失的列
  addColumnIfNotExists('redemptions', 'is_used', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('redemptions', 'used_time', 'DATETIME');

  // 插入预置奖励（如果不存在）
  const rewardCountResult = db.exec('SELECT COUNT(*) as count FROM rewards');
  const rewardCount = rewardCountResult[0]?.values[0][0] || 0;
  if (rewardCount === 0) {
    const rewards = [
      ['牛奶', '🥛', 30, '新鲜牛奶一瓶'],
      ['小薯片', '🍟', 20, '香脆小薯片一包'],
      ['炸鸡', '🍗', 50, '美味炸鸡一块'],
      ['可乐', '🥤', 15, '冰镇可乐一杯'],
      ['冰淇淋', '🍦', 25, '香甜冰淇淋一个'],
      ['巧克力', '🍫', 35, '丝滑巧克力一块'],
      ['蛋糕', '🍰', 60, '精美蛋糕一份'],
      ['奶茶', '🧋', 40, '香浓奶茶一杯']
    ];

    const insertReward = db.prepare('INSERT INTO rewards (name, icon, points_cost, description) VALUES (?, ?, ?, ?)');
    for (const [name, icon, points, desc] of rewards) {
      insertReward.run([name, icon, points, desc]);
    }
    insertReward.free();
  }

  // 插入预置用户（如果不存在）
  const users = [
    [1, '芝小姐'],
    [2, '徐生'],
    [3, '大猩猩'],
    [4, '小太阳']
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)');
  for (const [id, name] of users) {
    stmt.run([id, name]);
  }
  stmt.free();

  saveDatabase();
  console.log('数据库初始化完成');
  return db;
}

// 辅助查询方法
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  return {
    lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] || 0,
    changes: db.getRowsModified()
  };
}

function get(sql, params = []) {
  const results = query(sql, params);
  return results[0] || null;
}

module.exports = {
  initDatabase,
  query,
  run,
  get,
  getBeijingTime,
  getBeijingDate,
  getBeijingDateTime
};
