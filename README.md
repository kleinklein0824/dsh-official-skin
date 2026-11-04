# dsh-official-skin

> 本皮肤灵感来源于最初的 DeepSeek Harness 官网页面。

> 给 **DeepSeek Harness（DSH）** Web 界面换上一套「官网质感」的皮肤：深色是**深蓝宇宙感**（流体极光 + 粒子鲸鱼 + 星座网格），浅色是**官网首页 hero**（蓝色渐变 + 琉璃玻璃）。右上角一键切换，跟随 DSH 设置里的外观偏好。

<p>
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="platform" src="https://img.shields.io/badge/platform-DSH%20Web-6b7cff.svg">
  <img alt="render" src="https://img.shields.io/badge/render-WebGL2-000000.svg">
</p>

> **安装边界：** 当前仅声明支持 DSH Web `^0.2.1-rc.5`，并在 `0.2.1-rc.5` 实机验证。npm 包尚未发布，官方 Desktop 尚未完成实机兼容验证。

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
| DSH Web | `^0.2.1-rc.5`；其中 `0.2.1-rc.5` 已实机验证 |
| DSH Desktop | 未验证，不在当前兼容承诺内 |
| npm | 尚未发布 |
| Node.js | `>=20` |

兼容范围同时写在 `package.json` 的 `engines.dsh` 中。不满足该范围时，DSH 插件安装器或启动检查可能拒绝加载。

### 方式一：从 GitHub 安装到 DSH Web（推荐）

```bash
dsh plugin --profile web add "github:kleinklein0824/dsh-official-skin"
```

安装后重新启动 DSH Web：

```bash
dsh web
```

### 方式二：通过皮肤市场安装

先安装并启用 [DSH 皮肤市场](https://github.com/kingOfSoySauce/dsh-skin-market)：

```bash
dsh plugin --profile web add "dsh-skin-market@latest"
```

然后在 **设置 → 皮肤市场** 或 **插件 → dsh-skin-market** 中搜索 `DSH 官网风格皮肤`。市场条目固定到已收录的 GitHub commit，不依赖 npm 发布。

### Desktop 与 npm 边界

- **官方 Desktop：** 当前未验证。你仍可在桌面应用的插件安装界面中尝试 GitHub 地址 `github:kleinklein0824/dsh-official-skin`，但安装与启用结果不应视为已支持。
- **npm：** 当前尚未发布，因此 `dsh plugin --profile web add "dsh-official-skin"` 和 `pnpm add dsh-official-skin` 都不可用。
- **平台：** 包内声明为 `dsh.client.platform = "web"`。在 Desktop 内嵌的 Web 界面中加载，也不等于已完成 Desktop 实机验收。

### 本地开发

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

改完 `lib/client.js` 需要**重载页面**（Ctrl+R）或重启应用：客户端代码是页面加载时注入的，热替换不会重新 import。

---

## 兼容性

- DSH Web `^0.2.1-rc.5` 为声明范围，其中 `0.2.1-rc.5`（Electron 44 / 同版本 Chromium）已实测通过；
- DSH Desktop 与 npm 安装尚未验证，不包含在当前兼容承诺内；
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

**Q：控制台一直刷 `ws://127.0.0.1:9230/ingest failed`？**
那是 DSH 自身的内部通道重连，与本插件无关。

**Q：为什么不用 `location.reload()` 做版本自愈？**
`apply()` 自己会设置 `window.__dshDeepSeekBg`，任何一次重新 activate 都会命中 reload 分支，导致页面反复重载、白屏甚至启动崩溃。清理历史 DOM 只删节点，绝不 reload。

---

## 实现要点（改代码前先读）

1. **不要依赖 CSS Modules 类名**：DSH 构建出的类名是哈希（`pI_x6G_*` 等），随版本变化。主题判断只认 `body[data-ds-dark-theme]`。
2. **`[data-slot]` anchor 是 `display: contents`**：后代选择器选不到真实布局盒子，需直接作用真实类名或走穿透器。
3. **浅色极光用 `multiply`**：粒子画布 `alpha=1` 不透明，整层铺满会把 `#9cc1e7` 冲成 `#ccdff3` 灰蓝；`screen` / `soft-light` 会洗白，不要用。
4. **浅色鲸鱼要 `mix-blend-mode: normal`，且必须内联**：骨架 `cssText` 里写死了 `screen`，内联优先级高于样式表。
5. **`prefers-reduced-motion` 只降帧不停帧**：浅色的「琉璃光感」全靠帧循环，停帧只剩死渐变。
6. **切换目标读 `body` 属性，不要读 `getTheme()` 快照**：后者在 React 重渲染前会滞后，导致 `setTheme` 目标算错、表现为「点两下才切一次」。
7. **不要给层写内联 `opacity`**：内联优先级高于样式表，会让 `#dsh-ds-bg.dsh-ds-dark #dsh-ds-bg-light { opacity: 0 }` 永远失效——这是「明明切了深色，界面还是浅色」的经典坑。
8. **切换暂停用时间戳闸门**，不要 pause/resume 配对：三条 RAF 在检查闸门前就已排好下一帧，暂停 360ms 后自动恢复，不会「停了没人叫醒」。
9. **旧实例必须真正回收**：每次 activate 都会重建 canvas + GL 上下文，不释放会触发 `Too many active WebGL contexts`（会丢掉最老的上下文）。
10. **宿主半边 `apply()` 绝不抛错**：否则 web boot 的 activate 断言会把整页掀成白屏。

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
- 邮箱：[kleinkleinwu@gmail.com](mailto:kleinkleinwu@gmail.com)
