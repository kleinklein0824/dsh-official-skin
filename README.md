# dsh-official-skin

> 本皮肤灵感来源于最初的 DeepSeek Harness 官网页面。

> 给 **DeepSeek Harness（DSH）** Web 界面换上一套「官网质感」的皮肤：深色是**深蓝宇宙感**（流体极光 + 粒子鲸鱼 + 星座网格），浅色是**官网首页 hero**（蓝色渐变 + 琉璃玻璃）。右上角一键切换，跟随 DSH 设置里的外观偏好。

<p>
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="platform" src="https://img.shields.io/badge/platform-DSH%20Web%20%7C%20Desktop-6b7cff.svg">
  <img alt="render" src="https://img.shields.io/badge/render-WebGL2-000000.svg">
</p>

> **兼容范围：** 支持 DSH Web 与 DSH Desktop `^0.2.1-rc.5`。DSH Desktop 通过应用内嵌的 Web 界面加载本皮肤。npm 包已发布为 `dsh-official-skin@1.1.5`；安装方式见[安装](#安装)。

---

## 效果预览

两种主题都由界面右上角的按钮一键切换，动画 300ms 交叉淡入。

| 深色 · 深蓝宇宙感 | 浅色 · 官网 hero + 琉璃玻璃 |
| :---: | :---: |
| ![](docs/preview-dark.png) | ![](docs/preview-light.png) |
| 深蓝渐变底 + 流体极光 + 粒子鲸鱼 + 星座网格 | 蓝色 hero 渐变 + 白色粒子鲸鱼 + 玻璃拟态面板 |

---

## 这个插件做了什么

DSH 原生界面是一套规整的灰白 / 深灰配色。这个插件在**不改变任何交互逻辑**的前提下，把它换成两层「有空气感」的视觉：

### 深色主题：深蓝宇宙感

- **底色**：`radial-gradient(165% 115% at 50% -8%, #14385c 0%, #102a45 22%, #0b1a2b 45%, #080f18 70%, #06080c 100%)`，顶部中深蓝、底部近黑，整屏有纵深。
- **流体极光**：WebGL flowmap（复刻 deepseek.com 首页那套流体），压到 `brightness(0.36)` 后用 `screen` 叠加，只留一层缓慢流动的冷蓝 / 琥珀光。
- **粒子鲸鱼**：GLSL 粒子构成的 DeepSeek 鲸鱼 logo，白点发光，**鼠标移动有视差反应**。
- **星座网格**：冷白光点 + 细连线（`rgba(190,214,255)`，线 0.16 / 点 0.26），像一层很淡的星图。

### 浅色主题：官网 hero + 琉璃玻璃

- **底色**：`linear-gradient(180deg, #9cc1e7 0%, rgba(250,250,250,0) 100%), #f9f8f8`，官网首页同款蓝色 hero。
- **粒子鲸鱼**：白色粒子，`normal` 混合，不抢文字。
- **玻璃拟态**：侧边栏、输入卡片、消息气泡、代码块统一 `backdrop-filter: blur() saturate()` + 内侧高光边，做出「一层玻璃」的厚度，而不是一团半透明灰。

### 共同保证

- **不干扰功能面板**：对话框 / 菜单 / 列表 / 模态（`[role=dialog|menu|listbox]`、`[aria-modal]`）保持原生不透明，不会被「穿透」成半透明。
- **切换丝滑**：两层底色交叉淡入 300ms，切换瞬间暂停 WebGL 循环 360ms，避免和合成抢主线程。
- **不泄漏资源**：每次重载都会 `WEBGL_lose_context.loseContext()` 释放旧上下文、停掉旧 RAF、摘掉旧 DOM。

---

## 与 DSH「外观」设置的绑定关系

**这个皮肤不自己做主题判断，它跟随 DSH 自己的主题开关。**

- 打开 **设置 → 通用设置 → 外观**，选「深色 / 浅色」；
- DSH 会把选择写到 `<body data-ds-dark-theme>` 上；
- 插件监听这个属性（`MutationObserver` + 2.5s 兜底对账），把背景层、鲸鱼、极光、玻璃全部切到对应的一套。

也就是说：

| 你在 DSH 里的操作 | 皮肤的反应 |
| --- | --- |
| 外观 → 深色 | 深蓝渐变 + 极光 + 鲸鱼 + 星座 |
| 外观 → 浅色 | 蓝色 hero + 白鲸鱼 + 玻璃面板 |
| 外观 → 跟随系统 | 系统切深浅时，皮肤同步切换 |

右上角那颗按钮是**同一件事的快捷入口**：它调用 DSH 的 `theme` 服务 `setTheme("dark" | "light")`，等价于你去设置里点一次。所以按钮切换后，设置页里的「外观」选项也会跟着变——两者是同一个状态，不存在两套开关。

> 注意：如果底部显示「重新连接中…」，此时客户端拿不到 `theme` 服务，点按钮不会立刻生效（这是宿主断链，不是按钮坏了），重连完成后自动应用。

---

## 安装

### 支持范围

| 项目 | 状态 |
| --- | --- |
| DSH Web | `^0.2.1-rc.5`；`0.2.1-rc.5` 实测通过 |
| DSH Desktop | `^0.2.1-rc.5`；桌面版内嵌 Web 界面实测可用 |
| npm | `1.1.5` 已发布 |
| Node.js | `>=20` |

兼容范围同时写在 `package.json` 的 `engines.dsh` 中。当前版本低于 `0.2.1-rc.5`，或高于 `0.2.x` 时，安装器可能会拒绝加载。

### 方式一：DSH Desktop（推荐）

打开 DSH Desktop 后进入 **插件 → 添加插件**，输入：

```text
dsh-official-skin@1.1.5
```

确认安装后，按应用提示启用插件，并完全退出、重新打开 DSH Desktop。

如果当前桌面版的 npm 安装不可用，也可以改用：

```text
github:kleinklein0824/dsh-official-skin
```

### 方式二：DSH Web 直接安装

终端执行：

```bash
dsh plugin --profile web add "dsh-official-skin@1.1.5"
```

安装完成后刷新 DSH Web，或重新执行 `dsh web`。

### 方式三：通过皮肤市场安装

先安装并启用 [DSH 皮肤市场](https://github.com/kingOfSoySauce/dsh-skin-market)：

```bash
dsh plugin --profile web add "dsh-skin-market@latest"
```

然后在 **设置 → 皮肤市场** 或 **插件 → dsh-skin-market** 中搜索 `DSH 官网风格皮肤`。市场条目固定到已收录的 GitHub commit，不依赖 npm 发布。

### 安装说明

- **DSH Desktop：** 使用应用内 **插件 → 添加插件** 安装 `dsh-official-skin@1.1.5`，安装、启用和重启均由桌面应用管理。
- **npm：** 已发布到 npm，可通过包名 `dsh-official-skin` 安装；GitHub 安装目标继续保留，作为市场或固定 commit 安装的备用方式。
- **平台：** 包内声明为 `dsh.client.platform = "web"`，DSH Desktop 使用同一套内嵌 Web 客户端加载皮肤，因此 Web 与 Desktop 共用客户端实现。

### 本地开发

仅在调试源码时使用：

```bash
cd ~/.dsh/profiles/web
pnpm add link:"<本仓库的绝对路径>"
```

再把包名加进 profile 的 `package.json`：

```json
{
  "dsh": {
    "profile": {
      "bundles": ["...", "dsh-official-skin"]
    }
  }
}
```

重启 DSH 生效。

### 卸载

```bash
dsh plugin --profile web remove "dsh-official-skin"
```

---

## 目录结构

```
dsh-official-skin/
├─ package.json          # 插件清单：dsh.bundle.patch / dsh.client.platform = web
├─ cordis.patch.yml      # 往宿主 cordis 树 insert 一行（id: official-skin）
├─ lib/
│  ├─ index.js           # 宿主半边：只做静态审计，绝不抛错
│  └─ client.js          # 皮肤本体：CSS + 极光/鲸鱼/星座 WebGL + 主题切换
├─ docs/
│  ├─ preview-dark.png
│  └─ preview-light.png
├─ README.md
├─ CHANGELOG.md          # 版本变更记录（语义化版本）
├─ LICENSE
└─ .gitignore
```

它是标准的 DSH 插件结构：`dsh.bundle.patch` 让宿主把 `cordis.patch.yml` 插进 cordis 树；`dsh.client.platform = web` 让 `lib/client.js` 被 `dsh-client-modules` 扫出来、编进 `window.__DSH_BOOT__`，在页面加载时一次性注入。

### 分层结构

```
#dsh-ds-bg  (position:fixed; inset:0; z-index:-1)
├─ #dsh-ds-bg-light        蓝色 hero 渐变        ← opacity 由 .dsh-ds-dark 切换
├─ #dsh-ds-bg-dark         深蓝 radial 渐变      ← opacity 由 .dsh-ds-dark 切换
├─ #dsh-ds-aurora          WebGL 流体极光（canvas）
├─ #dsh-ds-constellation   星座网格（canvas）
└─ #dsh-ds-whale           粒子鲸鱼（canvas, screen 混合）
```

主题切换只改两层 `opacity` 和三个 canvas 的显示状态，**不重建 DOM、不重新编译着色器**。

---

## 调参

想改视觉不用读完整份代码，参数都集中在 `lib/client.js`：

| 想改什么 | 搜什么 | 默认值 |
| --- | --- | --- |
| 深色底色 | `dsh-ds-bg-dark` 的 `radial-gradient` | `#14385c → #06080c` |
| 极光强度 | `#dsh-ds-aurora` 的 `filter` | `brightness(0.36) saturate(1.45)`（>0.4 会发灰） |
| 星座亮度 | `DARK_CONSTELLATION` / `LIGHT_CONSTELLATION` | 线 0.16 / 点 0.26 |
| 鲸鱼透明度 | `whaleLayer.style.opacity` | 深色 1、浅色 0.72 |
| 切换速度 | `transition: opacity .3s`（四处）、`dsAnimPauseUntil` | 300ms / 360ms |
| 玻璃强度 | `body:not([data-ds-dark-theme])` 下的 `rgba(255,255,255,…)` | 0.18 ~ 0.20 |

改完 `lib/client.js` 需要**重启 DSH 应用**（关闭后重新打开）：客户端代码是页面加载时注入的，桌面端按 Ctrl+R / F5 不会重新 import（实测无效）。

---

## 兼容性

- DSH Web `^0.2.1-rc.5` 为声明范围，其中 `0.2.1-rc.5`（Electron 44 / 同版本 Chromium）实测通过；
- DSH Desktop `^0.2.1-rc.5` 已实测可用，通过应用内嵌 Web 界面加载；
- npm 包 `dsh-official-skin@1.1.5` 已发布；
- 需要 **WebGL2**（极光与鲸鱼）；不可用时自动降级为纯 CSS 背景，界面仍可用；
- 深浅两套都按 `[data-ds-dark-theme]` 判断，不依赖 DSH 的哈希类名，因此小版本升级不容易失效。

---

## 常见问题

**Q：点了右上角按钮没反应？**
底部出现「重新连接中…」时，客户端拿不到 `theme` 服务，点击会被静默丢弃；等连接恢复后再点即可。

**Q：改了 `client.js` 但界面没变？**
客户端 bundle 是页面加载时注入的，必须重载页面 / 重启应用，`set_plugin` 启停不会重新 import。

**Q：控制台报 `Too many active WebGL contexts`？**
Chromium 对同时存在的 WebGL 上下文有上限。本插件已在重载时主动释放旧上下文；若还出现，通常是别的插件也在开 GL 上下文。

---

## 性能与稳定性

- 切换会话和工作区时优先保证首帧显示，避免不透明底板短暂盖住背景。
- 深度界面扫描分帧执行，聊天流式输出时不会因反复全量扫描而明显卡顿。
- 弹窗打开时暂停背景动画，关闭后自动恢复。
- 输入框玻璃模糊移到独立图层，鼠标停在发送键上时不再持续闪烁。
- 插件重载时会清理旧实例，避免动画叠层和资源泄漏。

---

## 版本记录

最新版本、修复内容和历史变更见 [CHANGELOG.md](./CHANGELOG.md)。

---

## Roadmap

- [ ] 主题跟随系统时更平滑的过渡（目前是 300ms 直切）
- [ ] 可配置的极光强度 / 粒子密度（配置文件或设置页项）
- [ ] 更多配色预设（青绿、紫罗兰）

---

## 致谢

深色极光与鲸鱼的着色器思路参考 deepseek.com 首页的流体与粒子效果，并由本项目重新移植、压暗、适配 DSH 的层级与主题体系。

## License

[MIT](LICENSE) © 2026 Klein

本项目是非官方社区插件，与 DeepSeek 官方无隶属或背书关系。DeepSeek 名称、鲸鱼图形及相关品牌素材的权利归其各自权利人所有，不在本项目的 MIT 授权范围内。详见 [NOTICE.md](NOTICE.md)。

## 作者

- 姓名：Klein
