# Mystic Tarot - 神秘塔罗占卜系统

高级神秘塔罗占卜网站，具有AI风格解牌、用户账号系统、排行榜、成就系统和WebGL魔法特效。

## 功能特性

- 🎴 **22张大阿卡纳** 完整塔罗牌数据
- 🤖 **AI风格解牌** 深邃、温柔、哲学意味的长篇解读
- 👤 **用户账号系统** 注册/登录/个人资料
- 📊 **运势排行榜** 每日/每周/总榜
- 🏆 **成就系统** 18个成就可解锁
- ✨ **WebGL魔法特效** 能量波纹/魔法阵Shader/发光粒子/星云动画
- 🎵 **音效系统** Web Audio API合成音效
- 📱 **响应式设计** PC/平板/手机全适配

## 技术栈

**前端：**
- HTML5 / CSS3 / JavaScript ES6
- WebGL (原生Shader编程)
- Canvas 2D粒子系统

**后端：**
- Node.js + Express
- MySQL
- JWT认证
- bcrypt密码加密

## 安装步骤

### 1. 安装MySQL

确保已安装MySQL并运行。

### 2. 初始化数据库

```bash
cd server
mysql -u root -p < sql/init.sql
```

### 3. 配置环境变量

```bash
cd server
copy .env.example .env
```

编辑 `.env` 文件，设置数据库密码和JWT密钥：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=mystic_tarot
JWT_SECRET=你的随机密钥
JWT_EXPIRES_IN=7d
PORT=3000
```

### 4. 安装依赖

```bash
cd server
npm install
```

### 5. 启动服务器

```bash
npm start
# 或开发模式
npm run dev
```

### 6. 访问网站

打开浏览器访问：`http://localhost:3000`

## 项目结构

```
tarot/
├── index.html              # 主页面
├── css/
│   ├── style.css           # 主样式
│   ├── animation.css       # 动画效果
│   └── responsive.css      # 响应式设计
├── js/
│   ├── main.js             # 入口文件
│   ├── tarot.js            # 塔罗牌数据
│   ├── aiReader.js         # AI风格解牌引擎
│   ├── api.js              # 后端API客户端
│   ├── particles.js        # Canvas粒子系统
│   ├── audio.js            # 音效系统
│   ├── ui.js               # UI交互管理
│   └── webgl/
│       └── magicEffects.js # WebGL魔法特效
├── server/
│   ├── server.js           # Express服务器
│   ├── db.js               # MySQL连接
│   ├── package.json        # 依赖配置
│   ├── .env.example        # 环境变量模板
│   ├── sql/
│   │   └── init.sql        # 数据库初始化
│   └── routes/
│       ├── auth.js         # 认证路由
│       ├── history.js      # 历史记录路由
│       ├── ranking.js      # 排行榜路由
│       └── achievements.js # 成就路由
└── assets/                 # 资源目录
```

## API接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/profile` - 获取资料
- `PUT /api/auth/profile` - 更新资料
- `POST /api/auth/add-exp` - 添加经验

### 历史记录
- `POST /api/history` - 保存占卜记录
- `GET /api/history` - 获取历史记录
- `GET /api/history/:id` - 获取单条记录
- `PUT /api/history/:id/mood` - 更新心情评分
- `GET /api/history/stats` - 获取统计

### 排行榜
- `GET /api/ranking/daily` - 每日排行
- `GET /api/ranking/my-rank` - 我的排名
- `GET /api/ranking/weekly` - 每周排行
- `GET /api/ranking/alltime` - 总榜

### 成就
- `GET /api/achievements` - 获取成就列表
- `POST /api/achievements/check` - 检查成就
- `GET /api/achievements/stats` - 获取成就统计

## 成就列表

| 成就 | 描述 | 经验 |
|------|------|------|
| 初次占卜 | 完成第一次占卜 | 100 |
| 塔罗学徒 | 完成10次占卜 | 200 |
| 塔罗使者 | 完成50次占卜 | 500 |
| 塔罗大师 | 完成100次占卜 | 1000 |
| 三日修行 | 连续3天占卜 | 150 |
| 七日冥想 | 连续7天占卜 | 300 |
| 月度修行者 | 连续30天占卜 | 1000 |
| 命运之选 | 抽到命运之轮 | 200 |
| 死神降临 | 抽到死神牌 | 200 |
| 塔之觉醒 | 抽到塔牌 | 200 |
| 世界圆满 | 抽到世界牌 | 300 |
| 大阿卡纳收集者 | 抽到所有牌 | 2000 |
| 逆位洞察者 | 累计5次逆位 | 200 |
| 三牌阵大师 | 10次三牌阵 | 300 |
| 时间旅行者 | 10次时间牌阵 | 300 |
| 星辰使者 | 达到10级 | 500 |
| 运势之王 | 排行榜第一 | 500 |
| 心灵导师 | 50次评分 | 300 |

## 快捷键

- `1` - 首页
- `2` - 开始占卜
- `3` - 牌库图鉴
- `4` - 排行榜
- `5` - 成就
- `6` - 历史记录
- `M` - 静音切换

## 许可证

MIT License
