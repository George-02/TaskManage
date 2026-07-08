# 任务管理系统

一个面向少量固定成员使用的轻量级 Web 任务管理系统。系统支持选择身份登录、个人任务管理、成员任务查看、每日打卡、积分统计、积分流水和奖励兑换。

## 功能概览

- 选择预置用户身份登录，无需注册
- 创建、完成、删除自己的任务
- 查看自己的进行中任务和已完成任务
- 查看其他成员的任务状态
- 每日打卡，并在日历中展示打卡记录
- 根据完成任务和每日打卡获得积分
- 查看积分组成与积分流水
- 使用积分兑换奖励
- 查看自己的兑换物品，并标记物品已使用
- 支持开发环境前后端分离运行，生产环境由后端托管前端静态文件

## 技术栈

前端：

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Element Plus

后端：

- Node.js
- Express
- sql.js

数据存储：

- SQLite 文件数据库
- 默认数据库文件：`data/task.db`

## 项目结构

```text
TaskManage/
├─ client/                 # 前端项目
│  ├─ src/
│  │  ├─ api/              # Axios API 封装
│  │  ├─ components/       # 公共组件
│  │  ├─ router/           # 前端路由
│  │  ├─ stores/           # Pinia 状态
│  │  └─ views/            # 页面
│  ├─ public/
│  └─ vite.config.js
├─ server/                 # 后端项目
│  ├─ middleware/          # 中间件
│  ├─ routes/              # API 路由
│  ├─ db.js                # 数据库初始化与查询封装
│  └─ index.js             # Express 入口
├─ data/                   # SQLite 数据文件目录
├─ package.json            # 根项目脚本
└─ README.md
```

## 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本

## 安装依赖

在项目根目录执行：

```bash
npm run install:all
```

如果在 Windows PowerShell 中遇到 `npm.ps1` 执行策略限制，可以改用：

```powershell
npm.cmd run install:all
```

## 开发环境运行

同时启动前端和后端：

```bash
npm run dev
```

Windows PowerShell 推荐使用：

```powershell
npm.cmd run dev
```

默认访问地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000`

Vite 已配置 `/api` 代理到后端服务。

## 生产环境运行

先构建前端：

```bash
npm run build
```

再启动生产服务：

```bash
npm start
```

Windows PowerShell 推荐使用：

```powershell
npm.cmd start
```

生产模式下，Express 会托管 `client/dist` 静态文件，并继续提供 `/api` 接口。

## 预置用户

系统启动时会自动初始化预置用户：

| ID | 名称 |
| --- | --- |
| 1 | 芝小姐 |
| 2 | 徐生 |
| 3 | 大猩猩 |
| 4 | 小太阳 |

登录方式为选择身份登录。前端会将当前用户信息保存到 `localStorage`，请求 API 时通过 `X-User-Id` 请求头传递用户身份。

## 积分规则

- 完成一个任务：+5 积分
- 每日打卡一次：+5 积分
- 兑换奖励：扣除对应奖励所需积分

积分余额 = 完成任务积分 + 打卡积分 - 已兑换消耗积分。

## 数据库说明

后端启动时会自动初始化数据库和基础数据。

主要数据表：

- `users`：用户
- `tasks`：任务
- `check_ins`：每日打卡
- `rewards`：可兑换奖励
- `redemptions`：兑换记录和物品使用状态

数据库文件默认保存到：

```text
data/task.db
```

## 前端页面

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/login` | 登录页 | 选择预置用户身份 |
| `/` | 我的任务 | 管理个人任务、打卡、查看积分和积分流水 |
| `/members` | 成员任务 | 只读查看成员任务 |
| `/rewards` | 积分兑换 | 兑换奖励、查看和使用我的物品 |

## API 概览

### 用户

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/users` | 获取用户列表 |

### 任务

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/tasks/:userId` | 获取指定用户任务 |
| POST | `/api/tasks` | 创建当前用户任务 |
| PUT | `/api/tasks/:id/complete` | 完成当前用户任务 |
| DELETE | `/api/tasks/:id` | 删除当前用户未完成任务 |

### 历史

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/history` | 获取所有已完成任务记录 |

### 打卡

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/checkins` | 当前用户每日打卡 |
| GET | `/api/checkins/:userId` | 获取指定用户打卡日期列表 |
| GET | `/api/checkins/:userId/today` | 检查指定用户今日是否已打卡 |

### 积分

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/points/:userId` | 获取指定用户积分统计 |
| GET | `/api/points/flow/:userId` | 获取指定用户积分流水 |

### 奖励

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/rewards` | 获取奖励列表 |
| POST | `/api/rewards/redeem` | 当前用户兑换奖励 |
| GET | `/api/rewards/my-items/:userId` | 获取指定用户兑换物品 |
| PUT | `/api/rewards/use/:id` | 当前用户使用兑换物品 |

## 身份校验

需要身份校验的接口会读取请求头：

```text
X-User-Id: 用户ID
```

后端会验证用户是否存在，并限制用户只能创建、完成、删除自己的任务，以及只能使用自己的兑换物品。

## 常见问题

### PowerShell 提示禁止运行 npm.ps1

如果看到类似错误：

```text
无法加载文件 npm.ps1，因为在此系统上禁止运行脚本
```

可以使用 `npm.cmd` 代替 `npm`：

```powershell
npm.cmd run dev
npm.cmd start
```

### 端口被占用

后端默认端口是 `3000`，前端默认端口是 `5173`。如果端口被占用，可以先结束占用进程，或临时指定后端端口：

```powershell
$env:PORT=3010
npm.cmd start
```

### 前端接口请求失败

请确认后端已经启动，并且开发环境下 Vite 代理仍指向：

```text
http://localhost:3000
```

配置位置：`client/vite.config.js`

## 可用脚本

根目录脚本：

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 同时启动前端和后端开发服务 |
| `npm run server` | 启动后端开发服务 |
| `npm run client` | 启动前端开发服务 |
| `npm run build` | 构建前端产物 |
| `npm start` | 生产模式启动后端并托管前端产物 |
| `npm run install:all` | 安装根目录、后端、前端依赖 |

