# 🍅 番茄钟

> 100 项目挑战 · 项目 #002 · 2026-10-16

求职冲刺番茄钟：专注 25 分钟 / 休息 5 分钟自动倒计时，完成时 Web Audio 合成提示音（无音频文件），自动累计今日番茄数，浏览器标签页实时显示剩余时间。

## 文件结构

```
pomodoro/
├── index.html   页面结构
├── style.css    样式
└── script.js    逻辑（MODES 模式数组 + 定时器状态机）
```

## 怎么改

- **加模式（如长休息）**：在 `script.js` 顶部 `MODES` 数组里加一行，按钮自动出现
- **改时长**：改对应模式的 `minutes`
- **换提示音**：改 `beep()` 里的 `frequency.value`（越高越尖）

## 本地预览

双击 `index.html` 即可。

## 在线地址

https://liuandi-dev.github.io/pomodoro/
