# 更新日志

本文件记录 `dsh-official-skin` 的所有版本变更，格式参考
[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

版本号需要同时在四处保持一致，见 README 的「版本与发布」一节。

## [1.1.4] - 2026-11-05

### 修复

- **切换会话 / 工作区时的首帧黑块**：根因是
  `@deepseek-ai/dsh-client-ui-conversation` 的 `ConversationRoot` 骨架在
  `.an3wZg_root` 上铺了不透明的 `var(--dsw-alias-bg-base)`，切视图时新骨架节点
  第一帧就是一块纯色，等下一次 JS 扫描才被打透。本版新增纯 CSS 规则
  `.an3wZg_root { background: transparent !important }`，并附哈希类名兜底
  `[class*="_root"][data-phase]`；CSS 在首帧即生效，黑块不再上屏。
- 保留 1.1.3 的 JS 兜底（MutationObserver 内的 BFS 深扫 + 切换后 6 帧复查），
  作为宿主结构变化时的第二道保险。

### 变更

- 移除临时诊断浮层（`.dsh-ds-probe`）与 `document.title` 统计输出。
- 版本标记：BUILD `20261105-0345`，`#dsh-ds-bg` 的 `data-version` = `29`。

## [1.1.3] - 2026-11-05

### 修复

- 首帧黑块兜底的第二次尝试：MutationObserver 回调（微任务，早于绘制）里对新增节点做
  BFS 深扫（向下 4 层、最多 90 个节点，面积 ≥15% 视口且背景不透明即透明化），
  并在切换后的 6 帧内各复查一次会话槽，覆盖宿主「下一帧才补上不透明类名」的情况。
  只在视图级切换的批次执行，流式追加不触发。

## [1.1.2] - 2026-11-05

### 修复

- 首帧黑块的第一次尝试：对新增节点及最多 6 层祖先做面积 / 背景检查，命中即当场
  透明化；只在视图级切换的批次执行。

## [1.1.1] - 2026-11-05

### 修复

- **打字时背景被冻结**：移除「按键盘即暂停动画」的门控，打字时极光 / 鲸鱼 / 星座
  照常运行；只有弹窗（dialog / menu / listbox）打开时才暂停绘制。
- **单实例守卫**：DSH 重连或客户端插件热重载会重新执行整个 bundle，现在会先调用
  上一实例的 `dispose`（断开 observer、清定时器、取消 rAF、还原内联样式与
  `data-dsh-skin`、移除容器），避免动画叠层与 observer 泄漏。

## [1.1.0] - 2026-11-05

### 性能

- 扫描调度重构：原本的两套常驻轮询 + MutationObserver（500ms×240、800ms×75，
  且每次全量 `getComputedStyle` + `getBoundingClientRect`）合并为一个调度器：
  外壳扫描 400ms 合并、完整穿透 ≥2s 间隔、首屏 settle 0/400/1500/3500/6000ms。
- 深度扫描按 4ms/帧切片，切换会话 / 工作区时不再一次性按住主线程。
- 仅在视图级切换时同步做一次轻量外壳扫描，避免新视图第一帧白闪。
- 新增只读指标 `window.__dshSkinStats`；`?skin=live` 可关闭动画门控。
- `dispose` 完整清理 observer / 定时器 / rAF / 内联样式。

## [1.0.0] - 2026-11-03

### 新增

- 首个版本：深色主题的流体极光 + 粒子鲸鱼 + 星座网格 WebGL 背景；浅色主题的官网
  hero 渐变 + 琉璃玻璃；右上角一键切换主题；外壳透明化与玻璃材质（侧边栏、输入框、
  气泡、代码块）。
