# DSH 0.2.2-rc.1 兼容性核对

核对日期：2026-11-06。插件版本：`1.1.6`。

## 结论

没有发现本次 DSH 升级要求迁移皮肤客户端代码的破坏性变化。`1.1.6` 更新兼容声明、市场截图清单和文档；`lib/client.js`、`lib/index.js` 与 `cordis.patch.yml` 沿用 `1.1.5`。

旧声明 `^0.2.1-rc.5` 已经允许安装到 `0.2.2-rc.1`：DSH 宿主与 dsh-market 都启用了 `includePrerelease: true`。本版写为 `^0.2.1-rc.5 || ^0.2.2-rc.1`，明确列出新版本线，并让使用默认 SemVer 规则的工具也能识别它；这不是修复已确认的市场安装拦截。

## 一手来源

- [DSH 新版兼容性检查](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/boot/app-boot/src/plugin-compatibility.ts#L51-L102)：调用 `semver.satisfies(runtimeVersion, range, { includePrerelease: true })`，与旧版对应文件相同。
- [客户端模块系统](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/modules/src/client/system.ts#L295-L350) 与 [Web seed](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/web/src/seed.ts)：保留 `__ModuleLoader__.load({ id, factory })`、同步 `require` 和 React / primitives 的共享模块。
- [主题服务](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-theme/src/client/index.ts#L166-L268) 与 [ThemePresenter](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-layout/src/client/theme-presenter.ts#L14-L91)：保留 `getTheme`、`setTheme`、`theme/change` 及 `body[data-ds-dark-theme]`。
- [会话工具区插槽](https://github.com/deepseek-ai/deepseek-harness/blob/66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db/packages/client/ui-conversation/src/client/contract/slots.ts#L237-L258)：保留 `conversation.session.header.utilities`。没有活动 header 时仍需浮动按钮兜底。
- [dsh-market 的版本判定](https://github.com/dsh-market/dsh-market/blob/main/src/discovery-compatibility.ts) 和 [安装来源选择](https://github.com/dsh-market/dsh-market/blob/main/src/sources.ts)：预发布版本纳入范围检查；条目关联 npm 后优先从 npm 安装。本次也执行了已安装的 `dshmarket@1.73.5` 中对应函数。
- [市场贡献指南](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md#screenshots--截图optional-recommended--可选推荐)：截图在插件仓库的 `screenshots.json` 中声明，下一次目录构建采集，无需再次申请收录。市场短介绍则来自独立 YAML 条目，修改它需要更新 PR。

## 已执行的验证

| 验证 | 结果 | 范围 |
| --- | --- | --- |
| 已安装 DSH `0.2.2-rc.1` 的真实 `evaluatePluginCompatibility` | 通过 | 旧范围与本版范围均接受 `0.2.1-rc.5`、`0.2.2-rc.1`，均拒绝 `0.3.0-rc.1` 边界输入 |
| 已安装 dsh-market `1.73.5` 的真实 `deriveHostCompatibility` | 通过 | 旧声明在 `0.2.2-rc.1` 被判为 compatible，安装目标为 npm 包名 |
| 两版官方 npm `ClientModuleSystem` | 通过 | 插件声明、factory / apply、共享模块与 `/client` 别名 |
| Chromium + 两版官方模块加载器 + 原皮肤 bundle | 通过 | WebGL2 可用；深浅色单击切换、DOM 浮动按钮与 header 按钮让位、普通不透明对话框、重复加载后一个背景 / 样式 / DOM 按钮 |
| JS 语法与 npm 打包检查 | 通过 | 客户端及宿主入口语法正确，包中包含截图清单与两张图片 |

浏览器检查使用简化 DOM 夹具、真实 React、真实模块加载器及皮肤代码；主题服务与插槽为测试替身。它不等同于完整 DSH Web / Desktop 实机回归，也不证明其他插件所有页面和窄屏布局都正确。

## 升级后仍应检查

新版增加了主面板包装节点、移动侧栏 drawer，并调整输入区层级。部分皮肤规则仍使用宿主哈希类名，即使 API 未变也需要看实际显示效果。请在真实宿主中检查启动、深浅色、无会话 / 已有会话、切换会话和工作区、输入框发送键悬停，以及设置和插件市场面板。移动侧栏与触屏本次没有完整验证。

`0.2.1-rc.5` 的既有实机使用记录与本次 `0.2.2-rc.1` 的源码 / 函数 / 浏览器验证是不同证据，不能混称全部场景已实测。

DSH `0.2.2-rc.1` CLI 自身要求 Node.js `>=24.9.0`。本插件的 Node.js `>=20` 声明只表示插件代码要求，不能替代宿主要求；Desktop 使用其内置运行时。

## 1.1.7 发布核对

核对日期：2026-11-07。`1.1.7` 的兼容声明与 `1.1.6` 相同；上文的宿主源码与浏览器证据仍是 `1.1.6` 的历史记录，不代表本版重新完成了这些验证。

本次对 `1.1.7` 执行了客户端与宿主入口的 JavaScript 语法检查、宿主入口静态审计，以及使用 jsdom 和真实 React 18 的隔离交互检查：

- 欢迎页只显示一个浮动主题按钮，不再无条件创建 DOM 兜底按钮。
- 连续点击主题按钮时，每次只调用一次主题服务，深浅色状态正确更新。
- 会话 header 显示按钮后，浮动按钮隐藏；header 隐藏后，浮动按钮恢复。
- 重复加载后，背景容器、样式节点和可见按钮各保留一个。
- `shell.overlay` 注册失败时创建可点击的 DOM 兜底按钮；宿主日志器异常不会中断加载。

夹具使用替身主题服务与插槽，不渲染真实 WebGL 画面，也不能验证 GPU 性能、真实宿主布局、跨屏 DPR 或触屏行为。本次未安装到真实 DSH profile；升级后的完整 Web / Desktop 使用场景仍需在宿主中核对。

## 1.1.8 发布核对

核对日期：2026-11-07。`1.1.8` 的兼容声明与 `1.1.7` 相同，客户端运行时代码来自用户提供的 `(8).7z`；前面的宿主源码、浏览器及实机记录仍属于各自的历史版本。

本次重新执行客户端和宿主入口语法检查、宿主静态审计及隔离 React/DOM 的单主题按钮、连续点击、header/浮动按钮让位、重复加载与插槽失败兜底检查。另外核对：

- 实际主题服务调用中的 `--dsw-specific-sidebar-fill` 在深浅色下均为 `transparent`。
- 实际注入的 CSS 对标题栏探测元素形状匹配，浅色 `#10151c`、深色 `#e8eef9` 均带 `!important`；切换主题后选择器匹配正确。
- 新增断言在 `1.1.7` 上失败，在 `1.1.8` 上通过；部署标记为 `32`。
- `screenshots.json` 和两张 PNG 继续保留，PNG 内容与旧版一致。

隔离 DOM 不完整模拟浏览器对内联样式和 `!important` 的级联。本次浏览器未能打开本地检查页，因此未验证真实浏览器的计算样式，也未验证 preload 的颜色下发或 Windows 原生 `titleBarOverlay` 渲染。未安装到真实 DSH profile；没有完整 DSH Web/Desktop 实机或 GPU 性能回归结论。
