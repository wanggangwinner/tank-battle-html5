# 坦克大战 (Tank Battle HTML5)

一个基于 HTML5 Canvas 的经典坦克大战游戏，可直接在浏览器中游玩。

## 🎮 在线试玩

开启 GitHub Pages 后，可通过以下链接访问：

**https://YOUR_USERNAME.github.io/tank-battle-html5/**

> 将 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

## 📦 项目结构

```
tank-battle-html5/
├── index.html        # 游戏主页面
├── css/style.css     # 页面样式
├── js/
│   ├── game.js       # 游戏主循环与状态管理
│   ├── tank.js       # 玩家坦克
│   ├── enemy.js      # 敌方坦克 AI
│   ├── bullet.js     # 子弹与碰撞
│   ├── map.js        # 地图与关卡
│   ├── input.js      # 键盘输入
│   └── utils.js      # 工具函数、音效、粒子
└── README.md         # 项目说明
```

## 🕹️ 操作方式

| 按键 | 功能 |
|------|------|
| `W` / `↑` | 向上移动 |
| `S` / `↓` | 向下移动 |
| `A` / `←` | 向左移动 |
| `D` / `→` | 向右移动 |
| `空格键` | 射击 |
| `P` | 暂停 / 继续 |
| `R` | 重新开始 |

## ✨ 游戏特性

- 经典四方向坦克移动与射击
- 三种敌方坦克：普通型、快速型、重型
- 敌方 AI：巡逻与追踪玩家
- 砖墙可破坏、钢墙不可破坏
- 多关卡系统，难度递增
- 分数、生命值、关卡 HUD
- 爆炸粒子特效
- Web Audio API 合成音效
- 响应式布局，支持不同屏幕尺寸

## 🚀 本地运行

1. 克隆仓库：
   ```bash
   git clone https://github.com/YOUR_USERNAME/tank-battle-html5.git
   cd tank-battle-html5
   ```

2. 直接用浏览器打开 `index.html`，或启动本地服务器：
   ```bash
   python -m http.server 8000
   ```
   然后访问 http://localhost:8000。

## 🛠️ 技术栈

- HTML5 Canvas
- 原生 JavaScript (ES6+)
- CSS3
- Web Audio API

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

致敬经典 FC 游戏《坦克大战》。
