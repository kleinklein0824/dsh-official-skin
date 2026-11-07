/*!
 * dsh-official-skin 客户端入口（自动生成）
 * 注入 DeepSeek 官网风格背景与玻璃拟态；仅深色主题生效。
 */
window.__ModuleLoader__.load({
  id: "dsh-official-skin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    /* 版本自愈（2026-11-03 修复致命崩溃）：这里原来写的是
         if (sessionStorage 里的版本号 !== BUILD) { setItem; location.reload(); return; }
       那个裸 return 会让 factory 返回 undefined —— 宿主拿到 undefined 就报
       “invalid plugin, expect function or object with an apply method, received undefined”，
       整个 web boot 直接失败，弹出「应用无法启动或已意外停止」；点「重启」又是新窗口、
       sessionStorage 必然为空，于是必然再次命中，形成「重启 → 崩溃 → 再重启」的死循环。
       现在只记录版本号并清理旧 DOM，绝不 reload、绝不返回 undefined。 */
    try {
      var BUILD = "20261105-0245";

  /* 单实例守卫：DSH 重连 / 客户端插件热重载会重新执行整个 bundle，
     但不销毁上一份实例（旧 rAF 循环、MutationObserver、定时器全部还活着）。
     叠两层就是「越用越卡、切视图黑块、打字掉帧」，所以先让旧实例自我清理。 */
  try {
    var previousInstances = window.__dshDsSkinInstances || [];
    for (var prevIndex = 0; prevIndex < previousInstances.length; prevIndex += 1) {
      try { previousInstances[prevIndex](); } catch (previousInstanceError) { /* ignore */ }
    }
    window.__dshDsSkinInstances = [];
    if (typeof window.__dshDsDispose === "function") window.__dshDsDispose();
  } catch (disposePreviousError) { /* ignore */ }
  try {
    if (window.__dshDsSkinTimers) {
      for (var sti = 0; sti < window.__dshDsSkinTimers.length; sti += 1) {
        clearTimeout(window.__dshDsSkinTimers[sti]);
        clearInterval(window.__dshDsSkinTimers[sti]);
      }
      window.__dshDsSkinTimers = [];
    }
  } catch (timerCleanupError) { /* ignore */ }
      if (window.sessionStorage) window.sessionStorage.setItem("dsh-ds-build", BUILD);
    } catch (buildError) { /* sessionStorage 不可用就跳过，只清 DOM */ }
    /* 这里曾经有一段「检测到旧实例就 location.reload()」的自愈逻辑，用来清掉
       早期取证遗留的探针层。它是致命的：apply() 自己就会设置
       window.__dshDeepSeekBg，于是每次插件重新 activate（enable、配置重载、
       宿主重启后重挂）都会命中这个分支，反复 reload 页面 —— 表现就是
       「每次动一下配置，整个 Harness 就重启一次」，而且 reload 期间
       boot manifest 未就绪时会直接白屏。自愈改为只清 DOM（见下），不 reload。 */

    /* 清掉历史版本留在页面里的调试节点（早期取证用的像素色块 / 文本通道 / 诊断面板），
       避免热重载后旧 DOM 残留继续挡在界面上。 */
    try {
      /* 白名单：本插件真正要保留的节点；其余 dsh-ds-* / dsh-dbg-* 都是历史版本留下的调试色块 */
      var OWN_IDS = ["dsh-ds-bg", "dsh-ds-aurora", "dsh-ds-constellation", "dsh-deepseek-bg-css", "dsh-ds-theme-btn"];
      /* 早期取证用过 dsbg-* / dsprobe-* 前缀的探针（整屏色块、帧计数格、状态位图）。
         它们不匹配下面的 dsh-ds-* 前缀，一旦页面没有真正重载就会一直留在 DOM 里，
         把整屏盖成一块纯色 —— 必须一并清掉。 */
      var legacyNodes = document.querySelectorAll(
        '[id^="dsh-ds-"], [id^="dsh-dbg-"], [id^="dsbg-"], [id^="dsprobe-"], [id^="dsh-probe"]'
      );
      for (var li = 0; li < legacyNodes.length; li += 1) {
        var legacyNode = legacyNodes[li];
        if (OWN_IDS.indexOf(legacyNode.id) !== -1) continue;
        if (legacyNode.parentNode) legacyNode.parentNode.removeChild(legacyNode);
      }
      /* 有些探针层是动态 createElement 出来的、没有 id（或 id 前缀不在上面的列表里），
         它们是「整屏 fixed + 高 z-index」，会直接把界面盖成一块纯色。
         官方 UI 的根节点永远只有 #root（内部子层不可能成为 body 的直接子元素），
         所以这里只扫 body 的直接子元素：凡是铺满视口 60% 以上、又不是本插件节点的，一律清掉。
         旧实例的 setInterval 可能把它重新插回来，因此再复查一段时间。 */
      var sweepStray = function () {
        if (!document.body || !document.body.children) return;
        var vw = window.innerWidth || 1;
        var vh = window.innerHeight || 1;
        var kids = document.body.children;
        for (var k = kids.length - 1; k >= 0; k -= 1) {
          var kid = kids[k];
          if (!kid || kid.id === "root") continue;
          if (OWN_IDS.indexOf(kid.id) !== -1) continue;
          if (kid.id && kid.id.indexOf("dsh-ds-") === 0) continue;
          if (kid.tagName === "SCRIPT" || kid.tagName === "STYLE" || kid.tagName === "LINK") continue;
          /* 官方用 portal 把弹窗/菜单挂到 body 上，它们同样是整屏尺寸。
             只要子树里有 dialog/menu/listbox/aria-modal 或任何可交互元素，就一律放过。 */
          if (kid.getAttribute && (kid.getAttribute("role") || kid.getAttribute("aria-modal"))) continue;
          if (kid.querySelector && kid.querySelector(
            '[role="dialog"], [role="menu"], [role="listbox"], [aria-modal="true"], button, input, textarea, select, a[href]'
          )) continue;
          /* 纯文本层（截图通道、状态条）也算官方的可能内容，只清「空壳色块」 */
          if (kid.textContent && kid.textContent.trim().length > 0) continue;
          var rect = kid.getBoundingClientRect();
          if (rect.width * rect.height < vw * vh * 0.6) continue;
          if (kid.parentNode) kid.parentNode.removeChild(kid);
        }
      };
      sweepStray();
      var sweepsLeft = 60;
      var sweepTimer = setInterval(function () {
        sweepsLeft -= 1;
        try { sweepStray(); } catch (sweepError) { /* ignore */ }
        if (sweepsLeft <= 0) clearInterval(sweepTimer);
      }, 500);
    } catch (legacyCleanupError) {
      /* 清理失败不影响插件 */
    }
    /* ===== 独立穿透器 ===== */
    /*!
     * 独立穿透器（Independent Punch-Through）
     * 不依赖 boot()/makeShellTransparent() 是否跑通，自己在 factory 顶层起轮询。
     * 策略：任何 computed backgroundColor 不透明、且面积 >= 视口 25% 的元素，
     *       一律打 inline `background: transparent !important`。
     * 兼容任意 CSS Modules 哈希类名，无需知道真实类名。
     */
    (function installPunchThrough() {
      "use strict";
      var FLAG = "__dshDsPunch";
      if (window[FLAG]) return;
      window[FLAG] = { runs: 0, punched: 0, lastCount: 0 };

      var OWN = ["dsh-ds-bg", "dsh-ds-diag"];
      /* 面板（设置页 / 弹窗 / 下拉菜单 / 选择器）必须保留官方不透明外观：
         它们通常也占据大块面积，会被下面的「大面积穿透」误伤成透明。 */
      var PANEL_SELECTOR = '[role="dialog"], [role="menu"], [role="listbox"], [aria-modal="true"]';

      function inPanel(el) {
        try { return !!(el.closest && el.closest(PANEL_SELECTOR)); } catch (e) { return false; }
      }

      function alphaOf(bg) {
        if (!bg) return 1;
        if (bg === "transparent") return 0;
        var m = /rgba?\(([^)]+)\)/.exec(bg);
        if (!m) return 1;
        var parts = m[1].split(/[,\s\/]+/).filter(function (s) { return s.length > 0; });
        if (parts.length > 3) { var a = parseFloat(parts[3]); return isNaN(a) ? 1 : a; }
        return 1;
      }

      function isOwn(el) {
        for (var i = 0; i < OWN.length; i += 1) {
          if (el.id === OWN[i]) return true;
          if (el.closest && el.closest("#" + OWN[i])) return true;
        }
        return false;
      }

      /* 只处理「布局主脊」：所有插槽 anchor 的祖先链 + 它们的直接子元素。
         面板（设置页 / 弹窗 / 菜单 / 选择器）不在这个集合里，因此保持官方不透明。
         之前按「面积 > 20% 屏」盲扫，导致打开设置页时整块面板被打透（用户反馈）。 */
      function spineSet() {
        var out = [];
        function add(node) { if (node && node !== document.body && out.indexOf(node) === -1) out.push(node); }
        var anchors;
        try { anchors = document.querySelectorAll("[data-slot]"); } catch (e) { return out; }
        for (var i = 0; i < anchors.length; i += 1) {
          var node = anchors[i].parentElement;
          while (node && node !== document.body) { add(node); node = node.parentElement; }
          var kids = anchors[i].children;
          for (var k = 0; k < kids.length; k += 1) add(kids[k]);
        }
        return out;
      }

      function run() {
        var st = window[FLAG];
        st.runs += 1;
        if (!document.body) return;
        var vw = window.innerWidth || document.documentElement.clientWidth || 0;
        var vh = window.innerHeight || document.documentElement.clientHeight || 0;
        if (!vw || !vh) return;
        var minArea = vw * vh * 0.02;

        try {
          document.documentElement.style.setProperty("background", "transparent", "important");
          document.body.style.setProperty("background", "transparent", "important");
        } catch (e) { /* ignore */ }

        var spine = spineSet();
        var count = 0;
        for (var i = 0; i < spine.length; i += 1) {
          var el = spine[i];
          if (isOwn(el)) continue;
          if (inPanel(el)) continue;
          var cs;
          try { cs = window.getComputedStyle(el); } catch (e) { continue; }
          if (!cs) continue;
          var opaque = alphaOf(cs.backgroundColor) > 0.02;
          var painted = cs.backgroundImage && cs.backgroundImage !== "none";
          if (!opaque && !painted) continue;
          var r;
          try { r = el.getBoundingClientRect(); } catch (e) { continue; }
          if (r.width * r.height < minArea) continue;
          try {
            el.style.setProperty("background", "transparent", "important");
            if (painted) el.style.setProperty("background-image", "none", "important");
            count += 1;
          } catch (e) { /* ignore */ }
        }
        st.punched += count;
        st.lastCount = count;
      }

      /* 调度已交给 makeShellTransparent 的统一扫描器：这里只跑一次，并把
         run 暴露出去，由它按「外壳级变更 / 兜底」触发。
         旧实现在 document.body 上挂了永久 MutationObserver，外加 500ms×240
         轮询；每个流式 token 都会把插槽祖先链全部重扫一遍
         （getComputedStyle + getBoundingClientRect），这是打字/对话卡顿的主因。 */
      try { run(); } catch (e) { /* ignore */ }
      window.__dshDsPunchOnce = run;
    })();

    var React = require("react");
    var primitives = null;
    try { primitives = require("@deepseek-ai/dsh-client-ui-primitives"); } catch (primitivesError) { primitives = null; }
    /* 旧样式表先摘掉：HMR 换了 bundle 却复用旧 <style> 会让改动看不到 */
    var staleStyle = document.getElementById("dsh-deepseek-bg-css");
    if (staleStyle && staleStyle.parentNode) staleStyle.parentNode.removeChild(staleStyle);
    if (document.getElementById("dsh-deepseek-bg-css") === null) {
      var styleTag = document.createElement("style");
      styleTag.id = "dsh-deepseek-bg-css";
      styleTag.textContent = `
/*!
 * dsh-deepseek-bg.css
 * DeepSeek 官网首页背景复刻 —— DSH Web GUI 全屏固定背景层 + 外壳透明化。
 *
 * 颜色与蒙版均取自 DeepSeek 官方站点：
 *  - 浅色 hero 渐变:  linear-gradient(180deg, #9cc1e7 0%, rgba(250,250,250,0) 100%)
 *  - 深色 harness 页: 页面底色 #0a0a0a
 *  - canvas 蒙版:      linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%)
 *  - 入场动画:        opacity 0→1 + blur(20px)→0，1.8s ease-out（harness hero 同款）
 *
 * 重要：深色主题只保留官方深灰底 + 鲸鱼粒子 logo；
 *       浅色主题显示完整的作者原设计皮肤（蓝色 hero 渐变 + 琉璃光感 + 粒子 logo）。
 */

/* ---------- 背景层：两种主题都显示（浅色蓝 hero / 深色 #151517） ---------- */
#dsh-ds-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  /* deepseek.com 浅色首页 hero：顶部蓝，向下淡出到 #f9f8f8。
     作者原文写的是 #9cc1e7，但上面还叠着一层不透明的粒子画布（见下方极光规则），
     粒子会把顶部提亮约 +50/ +25/ +12，两者叠加后的实测值才是作者的 #9cc1e7；
     所以这里用 #6a9fcd 打底，叠完正好落在 #9cc1e7 一档（实测 #9ec1df）。 */
  background: linear-gradient(180deg,#9cc1e7 0%,rgba(250,250,250,0) 100%),#f9f8f8;

  animation: dsh-ds-enter 1.8s ease-out backwards;
  will-change: opacity, filter;
}

/* 浅色主题同样显示插件背景（整屏背景要求），仅切换配色与动画类型：
   浅色 = 官网浅色首页 hero（蓝色渐变 + particle 粒子 + 鲸鱼），
   深色 = 官方深灰底 #151517 + 鲸鱼粒子 logo。 */

/* 浅色主题：极光层用 multiply 合成 + 0.9 不透明度。
   粒子层是「不透明画布」（PARTICLE_FS 输出 alpha=1），整层铺满会把作者的
   #9cc1e7 蓝冲成 #ccdff3 一类灰蓝 —— 实测 normal 混合下无论怎么调透明度，
   都只能在「整屏洗白」和「毫无纹理」之间二选一。
   multiply 下白色粒子不改底色、浅蓝粒子只加深，顶部回到 #a4c6e9（作者原值
   #9cc1e7）；screen / soft-light 都会把蓝底提亮成 #c8def2 甚至近白，不要用。 */
#dsh-ds-bg:not(.dsh-ds-dark) #dsh-ds-aurora {
  opacity: 1;
  mix-blend-mode: multiply;
  transition: opacity .3s cubic-bezier(.22, .61, .36, 1);
}

/* 两张底色层之间淡入淡出 */
.dsh-ds-bg-layer {
  position: absolute;
  inset: 0;
  transition: opacity .3s cubic-bezier(.22, .61, .36, 1);
}
/* 只在主题切换的那 420ms 里提层：常驻 will-change 会让两张全屏渐变各占一张
   合成层，静止时白白多两次全屏合成。 */
body.dsh-ds-theme-anim .dsh-ds-bg-layer { will-change: opacity; }

#dsh-ds-bg.dsh-ds-dark #dsh-ds-bg-light { opacity: 0; }
#dsh-ds-bg.dsh-ds-dark #dsh-ds-bg-dark { opacity: 1; }
#dsh-ds-bg:not(.dsh-ds-dark) #dsh-ds-bg-light { opacity: 1; }
#dsh-ds-bg:not(.dsh-ds-dark) #dsh-ds-bg-dark { opacity: 0; }

/* 深色主题：1:1 复刻 origin 原版 —— 底是 #0a0a0a（不是官方 #151517），
   上面叠流体极光 + 星座网格 + 粒子鲸鱼三层，和作者原作完全一致。 */
#dsh-ds-bg.dsh-ds-dark {
  background: transparent;
}

/* 深色下极光与星座都要显示（origin 原版就是三层全开）。
   用 opacity 而不是 display:none，切换时才能淡入；canvas 尺寸也不会归零。 */
#dsh-ds-bg.dsh-ds-dark #dsh-ds-aurora {
  /* origin 的 fluid 极光在这套 WebGL 移植里输出偏白，直接放出来会把深色底
     冲成灰白。按亮度压到 0.36 再叠 screen，留一层能看出来的蓝/琥珀流动光；
     超过 0.4 就会开始发灰。 */
  opacity: 1;
  filter: brightness(0.36) saturate(1.45);
  mix-blend-mode: screen;
}

#dsh-ds-bg.dsh-ds-dark #dsh-ds-constellation {
  opacity: 1;
}


#dsh-ds-aurora,
#dsh-ds-constellation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  /* 官方 hero 蒙版（与 deepseek.com 原站一致） */
  mask: linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%);
  -webkit-mask: linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%);
  transition: opacity .3s cubic-bezier(.22, .61, .36, 1);
}

#dsh-ds-constellation {
  background: transparent;
}

/* 官方深色 hero 的鲸鱼层：screen 混合，仅暗色主题显示 */
.dsh-ds-whale {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  mix-blend-mode: screen;
  z-index: 2;
}

#dsh-ds-bg.dsh-ds-dark .dsh-ds-whale {
  display: flex;
}

/* 浅色主题也要鲸鱼：作者原设计里鲸鱼是白色粒子，浮在 #9cc1e7 的蓝色 hero 上
   （官网首页就是这么渲的）。浅色下背景已不是纯白（顶部实测 #a0c3e6），
   白色粒子用普通 alpha 合成即可清晰可见，不需要 screen 加亮。 */
#dsh-ds-bg:not(.dsh-ds-dark) .dsh-ds-whale {
  display: flex;
  mix-blend-mode: normal;
  opacity: .72;
}

.dsh-ds-whale { transition: opacity .3s cubic-bezier(.22, .61, .36, 1); }

/* 切主题时宿主自己的面板底色/文字色是瞬间跳变的，跟背景的 500ms 淡入淡出
   对不上，看起来就是「背景在渐变、界面在闪」。给常见容器挂一条底色/文字的
   短过渡，两边节奏就一致了。只影响切换的那一瞬间，静止状态与原来完全一致。 */
/* 只在这一小段时间里挂过渡，否则所有 hover 都会变成 350ms 的慢动作 */
body.dsh-ds-theme-anim,
body.dsh-ds-theme-anim * {
  transition: background-color .22s cubic-bezier(.22, .61, .36, 1),
              border-color .22s cubic-bezier(.22, .61, .36, 1),
              color .22s cubic-bezier(.22, .61, .36, 1) !important;
}

@media (prefers-reduced-motion: reduce) {
  body.dsh-ds-theme-anim, body.dsh-ds-theme-anim * { transition: none !important; }
}

@keyframes dsh-ds-enter {
  0% {
    opacity: 0;
    filter: blur(20px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  #dsh-ds-bg {
    animation: none;
  }
}

/* ===================================================================== *
 * 以下全部为深色主题专属覆盖（body[data-ds-dark-theme]）；
 * 浅色主题不匹配任何规则，保持官方原版。
 * ===================================================================== */

/* 背景透出：body 与外壳层透明化 */
body[data-ds-dark-theme] {
  background: transparent !important;
}

body[data-ds-dark-theme] [data-slot="root"] > div {
  background: transparent !important;
}

/* 当前构建的布局 frame 类名（精确覆盖，防中间包裹层） */
body[data-ds-dark-theme] [data-slot="root"] .pI_x6G_frame {
  background: transparent !important;
}

/* 插件加载前的启动屏 */
body[data-ds-dark-theme] #root ._boot_9gj4p_6 {
  background: transparent !important;
}

/* 视图根容器透明化：会话视图（bg-base）与详情列内容（轨迹视图 bg-layer-1）
   都是全高不透明容器，会盖住 DeepSeek 背景层 */
body[data-ds-dark-theme] [data-slot="conversation"] > div {
  background: transparent !important;
}

body[data-ds-dark-theme] .pI_x6G_detailsCol > div {
  background: transparent !important;
}

/* 布局三列本身：中间列与详情列容器
   （.pI_x6G_frame 只是 grid 容器，真正铺满的是这些列） */
body[data-ds-dark-theme] .pI_x6G_centerCol,
body[data-ds-dark-theme] .pI_x6G_detailsCol {
  background: transparent !important;
}

/* 会话列主容器 .wSkVaW_root：height:100% + background:var(--dsw-alias-bg-base)，
   是 44% 面积的 #151517 真正来源，必须透明化，否则背景层被整块盖住 */
body[data-ds-dark-theme] .wSkVaW_root {
  background: transparent !important;
}

/* 右侧详情列主容器 .ydkMvW_root：同样是全高 bg-base 不透明层 */
body[data-ds-dark-theme] .ydkMvW_root {
  background: transparent !important;
}

/* 会话激活态下输入框座位画的 bg-base 渐隐（color-mix 带 bg-base），
   玻璃卡片下面会露出一条不透明底色，改成透明 */
body[data-ds-dark-theme] .wSkVaW_root[data-phase="active"] .wSkVaW_composerSeat {
  background: transparent !important;
}

/* ============ 官方玻璃拟态（ds-glass 令牌，取自缓存 6f322bb0cffe2c36.css） ============ */

/* 侧边对话栏：半透明 + 玻璃模糊
   注意：backdrop-filter 会让元素成为 fixed 后代的包含块（设置弹窗会被
   强制压成侧边栏宽度）——所以模糊放在 ::before 伪元素上，列本身只设背景 */
body[data-ds-dark-theme] .pI_x6G_sidebarCol {
  position: relative;
  background: rgba(13, 15, 19, 0.55) !important;
  border-right-color: hsla(0, 0%, 100%, 0.08) !important;
}

body[data-ds-dark-theme] .pI_x6G_sidebarCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 侧边栏内容根：不再叠不透明底色。
   注意：不能给这里加 z-index/堆叠上下文——设置弹窗（fixed z-1000）挂载在
   侧边栏内部，一旦被困在侧边栏的堆叠上下文里就会被输入框（z-7）盖住；
   模糊伪元素用 z-index:-1 自然绘制在内容之下，内容无需提升层级
   [data-slot="sidebar"] > div 为跨构建通用选择器 */
body[data-ds-dark-theme] .hHd-Xa_root,
body[data-ds-dark-theme] [data-slot="sidebar"] > div {
  background: transparent !important;
}

/* 底部输入框卡片：官方玻璃卡片样式（ds-glass-card/dropdown 同款令牌）
   [data-composer-card="true"] 为跨构建通用属性选择器 */
body[data-ds-dark-theme] .uV2eYG_card,
body[data-ds-dark-theme] [data-composer-card="true"] {
  position: relative;
  isolation: isolate;
  background: rgba(13, 15, 19, 0.55) !important;
  border-color: hsla(0, 0%, 100%, 0.08) !important;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08) !important;
}

/* 模糊必须放在 ::before：卡片本体一旦带 backdrop-filter，内部按钮 hover 的
   每次重绘都会触发整张卡片的背景重采样，表现为输入面板一闪一闪 */
body[data-ds-dark-theme] .uV2eYG_card::before,
body[data-ds-dark-theme] [data-composer-card="true"]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 输入框座位：去掉向不透明底色的渐隐，让极光从玻璃下透出
   [data-composer-seat] 为跨构建通用属性选择器 */
body[data-ds-dark-theme] .wSkVaW_composerSeat,
body[data-ds-dark-theme] [data-composer-seat] {
  background: transparent !important;
}

/* 会话列表底部渐隐条（qDHVXG_fade）：原来用不透明侧边栏填充色渐变，
   在玻璃侧边栏下会露出浅色白条——透明化 */
body[data-ds-dark-theme] .qDHVXG_fade {
  background: transparent !important;
}

/* 会话骨架根（ui-conversation 的 ConversationRoot）：宿主在 .an3wZg_root 上铺了
   不透明的 var(--dsw-alias-bg-base)，切会话 / 切工作区时会先上屏 1-2 帧的
   「载入历史…」骨架，就是用户看到的黑块。这里直接透明化，CSS 在第一帧就生效，
   比 JS 打透更早；[class*="_root"][data-phase] 是哈希类名变化时的兜底。 */
.an3wZg_root,
[class*="_root"][data-phase] {
  background: transparent !important;
}

/* ============ 消息气泡与代码块玻璃化（与侧边栏/输入框同款材质） ============ */

/* 用户消息气泡 */
body[data-ds-dark-theme] .gdEzaW_bubble {
  background: rgba(13, 15, 19, 0.55) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* 代码块容器（终端/阅读/差异/搜索等 DSL 块）+ 复制按钮 + banner */
body[data-ds-dark-theme] ._block_10eou_7,
body[data-ds-dark-theme] ._block_biesw_7,
body[data-ds-dark-theme] ._block_srovd_7,
body[data-ds-dark-theme] ._block_s66q0_7,
body[data-ds-dark-theme] ._block_178r4_4,
body[data-ds-dark-theme] ._block_d4nqi_7,
body[data-ds-dark-theme] ._body_1ye18_20,
body[data-ds-dark-theme] ._copyButton_10eou_142,
body[data-ds-dark-theme] ._bannerWrap_178r4_21 {
  background: rgba(13, 15, 19, 0.55) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* ===================================================================== *
 * 浅色主题覆盖：浅色下同样保留整屏背景（官网首页 hero 蓝调），
 * 外壳与卡片改成浅色玻璃，避免纯白把背景完全盖死。
 * body 在浅色主题下不带 data-ds-dark-theme，用 :not() 选中。
 * ===================================================================== */
body:not([data-ds-dark-theme]) {
  background: transparent !important;
}

body:not([data-ds-dark-theme]) .pI_x6G_sidebarCol {
  position: relative;
  /* 浅色侧栏玻璃：太薄看不见、太厚糊成白板。0.18 + saturate 1.5 是既不压死
     hero 渐变、又能看出「一层玻璃」的档位；右侧描边给一条高光边。 */
  background: rgba(255, 255, 255, 0.18) !important;
  border-right-color: rgba(15, 23, 42, 0.08) !important;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(18px) saturate(1.5);
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
}

body:not([data-ds-dark-theme]) .pI_x6G_sidebarCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

body:not([data-ds-dark-theme]) .hHd-Xa_root,
body:not([data-ds-dark-theme]) [data-slot="sidebar"] > div {
  background: transparent !important;
}

body:not([data-ds-dark-theme]) .uV2eYG_card,
body:not([data-ds-dark-theme]) [data-composer-card="true"] {
  position: relative;
  isolation: isolate;
  background: rgba(255, 255, 255, 0.20) !important;
  border-color: rgba(255, 255, 255, 0.55) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75),
              0 0 1px 0 rgba(15, 23, 42, 0.06),
              0 16px 40px 0 rgba(15, 23, 42, 0.10) !important;
}

body:not([data-ds-dark-theme]) .uV2eYG_card::before,
body:not([data-ds-dark-theme]) [data-composer-card="true"]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  backdrop-filter: blur(20px) saturate(1.45);
  -webkit-backdrop-filter: blur(20px) saturate(1.45);
}

body:not([data-ds-dark-theme]) .wSkVaW_composerSeat,
body:not([data-ds-dark-theme]) [data-composer-seat],
body:not([data-ds-dark-theme]) .qDHVXG_fade {
  background: transparent !important;
}

body:not([data-ds-dark-theme]) .gdEzaW_bubble,
body:not([data-ds-dark-theme]) ._block_10eou_7,
body:not([data-ds-dark-theme]) ._block_biesw_7,
body:not([data-ds-dark-theme]) ._block_srovd_7,
body:not([data-ds-dark-theme]) ._block_s66q0_7,
body:not([data-ds-dark-theme]) ._block_178r4_4,
body:not([data-ds-dark-theme]) ._block_d4nqi_7,
body:not([data-ds-dark-theme]) ._body_1ye18_20,
body:not([data-ds-dark-theme]) ._copyButton_10eou_142,
body:not([data-ds-dark-theme]) ._bannerWrap_178r4_21 {
  background: rgba(255, 255, 255, 0.18) !important;
  backdrop-filter: blur(16px) saturate(1.4) !important;
  -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55),
              inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
}

/* 右上角主题切换按钮（不随主题生效，浅色/深色都要可见） */
.dsh-ds-theme-toggle {
  display: inline-flex;
  /* 按钮必须自带可见底：header / 背景都是透明玻璃，纯 transparent 底会让按钮「看不见」。
     故意不使用 --dsw-alias-interactive-bg-* 令牌：浅色主题下该令牌接近全透明，
     叠在 hero 蓝渐变上仍然看不出这是个按钮。 */
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.14);
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  flex: 0 0 auto;
  border: none;
  border-radius: 8px;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
/* 深色主题：白玻璃会过于抢眼，换成暗玻璃 + 浅色图标 */
body[data-ds-dark-theme] .dsh-ds-theme-toggle {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18), 0 2px 6px rgba(0, 0, 0, 0.32);
  color: #e5e7eb;
}
.dsh-ds-theme-toggle:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.14));
  color: var(--dsw-alias-label-primary, #111827);
}
.dsh-ds-theme-toggle:active {
  background: var(--dsw-alias-interactive-bg-active, rgba(127, 127, 127, 0.2));
}
.dsh-ds-theme-toggle:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  outline-offset: 1px;
}
.dsh-ds-theme-toggle svg { display: block; pointer-events: none; }
.dsh-ds-theme-toggle { -webkit-app-region: no-drag; }

/* ============ Windows 标题栏（caption）配色 ============
   DSH 桌面端用 titleBarOverlay 画最小化/最大化/关闭，颜色来自两个令牌：
   底色 = --dsw-specific-sidebar-fill（正是本插件覆盖成半透明的那一个，所以
   标题栏条与侧边栏同色系），符号色 = --dsw-alias-label-primary。
   preload 里挂了一个隐藏 span 探测这两个令牌的 computed 值：
     probe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;
       background-color:var(--dsw-specific-sidebar-fill);
       color:var(--dsw-alias-label-primary)";
   然后把 background-color / color 规范成 rgba 经
   dsh-desktop:windows-appearance 交给主进程 setTitleBarOverlay。
   问题：Windows 系统为浅色、应用为深色主题时，符号色跟着「应用令牌」
   走会落到近黑的 #0f1115，压在深蓝条上几乎看不见（实测符号亮度 ~60/255，
   与条带 ~50 的亮度几乎重合）。这里直接把探测元素的计算色钉死成
   与条带对比明显的一档；下一次哨兵重算（主题/样式变更）就会把正确颜色
   发出去，主进程收到 rgba 后立即重设 caption。 */
body > span[style*="--dsw-specific-sidebar-fill"] {
  color: #10151c !important;
}
body[data-ds-dark-theme] > span[style*="--dsw-specific-sidebar-fill"] {
  color: #e8eef9 !important;
}

/* 无活跃会话时的兜底座位（shell.overlay，root 级）：会话 header 整块不存在，
   utilities 插槽不渲染，按钮改为固定定位贴在右上角 */

.dsh-ds-theme-toggle--floating {
  position: fixed;
  /* 14px 会落在窗口标题栏的拖拽区里：Electron 的 -webkit-app-region: drag
     会先把鼠标事件吃掉，按钮看起来「能 hover、点了没反应」。46px 在标题栏
     之下、图标行（约 y=76 起）之上，既不挡应用按钮也不被拖拽区吃掉。 */
  top: 46px;
  right: 20px;
  z-index: 30;
  pointer-events: auto;
  /* 万一宿主把按钮所在层也标成拖拽区，这一行确保它自己可点 */
  -webkit-app-region: no-drag;
  color: var(--dsw-alias-label-primary, #111827);
}

`;
      document.head.appendChild(styleTag);
    }
/*!
 * dsh-deepseek-bg.js
 * DeepSeek 官网首页背景完整复刻（背景颜色 + 动画效果），作为 DSH Web GUI 的全屏固定背景。
 *
 * 移植自 www.deepseek.com 首页 hero（浅色：粒子极光 + 蓝色星座网格）与
 * www.deepseek.com/harness 落地页 hero（深色：3D 流体极光 + 白色星座网格）。
 * 两套 WebGL shader（flowmap / particle / fluid）、渲染循环、参数配置均从
 * DeepSeek 官方打包产物中原样提取。
 *
 * 行为与官方一致：
 *  - WebGL2 粒子/流体极光（30fps 节流、DPR 上限 1.5、IntersectionObserver 暂停）
 *  - 2D 星座网格（90px 间距、鼠标斥力弹簧物理、140px 交互半径）
 *  - 主题自适应：跟随 body[data-ds-dark-theme]（含 fallback 到 prefers-color-scheme）
 *  - 触屏设备跳过星座网格；prefers-reduced-motion 时渲染单帧静态
 *  - Windows 平台不做鼠标流体笔刷（与官方一致）
 */
function apply(ctx) {
  "use strict";
  /* 重载时先拆掉上一版留下的背景层，再完整重建 —— 否则 HMR 换了 bundle
     却因为旧实例还在而看不到任何改动。 */
  /* 旧实例的收尾不在这里做：模块体开头那处 guard 已经调用过上一个实例的
     __dshDsDispose（那时它还没被新实例覆盖），会停循环、释放 WebGL 上下文、
     摘掉旧 DOM。走到 apply() 时 window.__dshDsDispose 已经指向新实例，再调用
     一次等于当场把刚建好的背景拆掉 —— 之前就是踩了这个坑。 */
  window.__dshDeepSeekBg = true;

  if (typeof document === "undefined") return;

  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  /* 系统「减少动态效果」开关：浏览器会把它报成 true。本插件是纯装饰背景，
     真按它冻结的话鲸鱼只画一帧、也不挂 mousemove —— 用户反馈「看不到鲸鱼、没有交互」
     正是这个原因（Windows 上「动画效果」关闭即命中）。所以这里只把这项偏好用于
     降低最贵的流体极光开销，鲸鱼/星座的渲染循环与鼠标交互保持开启。 */
  var prefersReducedMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var reducedMotion = false;
  var coarse = window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var isWindows = (navigator.userAgentData && navigator.userAgentData.platform === "Windows") ||
    navigator.userAgent.indexOf("Windows") !== -1;

  /* ------------------------------------------------------------------ *
   * 主题检测
   * ------------------------------------------------------------------ */
  function detectDark() {
    var b = document.body;
    var d = document.documentElement;
    if (b && b.hasAttribute("data-ds-dark-theme")) return true;
    if (d && d.hasAttribute("data-ds-dark-theme")) return true;
    if (b && b.hasAttribute("data-ds-light-theme")) return false;
    if (d && d.hasAttribute("data-ds-light-theme")) return false;
    if (d && d.dataset) {
      if (d.dataset.theme === "dark") return true;
      if (d.dataset.theme === "light") return false;
    }
    return !!(darkQuery && darkQuery.matches);
  }

  /* ------------------------------------------------------------------ *
   * 官方参数配置
   *   浅色：www.deepseek.com 首页 hero（particle 渲染）
   *   深色：www.deepseek.com/harness hero（fluid 渲染）
   * ------------------------------------------------------------------ */
  var LIGHT_AURORA = {
    type: "particle",
    mouseRadius: 0.22, mouseStrength: 1.1, mouseSmoothing: 0.12, mouseVelocity: 0.15,
    decay: 0.96, distortBoost: 1.35, noiseBoost: 0, swirlBoost: 0.45,
    glowIntensity: 0, glowColors: ["#ffffff", "#ffffff", "#ffffff"],
    speed: 14, distortion: 20, swirl: 12, swirlIterations: 8,
    scale: 0.5, rotation: -5, proportion: 50, softness: 100, shapeScale: 10,
    offsetX: 0, offsetY: 65,
    colors: ["#8AA3D6", "#FFFFFF", "#FFFFFF"],
    lightX: 0.89, lightY: 0.46, lightCore: 0, lightHalo: 0, vignette: 0, lightFollow: 0,
    bloomThreshold: 0.61, bloomRange: 0.18, bloomStrength: 0, grain: 0
  };

  /* 官方深色 hero（www.deepseek.com/harness）参数，逐项取自缓存
     page-07f506a1408ad0e8.js 中的 k 配置（fluid 渲染） */
  var DARK_AURORA = {
    type: "fluid",
    mouseRadius: 0.09, mouseStrength: 1.8, mouseSmoothing: 0.1, mouseVelocity: 0.2,
    decay: 0.925, distortBoost: 2.2, noiseBoost: 0.3, swirlBoost: 0.8,
    glowIntensity: 0.13, glowColors: ["#fff7d1", "#538dca", "#2d448b"],
    speed: 28, distortion: 18, swirl: 20, swirlIterations: 12,
    scale: 1.77, rotation: 15, proportion: 60, softness: 80, shapeScale: 0,
    offsetX: -124, offsetY: -48,
    colors: ["#000000", "#1A3870", "#204a7e", "#eed8aa", "#000000"],
    lightX: 0.89, lightY: 0.46, lightCore: 0.14, lightHalo: 0.2, vignette: 0.38, lightFollow: 0.63,
    bloomThreshold: 0.61, bloomRange: 0.18, bloomStrength: 0.4, grain: 0.005
  };

  /* 作者原值 0.1 / 0.2 是给官网白底调的；本插件的浅色底是中蓝，
     同样不透明度在蓝底上几乎看不见，所以按亮度差补了一档。 */
  var LIGHT_CONSTELLATION = { lineColor: "rgba(60, 100, 160,", dotColor: "rgba(60, 100, 160,", lineOpacity: 0.16, dotOpacity: 0.3, round: true };
  var DARK_CONSTELLATION = { lineColor: "rgba(190, 214, 255,", dotColor: "rgba(214, 230, 255,", lineOpacity: 0.16, dotOpacity: 0.26, round: false };

  var state = { dark: detectDark() };

  /* 主题切换的那 500ms 里，让极光/星座/鲸鱼三条 requestAnimationFrame 循环
     先停一下：交叉淡入是 CSS 在做，WebGL 每帧都在抢主线程，切换就会顿。
     用「暂停到某个时间点」而不是 pause/resume 配对，是为了避免切太快时
     某个循环被 resume 漏掉而永久卡住 —— 时间一到自己就恢复。 */
  var dsAnimPauseUntil = 0;
  function dsAnimPaused(now) { return now < dsAnimPauseUntil; }

  /* ------------------------------------------------------------------ *
   * 弹窗门控
   *   背景动画只在官方弹窗 / 菜单 / 下拉打开时暂停 —— 弹窗是 fixed 浮层，
   *   背后的画布继续重绘会让浮层边缘「一闪一闪」。关掉弹窗立刻恢复。
   *   打字、流式输出不再冻结背景：之前输入后 1.2s 冻结三条循环，
   *   用户反馈「一打字背景整块卡住」，所以输入门控整体移除。
   *   ?skin=live 可关闭门控（排查用）。
   * ------------------------------------------------------------------ */
  var skinLive = false;
  try { skinLive = typeof location !== "undefined" && /[?&]skin=live\b/.test(location.search); } catch (skinLiveError) { /* ignore */ }
  var busyDialog = false;
  var dsDisposed = false;
  var skinCtl = null;
  var themeCleanup = [];
  function nowMs() { return (window.performance && window.performance.now) ? window.performance.now() : Date.now(); }

  /* 把三条循环整体按到「某个时间点之前」再自动恢复（续用上面那套到点恢复的
     写法，避免 pause/resume 配对漏掉一次就永久卡死）。
     用途：主题切换、模块/会话切换这类「界面正在整树重排」的窗口 —— 这时背景
     每帧还在做全屏绘制 + 合成，和页面重排抢同一份预算，切换手感就发涩。
     窗口期一过自动续播，用户看到的是「切过去之后背景继续动」。 */
  function pauseAnimations(ms) {
    var until = nowMs() + ms;
    if (until > dsAnimPauseUntil) dsAnimPauseUntil = until;
  }
  function isBusy() {
    if (skinLive) return false;
    return busyDialog;
  }

  function currentAuroraConfig() { return state.dark ? DARK_AURORA : LIGHT_AURORA; }
  function currentConstellation() { return state.dark ? DARK_CONSTELLATION : LIGHT_CONSTELLATION; }

  /* ------------------------------------------------------------------ *
   * DOM 骨架
   * ------------------------------------------------------------------ */
  /* 上一份实例如果还活着（插件被重新 activate、HMR、重复 apply），先彻底收掉。
     不收的话每次激活都多一个活着的 WebGL context，Chromium 允许的上下文数量
     有限，十几次之后就会抛 "Too many active WebGL contexts. Oldest context
     will be lost."，把最老的上下文（往往就是极光）丢掉 —— 表现是极光突然
     不亮、动画发卡。 */
  if (typeof window.__dshDsDispose === "function") {
    try { window.__dshDsDispose(); } catch (disposeError) { /* 旧实例清理失败不影响新实例 */ }
    window.__dshDsDispose = null;
  }
  var container = document.createElement("div");
  container.id = "dsh-ds-bg";
  container.dataset.version = "32"; // 部署版本标记：页面控制台可查 document.getElementById('dsh-ds-bg')?.dataset.version
  // 关键样式内联兜底：即使外部 CSS 未加载，背景层也保持 fixed + 底层
  container.style.cssText = "position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;" +
    "background:transparent;" +
    "animation:dsh-ds-enter 1.8s ease-out backwards;will-change:opacity,filter;";
  var MASK = "linear-gradient(#000000fc 0%,#000000e8 8.98%,transparent 100%)";
  /* 底色拆成「浅色层 + 深色层」两张叠在一起的纯色/渐变层：切主题时只切换两层
     的 opacity（CSS transition），背景就是淡入淡出而不是硬切。
     以前是直接改 container.style.background —— 渐变缩写在 CSS 里不可动画，
     所以每次切换都是「啪」地一下跳过去。 */
  var lightLayer = document.createElement("div");
  lightLayer.id = "dsh-ds-bg-light";
  lightLayer.className = "dsh-ds-bg-layer";
  /* 注意：这里绝对不能写 inline opacity —— inline 样式优先级高于样式表，
       .dsh-ds-dark 的 opacity:0 永远盖不过它，深色下浅色渐变会一直糊在上面。 */
  lightLayer.style.cssText = "position:absolute;inset:0;background:linear-gradient(180deg,#9cc1e7 0%,rgba(250,250,250,0) 100%),#f9f8f8;";
  var darkLayer = document.createElement("div");
  darkLayer.id = "dsh-ds-bg-dark";
  darkLayer.className = "dsh-ds-bg-layer";
  /* 深色底 = origin 原版 #0a0a0a，顶部加一层几乎看不出来的深蓝辉光（最亮处
     也只有 #0d1622），既保留「深蓝」的冷调，又不会像之前那版藏蓝渐变那样发亮。 */
  darkLayer.style.cssText = "position:absolute;inset:0;" +
      "background:radial-gradient(165% 115% at 50% -8%, #14385c 0%, #102a45 22%, #0b1a2b 45%, #080f18 70%, #06080c 100%);";
  container.appendChild(lightLayer);
  container.appendChild(darkLayer);
  var auroraCanvas = document.createElement("canvas");
  auroraCanvas.id = "dsh-ds-aurora";
  auroraCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;" +
    "mask:" + MASK + ";-webkit-mask:" + MASK + ";";
  var constellationCanvas = document.createElement("canvas");
  constellationCanvas.id = "dsh-ds-constellation";
  constellationCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;background:transparent;" +
    "mask:" + MASK + ";-webkit-mask:" + MASK + ";";
  container.appendChild(auroraCanvas);
  // 官方 hero 鲸鱼层（仅暗色主题显示）：粒子化鲸鱼，光线跟随鼠标互动
  // （官网用 R3F DigitileR3F 懒加载实现，未被缓存抓取；此处用官方鲸鱼路径
  //   重建粒子引擎，交互原理一致：lightParams 的 followX/range/shadeMin/shadeMax）
  var whaleLayer = document.createElement("div");
  whaleLayer.className = "dsh-ds-whale";
  whaleLayer.setAttribute("aria-hidden", "true");
  whaleLayer.style.cssText = "position:absolute;inset:0;display:none;align-items:center;justify-content:center;" +
    "pointer-events:none;mix-blend-mode:screen;z-index:2;";
  var whaleCanvas = document.createElement("canvas");
  whaleCanvas.className = "dsh-ds-whale-canvas";
  whaleCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
  whaleLayer.appendChild(whaleCanvas);
  container.appendChild(whaleLayer);
  container.appendChild(constellationCanvas);

  /* 把这一份实例的收尾逻辑暴露出去：停掉三条动画循环 + 释放两个 WebGL 上下文
     + 摘掉 DOM。下一次 activate 进来会先调用它。 */
  var instanceDisposed = false;
  window.__dshDsDispose = function () {
    if (instanceDisposed) return;
    instanceDisposed = true;
    dsDisposed = true;
    dsAnimPauseUntil = Infinity;
    if (skinCtl && typeof skinCtl.dispose === "function") {
      try { skinCtl.dispose(); } catch (skinCtlError) { /* ignore */ }
      skinCtl = null;
    }
    for (var ci = 0; ci < themeCleanup.length; ci += 1) {
      try { themeCleanup[ci](); } catch (cleanupError) { /* ignore */ }
    }
    themeCleanup.length = 0;
    window.__dshDsPunchOnce = null;
    window.__dshDsRefreshShell = null;
    window.__dshSkinStats = null;
    try {
      document.documentElement.style.removeProperty("background");
      if (document.body) document.body.style.removeProperty("background");
    } catch (pageStyleError) { /* ignore */ }
    try {
      [auroraCanvas, whaleCanvas].forEach(function (c) {
        var g = c && c.__dsGL;
        if (g && typeof g.getExtension === "function") {
          var lc = g.getExtension("WEBGL_lose_context");
          if (lc && typeof lc.loseContext === "function") lc.loseContext();
        }
      });
    } catch (glError) { /* 上下文已经丢了就跳过 */ }
    if (container.parentNode) container.parentNode.removeChild(container);
  };

  /* 登记到实例表：下次 bundle 重新执行时逐个拆掉，避免旧实例泄漏。 */
  (window.__dshDsSkinInstances = window.__dshDsSkinInstances || []).push(window.__dshDsDispose);

  /* 诊断信息（?dshtest=1 时输出到页面面板） */
  var diag = { theme: "?", bodyBg: "?", htmlBg: "?", containerPos: "?", containerZ: "?", containerBg: "?", frameFound: false, frameBg: "?", auroraGL: false, auroraProgs: "", constellation: false, canvasW: 0, canvasH: 0 };



  var lastAppliedDark = null;
  function applyThemeClass() {
    var themeChanged = lastAppliedDark !== null && lastAppliedDark !== state.dark;
    lastAppliedDark = state.dark;
    container.classList.toggle("dsh-ds-dark", state.dark);
    /* 切换的那 420ms 内给宿主界面挂上颜色过渡，和背景的淡入淡出同步；
       平时不挂，避免把 hover 反馈也拖慢。 */
    if (themeChanged && document.body) {
      /* 切换期间把三条动画循环按下 360ms（比 300ms 的淡入多 60ms 余量）：
         交叉淡入本身是 CSS 合成层，不需要每帧重画 WebGL；
         暂停后切换只跑一次合成，不再和 GPU 抢主线程。 */
      pauseAnimations(360);
      document.body.classList.add("dsh-ds-theme-anim");
      clearTimeout(window.__dshDsThemeAnimTimer);
      window.__dshDsThemeAnimTimer = setTimeout(function () {
        document.body.classList.remove("dsh-ds-theme-anim");
      }, 420);
    }
    /* 底色不再写在这里：浅色渐变/深色纯色各是一层（lightLayer / darkLayer），
       由 .dsh-ds-dark 类切换 opacity，CSS transition 负责淡入淡出。 */
    container.style.setProperty("background", "transparent", "important");
    whaleLayer.style.display = "flex";
    /* 浅色下鲸鱼淡一点（官方 hero 里它是一层很轻的粒子），深色保持 1 */
    whaleLayer.style.opacity = state.dark ? "1" : "0.72";
    /* 混合模式必须写成内联：上面 DOM 骨架的 cssText 里写死了 mix-blend-mode:screen，
       内联优先级高于样式表，CSS 里的 normal 根本盖不住。深色用 screen（加亮发光），
       浅色必须 normal —— 白色粒子 + screen 会把整屏漂成纯白（实测 mean 241、#ffffff 占 74%）。 */
    whaleLayer.style.mixBlendMode = state.dark ? "screen" : "normal";
    // 两种主题都要让背景透出（整屏背景），body 一律透明
    if (document.body) document.body.style.setProperty("background", "transparent", "important");
    // 主题切换后立刻重跑外壳玻璃化（玻璃色随主题变，不能等 800ms 轮询）
    if (typeof window.__dshDsRefreshShell === "function") {
      try { window.__dshDsRefreshShell(); } catch (refreshError) { /* ignore */ }
    }
  }
  applyThemeClass();

  function boot() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", boot); return; }
    // body 背景透明化由 applyThemeClass 按主题管理（浅色主题保持官方原版）
    applyThemeClass();
    document.body.appendChild(container);
    /* 入场动画（1.8s，含 filter: blur）结束后必须撤掉 will-change：
       否则浏览器会为了这个 filter 永久保留一张全屏渲染表面，静止时也在
       多付一次全屏滤镜合成。reduced-motion 下没有动画、animationend 不触发，
       用定时器兜底。 */
    var enterCleaned = false;
    function endEnterAnimation() {
      if (enterCleaned) return;
      enterCleaned = true;
      container.style.willChange = "auto";
      container.removeEventListener("animationend", onEnterAnimationEnd);
    }
    function onEnterAnimationEnd(e) {
      if (e && e.animationName && e.animationName !== "dsh-ds-enter") return;
      endEnterAnimation();
    }
    container.addEventListener("animationend", onEnterAnimationEnd);
    setTimeout(endEnterAnimation, 2400);
    startAurora();
    if (typeof location === "undefined" || location.search.indexOf("nowhale") === -1) startWhale();
    if (!coarse || reducedMotion) startConstellation();
    observeTheme();
    skinCtl = makeShellTransparent();
    if (typeof location !== "undefined" && (location.search.indexOf("dshtest") !== -1)) startDiagPanel();
    // 调试钩子：?opencv=1 时展开侧边栏并打开第一个会话（检查真实消息 DOM 的代码块类名）
    if (typeof location !== "undefined" && location.search.indexOf("opencv") !== -1) {
      setTimeout(function () {
        var toggle = document.querySelector(".hHd-Xa_toggle, [aria-label*=\"sidebar\"], [aria-label*=\"侧边栏\"]");
        if (toggle) toggle.click();
        setTimeout(function () {
          var first = document.querySelector('.qDHVXG_listArea [role="button"], .qDHVXG_listArea button, [data-slot="sidebar.workspaces"] [role="button"]');
          if (first) first.click();
          setTimeout(function () {
            var codes = document.querySelectorAll("pre, [class*=\"_block_\"], [class*=\"_banner\"], [class*=\"_body\"], code");
            var dump = document.createElement("div");
            dump.id = "dsh-dbg-codes";
            dump.style.display = "none";
            var cls = [];
            for (var i = 0; i < codes.length; i++) {
              var c = codes[i].className;
              if (typeof c === "string" && c) cls.push(c.split(" ")[0]);
            }
            dump.setAttribute("data-classes", cls.join(","));
            document.body.appendChild(dump);
          }, 3000);
        }, 2500);
      }, 3500);
    }
    // 调试钩子：?opendbg=1 时自动打开设置页（用于无头浏览器检查设置页布局）
    if (typeof location !== "undefined" && location.search.indexOf("opendbg") !== -1) {
      setTimeout(function () {
        var triggers = document.querySelectorAll('button, [role="button"]');
        for (var i = 0; i < triggers.length; i++) {
          var t = triggers[i];
          var label = (t.getAttribute("aria-label") || t.textContent || "").toLowerCase();
          if (label.indexOf("settings") !== -1 || label.indexOf("设置") !== -1) { t.click(); break; }
        }
        setTimeout(function () {
          var panel = document.querySelector(".VOzbGW_panel");
          var dump = document.createElement("div");
          dump.id = "dsh-dbg-settings";
          dump.style.display = "none";
          dump.setAttribute("data-opened", panel ? "yes" : "no");
          if (panel) dump.setAttribute("data-html", panel.outerHTML.slice(0, 20000));
          document.body.appendChild(dump);
        }, 2500);
      }, 4000);
    }
  }

  /* ------------------------------------------------------------------ *
   * 诊断面板（?dshtest=1）：把计算样式与引擎状态渲染到页面
   * ------------------------------------------------------------------ */
  function startDiagPanel() {
    function collect() {
      var cs = function (el) { try { return window.getComputedStyle(el); } catch (e) { return null; } };
      var bcs = cs(document.body);
      var hcs = cs(document.documentElement);
      var ccs = cs(container);
      var frame = document.querySelector('[data-slot="root"] .pI_x6G_frame') ||
        document.querySelector('[data-slot="root"] > div');
      var fcs = frame ? cs(frame) : null;
      diag.theme = state.dark ? "dark" : "light";
      diag.bodyBg = bcs ? bcs.backgroundColor : "?";
      diag.htmlBg = hcs ? hcs.backgroundColor : "?";
      diag.containerPos = ccs ? ccs.position : "?";
      diag.containerZ = ccs ? ccs.zIndex : "?";
      diag.containerBg = ccs ? (ccs.backgroundImage + " / " + ccs.backgroundColor) : "?";
      diag.frameFound = !!frame;
      diag.frameBg = fcs ? fcs.backgroundColor : "?";
      diag.canvasW = auroraCanvas.width;
      diag.canvasH = auroraCanvas.height;
    }
    collect();
    var panel = document.createElement("pre");
    panel.id = "dsh-ds-diag";
    panel.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:2147483000;background:#fff;color:#000;" +
      "font:11px/1.5 monospace;padding:10px 12px;border:2px solid #f00;max-width:520px;white-space:pre-wrap;";
    document.body.appendChild(panel);
    function render() {
      collect();
      panel.textContent = [
        "dsh-deepseek-bg v3 diagnostics",
        "theme: " + diag.theme,
        "body bg: " + diag.bodyBg,
        "html bg: " + diag.htmlBg,
        "container: pos=" + diag.containerPos + " z=" + diag.containerZ + " bg=" + diag.containerBg,
        "frame found: " + diag.frameFound + " bg=" + diag.frameBg,
        "aurora: gl=" + diag.auroraGL + " progs=[" + diag.auroraProgs + "]",
        "constellation: " + diag.constellation,
        "canvas: " + diag.canvasW + "x" + diag.canvasH
      ].join("\n");
    }
    render();
    setInterval(render, 1000);
  }

  /* ------------------------------------------------------------------ *
   * 外壳透明化（内联样式，最强优先级；轮询等待应用外壳挂载）
   * ------------------------------------------------------------------ */
  function makeShellTransparent() {
    // 深色主题要设置/撤销的内联样式属性集合
    var GLASS_PROPS = ["background", "background-color", "backdrop-filter", "-webkit-backdrop-filter",
      "box-shadow", "border-right-color", "border-color"];
    function clearInline(el) {
      if (!el || !el.style) return;
      for (var i = 0; i < GLASS_PROPS.length; i++) el.style.removeProperty(GLASS_PROPS[i]);
    }
    /* 兜底穿透：不依赖任何 CSS Modules 哈希类名。
       扫描 body 下所有元素，凡是「不透明 + 覆盖面积 >= 视口 25%」的整块表面，
       一律打 inline `background: transparent !important`。
       这样即使官方类名换了哈希、或插槽 anchor 是 display:contents 导致祖先选择器失效，
       背景层依然能透出来。 */
    var OWN_SELECTOR = "#dsh-ds-bg, #dsh-ds-diag";
    /* 设置页 / 弹窗 / 下拉菜单 / 选择器：这些面板要保留官方不透明外观，
       穿透器与玻璃化都必须跳过（面板同样占大面积，会被误伤成透明）。 */
    var PANEL_SELECTOR = '[role="dialog"], [role="menu"], [role="listbox"], [aria-modal="true"]';
    function inPanel(el) {
      try { return !!(el.closest && el.closest(PANEL_SELECTOR)); } catch (panelError) { return false; }
    }
    function alphaOf(bg) {
      if (!bg || bg === "transparent") return 0;
      var m = /rgba?\(([^)]+)\)/.exec(bg);
      if (!m) return 1;
      var parts = m[1].split(/[,\s\/]+/).filter(function (s) { return s.length > 0; });
      if (parts.length > 3) {
        var a = parseFloat(parts[3]);
        return isNaN(a) ? 1 : a;
      }
      return 1;
    }
    /* 只处理布局主脊（插槽 anchor 的祖先链 + 它们的直接子元素）。
       不要按「面积占比」盲扫整棵树 —— 设置页 / 弹窗 / 菜单也是大块不透明表面，
       会被误伤成透明（用户反馈「打开其他面板背景也变透明」）。 */
    function punchSpine() {
      var out = [];
      function add(node) { if (node && node !== document.body && out.indexOf(node) === -1) out.push(node); }
      var anchors;
      try { anchors = document.querySelectorAll("[data-slot]"); } catch (anchorError) { return out; }
      for (var i = 0; i < anchors.length; i += 1) {
        var node = anchors[i].parentElement;
        while (node && node !== document.body) { add(node); node = node.parentElement; }
        var kids = anchors[i].children;
        for (var k = 0; k < kids.length; k += 1) add(kids[k]);
      }
      return out;
    }

    /* 深穿透：会话列 / 详情列等表面往往藏在插槽 anchor 的更深层，
       只处理「祖先链 + 直接子元素」打不到它们（浅色下表现为整片纯白挡住背景）。
       这里在插槽子树里再往下找「不透明 + 面积 >= 视口 25%」的整块表面，
       面板（dialog/menu/listbox/aria-modal）依旧豁免。

       分片执行：会话 / 工作区切换会瞬间挂上几千个节点，一次性
       getComputedStyle + getBoundingClientRect 会把主线程按住几十毫秒
       （用户感知就是「切换时卡一下」）。现在每次只跑约 4ms，
       没跑完的排到下一帧继续，UI 照常渲染。 */
    var PUNCH_TAGS = { DIV: 1, SECTION: 1, MAIN: 1, ASIDE: 1, ARTICLE: 1, HEADER: 1, FOOTER: 1, NAV: 1, UL: 1, OL: 1, TABLE: 1, FORM: 1, DIALOG: 1 };
    var punchJob = null;
    var punchDirty = false;

    function punchSlice(deadline) {
      var job = punchJob;
      if (!job) return true;
      var vw = window.innerWidth || 0;
      var vh = window.innerHeight || 0;
      var minArea = vw * vh * 0.25;
      var spineArea = vw * vh * 0.02;
      /* 阶段 0：主脊（插槽 anchor 的祖先链 + 直接子元素）。
         旧版在 punchThrough 里同步扫完，deep 扫描每次都要几百次
         getComputedStyle + getBoundingClientRect；切换视图时正好赶上
         deep，于是「切一下卡一下」。现在同样按 4ms 分片。 */
      while (job.si < job.spine.length) {
        if (deadline && nowMs() > deadline) return false;
        var se = job.spine[job.si];
        job.si += 1;
        if (!se || !se.style) continue;
        if (se.closest && se.closest(OWN_SELECTOR)) continue;
        if (inPanel(se)) continue;
        var scs;
        try { scs = window.getComputedStyle(se); } catch (spineStyleError) { continue; }
        if (!scs) continue;
        var sOpaque = alphaOf(scs.backgroundColor) > 0.02;
        var sPainted = scs.backgroundImage && scs.backgroundImage !== "none";
        if (!sOpaque && !sPainted) continue;
        var srect;
        try { srect = se.getBoundingClientRect(); } catch (spineRectError) { continue; }
        if (srect.width * srect.height < spineArea) continue;
        try { se.style.setProperty("background", "transparent", "important"); } catch (spineWriteError) { /* ignore */ }
      }
      while (job.ai < job.anchors.length) {
        if (!job.nodes) {
          try { job.nodes = job.anchors[job.ai].querySelectorAll("*"); } catch (childError) { job.nodes = null; }
          job.ni = 0;
          if (!job.nodes || !job.nodes.length) { job.ai += 1; job.nodes = null; continue; }
        }
        while (job.ni < job.nodes.length) {
          if (deadline && nowMs() > deadline) return false;
          var el = job.nodes[job.ni];
          job.ni += 1;
          if (!PUNCH_TAGS[el.tagName]) continue;
          if (el.closest && el.closest(OWN_SELECTOR)) continue;
          if (inPanel(el)) continue;
          var cs;
          try { cs = window.getComputedStyle(el); } catch (styleError) { continue; }
          if (!cs || alphaOf(cs.backgroundColor) <= 0.9) continue;
          if (cs.position === "fixed") continue;
          if (cs.position === "absolute" && (parseInt(cs.zIndex, 10) || 0) >= 20) continue;
          var rect;
          try { rect = el.getBoundingClientRect(); } catch (rectError) { continue; }
          if (rect.width * rect.height < minArea) continue;
          try { el.style.setProperty("background-color", "transparent", "important"); } catch (writeError) { /* ignore */ }
        }
        job.ai += 1;
        job.nodes = null;
      }
      return true;
    }

    function runPunchJob() {
      if (dsDisposed) return;
      punchJob = { spine: [], si: 0, anchors: [], ai: 0, nodes: null, ni: 0 };
      try { punchJob.spine = punchSpine(); } catch (spineError) { punchJob.spine = []; }
      try { punchJob.anchors = document.querySelectorAll("[data-slot]"); } catch (anchorError) { punchJob.anchors = []; }
      punchDirty = false;
      function step() {
        if (dsDisposed) { punchJob = null; return; }
        var done = false;
        try { done = punchSlice(nowMs() + 4); } catch (sliceError) { done = true; }
        if (!done) { requestAnimationFrame(step); return; }
        punchJob = null;
        if (punchDirty) runPunchJob();
      }
      requestAnimationFrame(step);
    }

    function startPunchJob() {
      if (dsDisposed) return;
      punchDirty = true;
      if (!punchJob) runPunchJob();
    }

    function punchThrough() {
      if (!document.body) return;
      var vw = window.innerWidth || document.documentElement.clientWidth || 0;
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      if (!vw || !vh) return;
      var minArea = vw * vh * 0.02;
      // 先保证画布本身透明（否则 z-index:-1 的背景层会被 body 底色吃掉）
      try {
        document.documentElement.style.setProperty("background", "transparent", "important");
        document.body.style.setProperty("background", "transparent", "important");
      } catch (rootError) { /* ignore */ }
      try { startPunchJob(); } catch (deepError) { /* ignore */ }
    }

        function apply(deep) {
      // 浅色主题也保留整屏背景：不再撤销覆盖，直接走同一套穿透 + 玻璃拟态。
      // 0) 兜底：不依赖哈希类名，把覆盖面积 >= 25% 视口的不透明表面全部打透。
      //    深度兜底（punchThrough 会走插槽后代）只在 settle / 主题切换 /
      //    外壳级变更时跑，消息流式追加不会触发。
      if (deep !== false) punchThrough();

      var frame = document.querySelector('[data-slot="root"] .pI_x6G_frame') ||
        document.querySelector('[data-slot="root"] > div');
      if (frame && frame.style) {
        diag.frameFound = true;
        diag.frameBg = window.getComputedStyle ? window.getComputedStyle(frame).backgroundColor : "?";
        frame.style.setProperty("background", "transparent", "important");
      }
      var bootEl = document.querySelector("#root ._boot_9gj4p_6");
      if (bootEl && bootEl.style) {
        bootEl.style.setProperty("background", "transparent", "important");
      }
      // 视图根容器（会话视图等全高不透明层）同样透明化
      var views = document.querySelectorAll('[data-slot="conversation"] > div, .pI_x6G_detailsCol > div, .pI_x6G_centerCol, .pI_x6G_detailsCol, .wSkVaW_root, .ydkMvW_root');
      for (var i = 0; i < views.length; i++) {
        var v = views[i];
        if (v && v.style) v.style.setProperty("background", "transparent", "important");
      }
      // 官方玻璃拟态（ds-glass 令牌：blur 12px + 半透明表面色 + 官方边框/阴影）
      // 浅色主题用白色玻璃，深色主题用深色玻璃
      var glassBg = state.dark ? "rgba(13,15,19,.55)" : "rgba(255,255,255,.10)";
      var glassBorder = state.dark ? "hsla(0,0%,100%,.08)" : "rgba(15,23,42,.08)";
      var glassRing = state.dark ? "inset 0 0 0 1px hsla(0,0%,100%,.08)" : "inset 0 0 0 1px rgba(15,23,42,.07)";
      var glassShadow = state.dark
        ? "0 0 1px 0 rgba(0,0,0,.2), 0 0 4px 0 rgba(0,0,0,.02), 0 12px 32px 0 rgba(0,0,0,.08)"
        : "0 0 1px 0 rgba(15,23,42,.06), 0 12px 32px 0 rgba(15,23,42,.08)";
      var side = document.querySelector(".pI_x6G_sidebarCol");
      if (side && side.style) {
        // 注意：backdrop-filter 会让侧边栏成为 fixed 后代的包含块（设置弹窗错乱），
        // 所以列本身不设 backdrop-filter，模糊由 CSS 的 ::before 伪元素承担
        side.style.setProperty("background", glassBg, "important");
        side.style.setProperty("border-right-color", glassBorder, "important");
      }
      var sideRoot = document.querySelector(".hHd-Xa_root, [data-slot=\"sidebar\"] > div");
      if (sideRoot && sideRoot.style) {
        // 注意：不能给侧边栏内容根加 z-index/堆叠上下文——设置弹窗（fixed z-1000）
        // 挂载在侧边栏内部，被困在侧边栏堆叠上下文里会被输入框（z-7）盖住；
        // 模糊由 CSS 的 ::before z-index:-1 承担，内容自然在模糊层之上
        sideRoot.style.setProperty("background", "transparent", "important");
      }
      var card = document.querySelector(".uV2eYG_card, [data-composer-card=\"true\"]");
      if (card && card.style) {
        card.style.setProperty("background", glassBg, "important");
        card.style.setProperty("border-color", glassBorder, "important");
        card.style.setProperty("box-shadow", glassShadow, "important");
      }
      var seat = document.querySelector(".wSkVaW_composerSeat, [data-composer-seat]");
      if (seat && seat.style) seat.style.setProperty("background", "transparent", "important");
      // 会话列表底部渐隐条（qDHVXG_fade）：玻璃侧边栏下会露出浅色白条，透明化
      var fade = document.querySelector(".qDHVXG_fade");
      if (fade && fade.style) fade.style.setProperty("background", "transparent", "important");
      // 消息气泡与代码块玻璃化（与侧边栏/输入框同款材质；glassRing 已按主题取好）
      var glassEls = deep ? document.querySelectorAll(GLASS_SEL) : null;
      var glassKey = state.dark ? "dark" : "light";
      lastGlass = { bg: glassBg, ring: glassRing, key: glassKey };
      for (var gi = 0; glassEls && gi < glassEls.length; gi++) {
        var ge = glassEls[gi];
        if (!ge || !ge.style) continue;
        if (ge.getAttribute("data-dsh-skin") === glassKey) continue;
        ge.setAttribute("data-dsh-skin", glassKey);
        ge.style.setProperty("background", glassBg, "important");
        ge.style.setProperty("backdrop-filter", "blur(12px)", "important");
        ge.style.setProperty("-webkit-backdrop-filter", "blur(12px)", "important");
        ge.style.setProperty("box-shadow", glassRing, "important");
      }
    }

    /* ------------------------------------------------------------------ *
     * 外壳扫描调度器（替代旧的「800ms×75 轮询 + #root 永久 MutationObserver」）
     *   旧 apply 里的 punchInsideSlots 会对每个 [data-slot] 做
     *   querySelectorAll("*")，再逐个 getComputedStyle + getBoundingClientRect。
     *   对话流式输出时每个 token 都触发一次全量强制样式重算 + 布局。
     *   现在：MutationObserver 只把「新增元素」送进来（文本节点不算），
     *   rAF 合并，普通扫描 ≥400ms 一次；深度兜底 ≥2000ms 一次且只在外壳级
     *   变更时跑；初始 6 次 settle 之后完全由事件驱动。
     * ------------------------------------------------------------------ */
    var SHELL_SELECTORS = [
      '[data-slot="root"] .pI_x6G_frame', '[data-slot="root"] > div',
      '#root ._boot_9gj4p_6',
      '[data-slot="conversation"] > div', '.pI_x6G_detailsCol > div',
      '.pI_x6G_centerCol', '.pI_x6G_detailsCol', '.wSkVaW_root', '.ydkMvW_root',
      '.wSkVaW_composerSeat', '[data-composer-seat]',
      '[data-slot="sidebar"] > div', '.hHd-Xa_root', '.qDHVXG_fade',
      '.pI_x6G_sidebarCol', '.uV2eYG_card', '[data-composer-card="true"]'
    ];
    var GLASS_SEL = '.gdEzaW_bubble, ._block_10eou_7, ._block_biesw_7, ._block_srovd_7, ._block_s66q0_7, ._block_178r4_4, ._block_d4nqi_7, ._body_1ye18_20, ._copyButton_10eou_142, ._bannerWrap_178r4_21, [class$="_bubble"], [class*="_block_"], [class$="_bannerWrap"], [class$="_copyButton"]';
    var lastGlass = null;
    var settleTimers = [];
    var applyQueued = false;
    var queuedDeep = false;
    var lastApplyAt = 0;
    var lastDeepAt = 0;
    var stats = { scans: 0, deepScans: 0, lastScanMs: 0, maxScanMs: 0, slow: 0, slowMax: 0 };
    window.__dshSkinStats = stats;
    /* 只读诊断（不写 document.title，不影响宿主界面）：
       长任务次数 / 最长时长挂在 window.__dshSkinStats.lt / .ltMax 上，
       用户反馈卡顿时可直接在控制台读取。 */
    try {
      if (window.PerformanceObserver) {
        stats.lt = 0;
        stats.ltMax = 0;
        var ltObserver = new PerformanceObserver(function (list) {
          var entries = list.getEntries();
          for (var li = 0; li < entries.length; li += 1) {
            stats.lt += 1;
            if (entries[li].duration > stats.ltMax) stats.ltMax = Math.round(entries[li].duration);
          }
        });
        ltObserver.observe({ entryTypes: ["longtask"] });
        themeCleanup.push(function () { ltObserver.disconnect(); });
      }
    } catch (measureError) { /* ignore */ }

    function runApply(deep) {
      if (dsDisposed) return;
      var t0 = nowMs();
      stats.scans += 1;
      busyDialog = !!document.querySelector(PANEL_SELECTOR);
      try {
        if (deep) {
          stats.deepScans += 1;
          lastDeepAt = nowMs();
          /* 深度穿透只做一次：apply(deep) 内部已经调用 punchThrough()，
             punchThrough 覆盖了旧 IIFE run() 的全部效果（html/body 透明 +
             插槽后代 + 主脊），再调一次 __dshDsPunchOnce 会白扫一遍全 DOM。 */
        }
        apply(deep);
      } finally {
        var cost = nowMs() - t0;
        stats.lastScanMs = Math.round(cost * 10) / 10;
        if (cost > 16) {
          stats.slow += 1;
          if (cost > stats.slowMax) stats.slowMax = Math.round(cost * 10) / 10;
        }
        if (cost > stats.maxScanMs) stats.maxScanMs = Math.round(cost * 10) / 10;
      }
    }

    function scheduleShell(deep, immediate, reason) {
      if (dsDisposed) return;
      if (deep) queuedDeep = true;
      if (applyQueued) return;
      applyQueued = true;
      var t = nowMs();
      var wait = immediate ? 0 : Math.max(120, 400 - (t - lastApplyAt));
      if (!immediate && queuedDeep && t - lastDeepAt < 2000) wait = Math.max(wait, 2000 - (t - lastDeepAt));
      setTimeout(function () {
        applyQueued = false;
        if (dsDisposed) return;
        var deepNow = queuedDeep;
        queuedDeep = false;
        requestAnimationFrame(function () {
          if (dsDisposed) return;
          lastApplyAt = nowMs();
          runApply(deepNow);
        });
      }, wait);
    }

    /* 单元素玻璃材质：幂等，已有同主题标记就跳过 */
    function markGlassEl(el) {
      if (!el || !lastGlass || !el.style) return;
      if (el.getAttribute("data-dsh-skin") === lastGlass.key) return;
      el.setAttribute("data-dsh-skin", lastGlass.key);
      el.style.setProperty("background", lastGlass.bg, "important");
      el.style.setProperty("backdrop-filter", "blur(12px)", "important");
      el.style.setProperty("-webkit-backdrop-filter", "blur(12px)", "important");
      el.style.setProperty("box-shadow", lastGlass.ring, "important");
    }

    /* 视图切换第一帧兜底：新挂载的「载入历史…」会话底板是宿主的不透明表面，
       上一次 punch 写的行内样式随旧节点一起被卸载，于是整块会话区会先黑一下。
       MutationObserver 回调是微任务，在浏览器绘制之前执行 —— 这里只检查
       「刚新增的节点 + 最多 6 层祖先」，命中就当场打透，黑块不会出现在屏幕上。
       每批最多 8 个节点，避免流式追加时代价膨胀。 */
    function quickPunch(node) {
      if (!node || node.nodeType !== 1) return;
      if (node.closest && node.closest(OWN_SELECTOR)) return;
      var vw = window.innerWidth || 0;
      var vh = window.innerHeight || 0;
      if (!vw || !vh) return;
      var minArea = vw * vh * 0.18;
      var el = node;
      for (var depth = 0; el && el !== document.body && depth < 6; depth += 1) {
        if (el.nodeType === 1 && PUNCH_TAGS[el.tagName] && !inPanel(el)) {
          var cs = null;
          try { cs = window.getComputedStyle(el); } catch (styleError) { cs = null; }
          if (cs && alphaOf(cs.backgroundColor) > 0.95 && cs.position !== "fixed" &&
              !(cs.position === "absolute" && (parseInt(cs.zIndex, 10) || 0) >= 20)) {
            var rect = null;
            try { rect = el.getBoundingClientRect(); } catch (rectError) { rect = null; }
            if (rect && rect.width * rect.height >= minArea) {
              /* 用 background 简写：宿主的「载入历史」底板可能是纯色，也可能带
                 渐变/背景图，只清 background-color 会留下图片继续压住背景。 */
              try { el.style.setProperty("background", "transparent", "important"); } catch (writeError) { /* ignore */ }
              return;
            }
          }
        }
        el = el.parentElement;
      }
    }

    /* 「载入历史…」底板不一定就是新增节点本身，也可能在新增节点下面一层。
       这里用 BFS 从新增节点往下扫 4 层（最多 90 个节点），先把上层容器看一遍，
       命中大块不透明表面就当场清背景 —— 只查祖先的那一版会漏掉这种结构。 */
    var sweepFrames = 0;

    function sweepPunch(roots, maxNodes) {
      if (!roots || !roots.length) return;
      var vw = window.innerWidth || 0;
      var vh = window.innerHeight || 0;
      if (!vw || !vh) return;
      var minArea = vw * vh * 0.15;
      var budget = maxNodes || 90;
      var queue = [];
      var qi = 0;
      var seen = 0;
      for (var ri = 0; ri < roots.length; ri += 1) queue.push({ el: roots[ri], d: 0 });
      while (qi < queue.length && seen < budget) {
        var item = queue[qi];
        qi += 1;
        seen += 1;
        var el = item.el;
        if (!el || el.nodeType !== 1) continue;
        if (el.closest && el.closest(OWN_SELECTOR)) continue;
        if (inPanel(el)) continue;
        if (PUNCH_TAGS[el.tagName]) {
          var cs = null;
          try { cs = window.getComputedStyle(el); } catch (styleError) { cs = null; }
          if (cs && alphaOf(cs.backgroundColor) > 0.9 && cs.position !== "fixed" &&
              !(cs.position === "absolute" && (parseInt(cs.zIndex, 10) || 0) >= 20)) {
            var rect = null;
            try { rect = el.getBoundingClientRect(); } catch (rectError) { rect = null; }
            if (rect && rect.width * rect.height >= minArea) {
              try { el.style.setProperty("background", "transparent", "important"); } catch (writeError) { /* ignore */ }
            }
          }
        }
        if (item.d < 4 && queue.length < budget * 2) {
          var kids = el.children;
          for (var ki = 0; ki < kids.length; ki += 1) queue.push({ el: kids[ki], d: item.d + 1 });
        }
      }
    }

    /* 宿主也可能「先挂载透明容器、下一帧才补上不透明类名」。
       切换后的前 6 帧各复查一次（只扫会话槽前 60 个节点），6 帧后自动停。 */
    function sweepSoon() {
      if (dsDisposed) return;
      sweepFrames = 6;
      function tick() {
        if (dsDisposed || sweepFrames <= 0) return;
        sweepFrames -= 1;
        var slot = null;
        try { slot = document.querySelector('[data-slot="conversation"]'); } catch (probeError) { slot = null; }
        if (slot) { try { sweepPunch([slot], 60); } catch (sweepError) { /* ignore */ } }
        if (sweepFrames > 0) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function nodeDepth(node) {
      var d = 0;
      var p = node;
      while (p && p !== document.body && p.parentNode) {
        d += 1;
        if (d > 12) break;
        p = p.parentNode;
      }
      return d;
    }
    /* 返回值分级：0 = 与外壳无关；1 = 外壳级新增（排一次 400ms 扫描即可）；
       2 = 视图级切换（新视图整棵挂载，需要立刻做一次轻量 apply，避免白闪）。
       注意：视图级之外绝不在 MO 回调里同步 apply —— 打字 / 流式追加也会产生
       深度 <= 9 的新增节点，同步 apply 的样式写入会触发整文档重算，
       一次就是几十毫秒的长任务（用户感知：打字卡顿）。 */
    function isShellChange(node, target) {
      if (!node || node.nodeType !== 1) return 0;
      if (node.getAttribute("data-slot") || node.getAttribute("role") === "dialog") return 2;
      /* 工作区 / 会话切换：新视图整棵挂到会话容器 / 中列下面。
         只对 parent 做一次 matches（O(1)），绝不对新增子树 querySelector ——
         那会在切换瞬间同步遍历几千个节点，正是「阻塞感」的来源。 */
      if (target && target.nodeType === 1) {
        try {
          if (target.matches('[data-slot="conversation"], .pI_x6G_centerCol, .pI_x6G_detailsCol, .pI_x6G_frame, [data-slot="root"]')) return 2;
        } catch (probeError) { /* ignore */ }
      }
      if (nodeDepth(node) <= 9) return 1;
      return 0;
    }

    function refreshShell() { scheduleShell(true, true, "theme"); }
    window.__dshDsRefreshShell = refreshShell;

    if (window.MutationObserver) {
      var shellObserver = new MutationObserver(function (records) {
        if (dsDisposed) return;
        var shellDirty = false;
        var shellLevel = 0;
        var anyAdded = false;
        var addedEls = [];
        for (var ri = 0; ri < records.length; ri += 1) {
          var target = records[ri].target;
          var added = records[ri].addedNodes;
          for (var rk = 0; rk < added.length; rk += 1) {
            var node = added[rk];
            if (!node || node.nodeType !== 1) continue;
            anyAdded = true;
            if (addedEls.length < 24) addedEls.push(node);
            /* 只检查新增节点自己（matches 是 O(1)）；子树里的气泡 / 代码块
               由随后的 apply 用一次原生 querySelectorAll 统一补齐。 */
            if (lastGlass && node.matches) {
              try { if (node.matches(GLASS_SEL)) markGlassEl(node); } catch (matchError) { /* ignore */ }
            }
            var level = isShellChange(node, target);
            if (level > shellLevel) shellLevel = level;
            if (level > 0) shellDirty = true;
          }
        }
        if (!anyAdded) {
          /* 弹窗关闭只产生 removedNodes：仍然要刷新门控状态，否则
             busyDialog 会一直为 true，三条动画就永久冻结了。 */
          busyDialog = !!document.querySelector(PANEL_SELECTOR);
          return;
        }
        busyDialog = !!document.querySelector(PANEL_SELECTOR);
        if (shellLevel === 2) {
          /* 视图级切换（点侧栏换模块 / 换会话）时先把背景按 600ms：
             这一批 DOM 新增本身就要重排 + 重绘整屏，背景再叠 30fps 全屏绘制
             就会把这 300–600ms 争得更长。600ms 后自动续播。 */
          pauseAnimations(600);
          /* 通知浮动主题按钮立刻重查「header 里是否已经有按钮」，
             把新建会话瞬间的两按钮重叠压到一帧以内。 */
          try { window.dispatchEvent(new CustomEvent("dsh-ds-shell-change")); } catch (evtError) { /* ignore */ }
          /* 只在「视图级切换」这一批里做逐节点兜底：getComputedStyle 会触发
             整文档样式重算，流式追加时每个 token 都跑一次就是新的卡顿源。 */
          for (var qi = 0; qi < addedEls.length && qi < 8; qi += 1) {
            try { quickPunch(addedEls[qi]); } catch (quickError) { /* ignore */ }
          }
          try { sweepPunch(addedEls); } catch (sweepError) { /* ignore */ }
          sweepSoon();
        }
        if (shellLevel === 2) {
          /* 只有视图级切换才在 MO 里同步做一次轻量外壳扫描（白名单查询 + 少量
             样式写入，几毫秒），保证新视图第一帧就是透明 + 玻璃，不会白闪；
             打字 / 流式追加产生的深度新增只排队，不同步重排整篇文档。
             重活（插槽内 25% 面积扫描）交给分片任务在后面的帧里跑。 */
          try { apply(false); } catch (applyError) { /* ignore */ }
        }
        scheduleShell(shellDirty, false, "dom");
      });
      shellObserver.observe(document.querySelector("#root") || document.documentElement, { childList: true, subtree: true });
      themeCleanup.push(function () { shellObserver.disconnect(); });
    }

    function onResize() {
      if (dsDisposed) return;
      scheduleShell(true, false, "resize");
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", function () {
      if (dsDisposed || document.hidden) return;
      scheduleShell(false, true, "visible");
    });

    /* 初始 settle：等应用外壳挂载完成（原来是 800ms×75 的常驻轮询） */
    [0, 400, 1500, 3500, 6000].forEach(function (delay) {
      settleTimers.push(setTimeout(function () {
        scheduleShell(delay >= 400, delay === 0, "settle");
      }, delay));
    });

    return {
      refresh: refreshShell,
      dispose: function () {
        for (var st = 0; st < settleTimers.length; st += 1) clearTimeout(settleTimers[st]);
        settleTimers.length = 0;
        try { window.removeEventListener("resize", onResize); } catch (resizeError) { /* ignore */ }
        /* 摘掉本实例写过的内联样式与标记，把宿主还原成原样 */
        var els;
        try { els = document.querySelectorAll(SHELL_SELECTORS.join(", ") + ", [data-dsh-skin]"); } catch (queryError) { els = []; }
        for (var ei = 0; ei < els.length; ei += 1) {
          var el = els[ei];
          if (!el || !el.style) continue;
          for (var pi = 0; pi < GLASS_PROPS.length; pi += 1) el.style.removeProperty(GLASS_PROPS[pi]);
          el.removeAttribute("data-dsh-skin");
        }
        try {
          document.documentElement.style.removeProperty("background");
          if (document.body) document.body.style.removeProperty("background");
        } catch (pageStyleError) { /* ignore */ }
      }
    };
  }

  /* ------------------------------------------------------------------ *
   * 着色器（与 DeepSeek 打包产物逐字一致）
   * ------------------------------------------------------------------ */
  var VERT = "#version 300 es\nin vec4 a_position;\nout vec2 vUv;\nvoid main() {\n  vUv = a_position.xy * 0.5 + 0.5;\n  gl_Position = a_position;\n}\n";

  var FLOWMAP_FS = "#version 300 es\n" +
    "precision mediump float;\n" +
    "in vec2 vUv;\n" +
    "uniform sampler2D u_prev;\n" +
    "uniform vec2 u_mouse;\n" +
    "uniform vec2 u_velocity;\n" +
    "uniform float u_brushRadius;\n" +
    "uniform float u_brushStrength;\n" +
    "uniform float u_decay;\n" +
    "out vec4 fragColor;\n" +
    "\n" +
    "void main() {\n" +
    "  vec4 prev = texture(u_prev, vUv);\n" +
    "\n" +
    "  prev.r *= u_decay;\n" +
    "  prev.gb = mix(vec2(0.5), prev.gb, u_decay);\n" +
    "\n" +
    "  float dist = distance(vUv, u_mouse);\n" +
    "\n" +
    "  float influence = exp(-dist * dist / (u_brushRadius * u_brushRadius * 0.5));\n" +
    "  influence = max(0.0, influence - 0.01);\n" +
    "\n" +
    "  float speed = length(u_velocity);\n" +
    "  float presenceStrength = u_brushStrength * 0.3;\n" +
    "  float velBonus = min(speed * 3.0, 0.7) * u_brushStrength;\n" +
    "  float totalStrength = presenceStrength + velBonus;\n" +
    "\n" +
    "  prev.r = max(prev.r, influence * totalStrength);\n" +
    "  float blendAmt = influence * min(totalStrength, 0.4) * 0.3;\n" +
    "  prev.g = mix(prev.g, clamp(u_velocity.x * 2.0 + 0.5, 0.0, 1.0), blendAmt);\n" +
    "  prev.b = mix(prev.b, clamp(u_velocity.y * 2.0 + 0.5, 0.0, 1.0), blendAmt);\n" +
    "\n" +
    "  fragColor = prev;\n" +
    "}\n";

  var PARTICLE_FS = "#version 300 es\n" +
    "precision mediump float;\n" +
    "in vec2 vUv;\n" +
    "uniform float u_time;\n" +
    "uniform float u_pixelRatio;\n" +
    "uniform vec2 u_resolution;\n" +
    "uniform float u_scale;\n" +
    "uniform float u_rotation;\n" +
    "uniform vec4 u_color1, u_color2, u_color3, u_color4, u_color5;\n" +
    "uniform float u_colorCount;\n" +
    "uniform float u_proportion;\n" +
    "uniform float u_softness;\n" +
    "uniform float u_shape;\n" +
    "uniform float u_shapeScale;\n" +
    "uniform float u_distortion;\n" +
    "uniform float u_swirl;\n" +
    "uniform float u_swirlIterations;\n" +
    "uniform vec2 u_offset;\n" +
    "uniform sampler2D u_flowmap;\n" +
    "uniform float u_distortBoost;\n" +
    "uniform float u_noiseBoost;\n" +
    "uniform float u_swirlBoost;\n" +
    "uniform float u_glowIntensity;\n" +
    "uniform vec3 u_glowColor1;\n" +
    "uniform vec3 u_glowColor2;\n" +
    "uniform vec3 u_glowColor3;\n" +
    "out vec4 fragColor;\n" +
    "\n" +
    "#define TWO_PI 6.28318530718\n" +
    "#define PI 3.14159265358979323846\n" +
    "\n" +
    "vec2 rotate(vec2 uv, float th) { return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv; }\n" +
    "float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }\n" +
    "float noise(vec2 st) {\n" +
    "  vec2 i = floor(st); vec2 f = fract(st);\n" +
    "  float a = random(i), b = random(i + vec2(1,0)), c = random(i + vec2(0,1)), d = random(i + vec2(1,1));\n" +
    "  vec2 u = f*f*(3.0-2.0*f);\n" +
    "  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);\n" +
    "}\n" +
    "\n" +
    "vec3 blend_multi(float mixer, float softness) {\n" +
    "  float edge = 1.0 - softness;\n" +
    "  float n = u_colorCount;\n" +
    "  vec3 col = u_color1.rgb;\n" +
    "  if (n > 1.5) { col = mix(col, u_color2.rgb, smoothstep(0.0 + 0.2*edge, 1.0/(n-0.5) - 0.2*edge, mixer)); }\n" +
    "  if (n > 2.5) { col = mix(col, u_color3.rgb, smoothstep(1.0/(n-0.5) + 0.1*edge, 2.0/(n-0.5) - 0.1*edge, mixer)); }\n" +
    "  if (n > 3.5) { col = mix(col, u_color4.rgb, smoothstep(2.0/(n-0.5) + 0.1*edge, 3.0/(n-0.5) - 0.1*edge, mixer)); }\n" +
    "  if (n > 4.5) { col = mix(col, u_color5.rgb, smoothstep(3.0/(n-0.5) + 0.1*edge, 4.0/(n-0.5) - 0.1*edge, mixer)); }\n" +
    "  return col;\n" +
    "}\n" +
    "\n" +
    "void main() {\n" +
    "  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n" +
    "  float t = .5 * u_time;\n" +
    "  float ns = .0005 + .006 * u_scale;\n" +
    "  uv -= .5; uv *= (ns * u_resolution); uv = rotate(uv, u_rotation * .5 * PI);\n" +
    "  uv /= u_pixelRatio; uv += .5; uv += u_offset;\n" +
    "\n" +
    "  vec2 fragUV = gl_FragCoord.xy / u_resolution.xy;\n" +
    "  vec4 flow = texture(u_flowmap, fragUV);\n" +
    "  float influence = flow.r;\n" +
    "  vec2 flowDir = (flow.gb - 0.5) * 2.0;\n" +
    "\n" +
    "  float n1 = noise(uv + t), n2 = noise(uv*2. - t);\n" +
    "  float angle = n1 * TWO_PI;\n" +
    "\n" +
    "  float totalDistortion = u_distortion + influence * u_distortBoost;\n" +
    "  uv.x += 4. * totalDistortion * n2 * cos(angle);\n" +
    "  uv.y += 4. * totalDistortion * n2 * sin(angle);\n" +
    "\n" +
    "  uv += flowDir * influence * 0.15;\n" +
    "\n" +
    "  if (influence > 0.001) {\n" +
    "    float localNoise = noise(uv * 2.0 + t * 1.5);\n" +
    "    uv += influence * u_noiseBoost * vec2(cos(localNoise * TWO_PI), sin(localNoise * TWO_PI));\n" +
    "  }\n" +
    "\n" +
    "  float iters = ceil(clamp(u_swirlIterations, 1., 30.));\n" +
    "  float swirlAmt = clamp(u_swirl, 0., 2.) + influence * u_swirlBoost;\n" +
    "  for (float i = 1.; i <= 30.0; i++) {\n" +
    "    if (i > iters) break;\n" +
    "    uv.x += swirlAmt / i * cos(t + i*1.5*uv.y);\n" +
    "    uv.y += swirlAmt / i * cos(t + i*1.*uv.x);\n" +
    "  }\n" +
    "\n" +
    "  float proportion = clamp(u_proportion, 0., 1.);\n" +
    "  vec2 cuv = uv * (.5 + 3.5 * u_shapeScale);\n" +
    "  float shape = .5 + .5 * sin(cuv.x) * cos(cuv.y);\n" +
    "  float mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);\n" +
    "  vec3 col = blend_multi(mixer, clamp(u_softness, 0., 1.));\n" +
    "\n" +
    "  // Mouse proximity color shift: 3-color glow\n" +
    "  float glow = smoothstep(0.0, 0.8, influence);\n" +
    "  float glowNoise = noise(uv * 3.0 + u_time * 0.1) ;\n" +
    "  float glowDist = smoothstep(0.0, 1.0, influence);\n" +
    "  vec3 glowMix = mix(u_glowColor3, u_glowColor2, glowDist);\n" +
    "  glowMix = mix(glowMix, u_glowColor1, glowDist * glowNoise);\n" +
    "  col = mix(col, glowMix, glow * u_glowIntensity);\n" +
    "\n" +
    "  fragColor = vec4(col, 1.0);\n" +
    "}\n";

  var FLUID_FS = "#version 300 es\n" +
    "precision mediump float;\n" +
    "in vec2 vUv;\n" +
    "uniform float u_time;\n" +
    "uniform vec2 u_resolution;\n" +
    "uniform vec3 u_c1, u_c2, u_c3, u_c4, u_c5;\n" +
    "uniform float u_scale;\n" +
    "uniform vec2 u_offset;\n" +
    "uniform float u_grain;\n" +
    "uniform float u_speed;\n" +
    "uniform sampler2D u_flowmap;\n" +
    "uniform float u_distortBoost;\n" +
    "uniform float u_swirlBoost;\n" +
    "uniform float u_glowIntensity;\n" +
    "uniform vec3 u_glowColor1;\n" +
    "uniform vec3 u_glowColor2;\n" +
    "uniform vec3 u_glowColor3;\n" +
    "uniform vec2 u_lightPos;\n" +
    "uniform float u_lightCore;\n" +
    "uniform float u_lightHalo;\n" +
    "uniform float u_vignette;\n" +
    "uniform float u_bloomThreshold;\n" +
    "uniform float u_bloomRange;\n" +
    "uniform float u_bloomStrength;\n" +
    "out vec4 fragColor;\n" +
    "\n" +
    "vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}\n" +
    "vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}\n" +
    "vec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}\n" +
    "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}\n" +
    "\n" +
    "float snoise(vec3 v){\n" +
    "  const vec2 C=vec2(1./6.,1./3.);\n" +
    "  const vec4 D=vec4(0.,.5,1.,2.);\n" +
    "  vec3 i=floor(v+dot(v,C.yyy));\n" +
    "  vec3 x0=v-i+dot(i,C.xxx);\n" +
    "  vec3 g=step(x0.yzx,x0.xyz);\n" +
    "  vec3 l=1.-g;\n" +
    "  vec3 i1=min(g.xyz,l.zxy);\n" +
    "  vec3 i2=max(g.xyz,l.zxy);\n" +
    "  vec3 x1=x0-i1+C.xxx;\n" +
    "  vec3 x2=x0-i2+C.yyy;\n" +
    "  vec3 x3=x0-D.yyy;\n" +
    "  i=mod289v3(i);\n" +
    "  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));\n" +
    "  float n_=.142857142857;\n" +
    "  vec3 ns=n_*D.wyz-D.xzx;\n" +
    "  vec4 j=p-49.*floor(p*ns.z*ns.z);\n" +
    "  vec4 x_=floor(j*ns.z);\n" +
    "  vec4 y_=floor(j-7.*x_);\n" +
    "  vec4 x=x_*ns.x+ns.yyyy;\n" +
    "  vec4 y=y_*ns.x+ns.yyyy;\n" +
    "  vec4 h=1.-abs(x)-abs(y);\n" +
    "  vec4 b0=vec4(x.xy,y.xy);\n" +
    "  vec4 b1=vec4(x.zw,y.zw);\n" +
    "  vec4 s0=floor(b0)*2.+1.;\n" +
    "  vec4 s1=floor(b1)*2.+1.;\n" +
    "  vec4 sh=-step(h,vec4(0.));\n" +
    "  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;\n" +
    "  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;\n" +
    "  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);\n" +
    "  vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);\n" +
    "  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));\n" +
    "  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;\n" +
    "  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);\n" +
    "  m=m*m;\n" +
    "  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));\n" +
    "}\n" +
    "\n" +
    "float hash(vec2 p){\n" +
    "  vec3 p3=fract(vec3(p.xyx)*.1031);\n" +
    "  p3+=dot(p3,p3.yzx+33.33);\n" +
    "  return fract((p3.x+p3.y)*p3.z);\n" +
    "}\n" +
    "\n" +
    "float fbm(vec3 p){\n" +
    "  float v=0.,amp=.6;vec3 shift=vec3(100.);\n" +
    "  for(int i=0;i<1;i++){v+=amp*snoise(p);p=p*2.+shift;amp*=.4;}\n" +
    "  return v;\n" +
    "}\n" +
    "\n" +
    "float fluidNoise(vec2 uv,float t){\n" +
    "  float n1=fbm(vec3(uv*.6,t*.06));\n" +
    "  float n2=fbm(vec3(uv*.6+5.2,t*.06+1.3));\n" +
    "  vec2 w1=vec2(n1,n2)*.6;\n" +
    "  float n3=fbm(vec3((uv+w1)*.7+1.7,t*.05+3.1));\n" +
    "  float n4=fbm(vec3((uv+w1)*.7+9.2,t*.05+5.7));\n" +
    "  vec2 w2=vec2(n3,n4)*.5;\n" +
    "  return fbm(vec3((uv+w1+w2)*.5,t*.04));\n" +
    "}\n" +
    "\n" +
    "vec2 curlish(vec2 uv,float t){\n" +
    "  float eps=.02;\n" +
    "  float n=snoise(vec3(uv*.8,t));\n" +
    "  float nx=snoise(vec3((uv+vec2(eps,0.))*.8,t));\n" +
    "  float ny=snoise(vec3((uv+vec2(0.,eps))*.8,t));\n" +
    "  return vec2(-(ny-n)/eps,(nx-n)/eps)*.003;\n" +
    "}\n" +
    "\n" +
    "void main(){\n" +
    "  float aspect=u_resolution.x/u_resolution.y;\n" +
    "  vec2 uv=gl_FragCoord.xy/u_resolution;\n" +
    "  vec2 suv=vec2(uv.x*aspect, uv.y) * u_scale + u_offset;\n" +
    "  float t=u_time;\n" +
    "\n" +
    "  // Mouse interaction via flowmap\n" +
    "  vec4 flow = texture(u_flowmap, uv);\n" +
    "  float influence = flow.r;\n" +
    "  vec2 flowDir = (flow.gb - 0.5) * 2.0;\n" +
    "\n" +
    "  // Apply mouse distortion to UV\n" +
    "  suv += flowDir * influence * u_distortBoost * 0.8;\n" +
    "  // Apply mouse swirl\n" +
    "  float swirlAngle = influence * u_swirlBoost * 2.5;\n" +
    "  float cs = cos(swirlAngle), sn = sin(swirlAngle);\n" +
    "  vec2 delta = suv - vec2(uv.x * aspect, uv.y) * u_scale;\n" +
    "  suv += (mat2(cs, sn, -sn, cs) * delta - delta) * influence;\n" +
    "\n" +
    "  vec2 curl=curlish(suv,t*.04);\n" +
    "  vec2 uvD=suv+curl*12.;\n" +
    "  float f=fluidNoise(uvD,t);\n" +
    "  float swirl=snoise(vec3(uvD*.8+f*1.5,t*.035))*.5+.5;\n" +
    "  float n=f*.5+.5;\n" +
    "  vec3 col=mix(u_c1,u_c2,smoothstep(.2,.5,n));\n" +
    "  col=mix(col,u_c3,smoothstep(.35,.65,n+swirl*.25));\n" +
    "  col=mix(col,u_c4,smoothstep(.6,.85,swirl)*.55);\n" +
    "  col=mix(col,u_c5,smoothstep(.5,.8,n*swirl)*.35);\n" +
    "\n" +
    "  // Mouse proximity color shift: 3-color glow blended by distance + noise\n" +
    "  float glow = smoothstep(0.0, 0.8, influence);\n" +
    "  float glowNoise = snoise(vec3(uvD * 1.5, t * 0.08)) * 0.5 + 0.5;\n" +
    "  float glowDist = smoothstep(0.0, 1.0, influence);\n" +
    "  vec3 glowMix = mix(u_glowColor3, u_glowColor2, glowDist);\n" +
    "  glowMix = mix(glowMix, u_glowColor1, glowDist * glowNoise);\n" +
    "  col = mix(col, glowMix, glow * u_glowIntensity);\n" +
    "\n" +
    "  if(u_grain>0.0){\n" +
    "    vec2 flowOffset = (uvD - suv) * u_resolution.y;\n" +
    "    vec2 gp = floor((gl_FragCoord.xy + flowOffset) / 5.0);\n" +
    "    float gr=hash(gp)*2.-1.;\n" +
    "    col+=gr*u_grain;\n" +
    "  }\n" +
    "\n" +
    "  // Self-luminance bloom: bright fluid regions become their own light spots,\n" +
    "  // so glow follows the flow and mouse disturbance instead of a fixed point\n" +
    "  float luma=dot(col,vec3(.299,.587,.114));\n" +
    "  float bloom=smoothstep(u_bloomThreshold-u_bloomRange,u_bloomThreshold+u_bloomRange,luma);\n" +
    "  col+=(col*.85+vec3(.15,.145,.13))*bloom*u_bloomStrength;\n" +
    "\n" +
    "  // Virtual light source: soft warm core (same side as helm lighting)\n" +
    "  float ld=length((uv-u_lightPos)*vec2(aspect,1.));\n" +
    "  float core=exp(-ld*ld*4.5);\n" +
    "  float halo=exp(-ld*1.8);\n" +
    "  col+=vec3(1.,.97,.9)*core*u_lightCore+vec3(.72,.8,1.)*halo*u_lightHalo;\n" +
    "\n" +
    "  float vig=1.-smoothstep(.35,.75,length(uv-.5));\n" +
    "  col=mix(col*(1.-u_vignette),col,vig);\n" +
    "  fragColor=vec4(col,1.);\n" +
    "}\n";

  /* ------------------------------------------------------------------ *
   * 极光引擎（WebGL2）
   * ------------------------------------------------------------------ */
  function startAurora() {
    var canvas = auroraCanvas;
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    canvas.__dsGL = gl;   /* 供 __dshDsDispose 释放上下文 */
    diag.auroraGL = true;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    function link(vs, fs) {
      var p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var progFlow = link(vs, compile(gl.FRAGMENT_SHADER, FLOWMAP_FS));
    var progPart = link(vs, compile(gl.FRAGMENT_SHADER, PARTICLE_FS));
    var progFluid = link(vs, compile(gl.FRAGMENT_SHADER, FLUID_FS));
    diag.auroraProgs = [progFlow ? "flow" : "", progPart ? "particle" : "", progFluid ? "fluid" : ""].filter(Boolean).join(",");
    if (!progFlow || !progPart || !progFluid) return;

    var uFlow = {
      prev: gl.getUniformLocation(progFlow, "u_prev"),
      mouse: gl.getUniformLocation(progFlow, "u_mouse"),
      velocity: gl.getUniformLocation(progFlow, "u_velocity"),
      brushRadius: gl.getUniformLocation(progFlow, "u_brushRadius"),
      brushStrength: gl.getUniformLocation(progFlow, "u_brushStrength"),
      decay: gl.getUniformLocation(progFlow, "u_decay")
    };
    var uPart = {
      time: gl.getUniformLocation(progPart, "u_time"),
      pixelRatio: gl.getUniformLocation(progPart, "u_pixelRatio"),
      resolution: gl.getUniformLocation(progPart, "u_resolution"),
      scale: gl.getUniformLocation(progPart, "u_scale"),
      rotation: gl.getUniformLocation(progPart, "u_rotation"),
      offset: gl.getUniformLocation(progPart, "u_offset"),
      color1: gl.getUniformLocation(progPart, "u_color1"),
      color2: gl.getUniformLocation(progPart, "u_color2"),
      color3: gl.getUniformLocation(progPart, "u_color3"),
      color4: gl.getUniformLocation(progPart, "u_color4"),
      color5: gl.getUniformLocation(progPart, "u_color5"),
      colorCount: gl.getUniformLocation(progPart, "u_colorCount"),
      proportion: gl.getUniformLocation(progPart, "u_proportion"),
      softness: gl.getUniformLocation(progPart, "u_softness"),
      shape: gl.getUniformLocation(progPart, "u_shape"),
      shapeScale: gl.getUniformLocation(progPart, "u_shapeScale"),
      distortion: gl.getUniformLocation(progPart, "u_distortion"),
      swirl: gl.getUniformLocation(progPart, "u_swirl"),
      swirlIterations: gl.getUniformLocation(progPart, "u_swirlIterations"),
      flowmap: gl.getUniformLocation(progPart, "u_flowmap"),
      distortBoost: gl.getUniformLocation(progPart, "u_distortBoost"),
      noiseBoost: gl.getUniformLocation(progPart, "u_noiseBoost"),
      swirlBoost: gl.getUniformLocation(progPart, "u_swirlBoost"),
      glowIntensity: gl.getUniformLocation(progPart, "u_glowIntensity"),
      glowColor1: gl.getUniformLocation(progPart, "u_glowColor1"),
      glowColor2: gl.getUniformLocation(progPart, "u_glowColor2"),
      glowColor3: gl.getUniformLocation(progPart, "u_glowColor3")
    };
    var uFluid = {
      time: gl.getUniformLocation(progFluid, "u_time"),
      resolution: gl.getUniformLocation(progFluid, "u_resolution"),
      scale: gl.getUniformLocation(progFluid, "u_scale"),
      offset: gl.getUniformLocation(progFluid, "u_offset"),
      grain: gl.getUniformLocation(progFluid, "u_grain"),
      speed: gl.getUniformLocation(progFluid, "u_speed"),
      flowmap: gl.getUniformLocation(progFluid, "u_flowmap"),
      distortBoost: gl.getUniformLocation(progFluid, "u_distortBoost"),
      swirlBoost: gl.getUniformLocation(progFluid, "u_swirlBoost"),
      glowIntensity: gl.getUniformLocation(progFluid, "u_glowIntensity"),
      glowColor1: gl.getUniformLocation(progFluid, "u_glowColor1"),
      glowColor2: gl.getUniformLocation(progFluid, "u_glowColor2"),
      glowColor3: gl.getUniformLocation(progFluid, "u_glowColor3"),
      c1: gl.getUniformLocation(progFluid, "u_c1"),
      c2: gl.getUniformLocation(progFluid, "u_c2"),
      c3: gl.getUniformLocation(progFluid, "u_c3"),
      c4: gl.getUniformLocation(progFluid, "u_c4"),
      c5: gl.getUniformLocation(progFluid, "u_c5"),
      lightPos: gl.getUniformLocation(progFluid, "u_lightPos"),
      lightCore: gl.getUniformLocation(progFluid, "u_lightCore"),
      lightHalo: gl.getUniformLocation(progFluid, "u_lightHalo"),
      vignette: gl.getUniformLocation(progFluid, "u_vignette"),
      bloomThreshold: gl.getUniformLocation(progFluid, "u_bloomThreshold"),
      bloomRange: gl.getUniformLocation(progFluid, "u_bloomRange"),
      bloomStrength: gl.getUniformLocation(progFluid, "u_bloomStrength")
    };

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    function bindAttrib(prog) {
      var loc = gl.getAttribLocation(prog, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }
    function makeTarget(w, h, data) {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { fbo: fbo, tex: tex };
    }

    var W = 0, H = 0, wQ = 0, hQ = 0;
    var flip = false;
    var k = 1;
    function resizeAll() {
      /* DPR 每次重算：窗口缩放（125%/150%）会改 devicePixelRatio，
         沿用初值会把画布按错误倍率栅格化。 */
      k = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.round(canvas.clientWidth * k);
      H = Math.round(canvas.clientHeight * k);
      /* 画布还没布局（display:none、切主题瞬间被隐藏、窗口最小化）时 clientWidth
         是 0。这时去建 0x0 的 texture/framebuffer，之后每帧 drawArrays 都会报
         GL_INVALID_FRAMEBUFFER_OPERATION: Attachment has zero size —— 控制台里
         刷屏那几百条就是这么来的，而且会把 WebGL 上下文拖死。宁可先不建。 */
      if (!(W > 0 && H > 0)) {
        W = 0; H = 0; wQ = 0; hQ = 0;
        targetA = null; targetB = null;
        return;
      }
      canvas.width = W; canvas.height = H;
      wQ = Math.round(W / 4); hQ = Math.round(H / 4);
      var init = new Uint8Array(wQ * hQ * 4);
      for (var i = 0; i < wQ * hQ; i++) { init[4 * i] = 0; init[4 * i + 1] = 128; init[4 * i + 2] = 128; init[4 * i + 3] = 255; }
      targetA = makeTarget(wQ, hQ, init);
      targetB = makeTarget(wQ, hQ, init);
    }
    var targetA = null, targetB = null;
    resizeAll();
    /* 尺寸变化交给 ResizeObserver，省掉每帧的 clientWidth 读取（那是一次
       强制布局查询，144Hz 下三条循环叠加会持续踩样式/布局缓存）。 */
    var auroraDirty = false;
    var auroraTick = 0;
    if (typeof ResizeObserver === "function") {
      try {
        var auroraRO = new ResizeObserver(function () { auroraDirty = true; });
        auroraRO.observe(canvas);
        themeCleanup.push(function () { auroraRO.disconnect(); });
      } catch (roError) { /* 没有 RO 时窗口 resize 监听仍在，功能不受影响 */ }
    }

    var mouse = { x: 0.5, y: 0.5, smoothX: 0.5, smoothY: 0.5, vx: 0, vy: 0, svx: 0, svy: 0 };
    var useMouse = !reducedMotion && !coarse && !isWindows;
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
    }
    if (useMouse) window.addEventListener("mousemove", onMove, { passive: true });

    var start = performance.now();
    var raf = 0;
    var running = true;
    var last = 0;
    var FRAME = prefersReducedMotion ? 1000 / 12 : 1000 / 30;

    function hex2rgb(hex) {
      var h = hex.replace("#", "");
      return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
    }

    function frame(now) {
      if (dsDisposed) return;
      raf = requestAnimationFrame(frame);
      if (isBusy()) return;
      if (!running || now - last < FRAME) return;
      last = now - (now - last) % FRAME;
      var cfg = currentAuroraConfig();

      if (auroraDirty) { auroraDirty = false; resizeAll(); }
      /* 跨屏拖动会改 devicePixelRatio，但 CSS 尺寸不变、ResizeObserver 不触发；
         每 60 帧（约 2s）兜一次，避免换到高分屏后极光变糊。 */
      else if ((++auroraTick % 60) === 0 && Math.round(canvas.clientWidth * k) !== W) resizeAll();
      if (!targetA || !targetB || wQ < 1 || hQ < 1) {
        resizeAll();
        if (!targetA || !targetB || wQ < 1 || hQ < 1) return;
      }
      if (dsAnimPaused(now)) return;

      mouse.smoothX += (mouse.x - mouse.smoothX) * cfg.mouseSmoothing;
      mouse.smoothY += (mouse.y - mouse.smoothY) * cfg.mouseSmoothing;
      mouse.svx += ((mouse.x - mouse.smoothX) * 0.5 - mouse.svx) * cfg.mouseVelocity;
      mouse.svy += ((mouse.y - mouse.smoothY) * 0.5 - mouse.svy) * cfg.mouseVelocity;

      // --- flowmap pass（鼠标笔刷 → 低分辨率流场，双缓冲乒乓） ---
      var src = flip ? targetA : targetB;
      var dst = flip ? targetB : targetA;
      flip = !flip;
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
      gl.viewport(0, 0, wQ, hQ);
      gl.useProgram(progFlow);
      bindAttrib(progFlow);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(uFlow.prev, 0);
      gl.uniform2f(uFlow.mouse, mouse.smoothX, mouse.smoothY);
      gl.uniform2f(uFlow.velocity, mouse.svx, mouse.svy);
      gl.uniform1f(uFlow.brushRadius, cfg.mouseRadius);
      gl.uniform1f(uFlow.brushStrength, useMouse ? cfg.mouseStrength : 0);
      gl.uniform1f(uFlow.decay, cfg.decay);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);

      // --- 渲染 ---
      var t = (performance.now() - start) * 0.001 * (cfg.speed / 100);
      if (cfg.type === "fluid") {
        gl.useProgram(progFluid);
        bindAttrib(progFluid);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, dst.tex);
        gl.uniform1i(uFluid.flowmap, 0);
        gl.uniform1f(uFluid.time, t);
        gl.uniform2f(uFluid.resolution, W, H);
        gl.uniform1f(uFluid.scale, cfg.scale);
        gl.uniform2f(uFluid.offset, cfg.offsetX / 100, cfg.offsetY / 100);
        gl.uniform1f(uFluid.grain, cfg.grain);
        gl.uniform1f(uFluid.distortBoost, cfg.distortBoost);
        gl.uniform1f(uFluid.swirlBoost, cfg.swirlBoost);
        var lx = cfg.lightX != null ? cfg.lightX : 0.89;
        var lf = useMouse && cfg.lightFollow != null ? cfg.lightFollow : 0;
        gl.uniform2f(uFluid.lightPos, lx + (mouse.smoothX - lx) * lf, cfg.lightY != null ? cfg.lightY : 0.46);
        gl.uniform1f(uFluid.lightCore, coarse ? 0 : (cfg.lightCore != null ? cfg.lightCore : 0.14));
        gl.uniform1f(uFluid.lightHalo, coarse ? 0 : (cfg.lightHalo != null ? cfg.lightHalo : 0.2));
        gl.uniform1f(uFluid.vignette, cfg.vignette != null ? cfg.vignette : 0.38);
        gl.uniform1f(uFluid.bloomThreshold, cfg.bloomThreshold != null ? cfg.bloomThreshold : 0.61);
        gl.uniform1f(uFluid.bloomRange, cfg.bloomRange != null ? cfg.bloomRange : 0.18);
        gl.uniform1f(uFluid.bloomStrength, cfg.bloomStrength != null ? cfg.bloomStrength : 0.4);
        gl.uniform1f(uFluid.glowIntensity, cfg.glowIntensity);
        var gc1 = hex2rgb(cfg.glowColors[0] || "#ffffff");
        var gc2 = hex2rgb(cfg.glowColors[1] || cfg.glowColors[0] || "#ffffff");
        var gc3 = hex2rgb(cfg.glowColors[2] || cfg.glowColors[0] || "#ffffff");
        gl.uniform3f(uFluid.glowColor1, gc1[0], gc1[1], gc1[2]);
        gl.uniform3f(uFluid.glowColor2, gc2[0], gc2[1], gc2[2]);
        gl.uniform3f(uFluid.glowColor3, gc3[0], gc3[1], gc3[2]);
        var cs = cfg.colors || [];
        for (var ci = 0; ci < 5; ci++) {
          var c = hex2rgb(cs[ci] || cs[cs.length - 1] || "#000000");
          gl.uniform3f([uFluid.c1, uFluid.c2, uFluid.c3, uFluid.c4, uFluid.c5][ci], c[0], c[1], c[2]);
        }
      } else {
        gl.useProgram(progPart);
        bindAttrib(progPart);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, dst.tex);
        gl.uniform1i(uPart.flowmap, 0);
        gl.uniform1f(uPart.time, t);
        gl.uniform1f(uPart.pixelRatio, window.devicePixelRatio || 1);
        gl.uniform2f(uPart.resolution, W, H);
        gl.uniform1f(uPart.scale, cfg.scale);
        gl.uniform1f(uPart.rotation, cfg.rotation / 90);
        gl.uniform2f(uPart.offset, cfg.offsetX / 100, cfg.offsetY / 100);
        var cols = cfg.colors || ["#2E58A4", "#D2E2EE", "#FFFFFF"];
        for (var pi = 0; pi < 5; pi++) {
          var pc = hex2rgb(cols[pi] || cols[cols.length - 1] || "#000000");
          gl.uniform4f([uPart.color1, uPart.color2, uPart.color3, uPart.color4, uPart.color5][pi], pc[0], pc[1], pc[2], 1);
        }
        gl.uniform1f(uPart.colorCount, cols.length);
        gl.uniform1f(uPart.proportion, cfg.proportion / 100);
        gl.uniform1f(uPart.softness, cfg.softness / 100);
        gl.uniform1f(uPart.shape, 0);
        gl.uniform1f(uPart.shapeScale, cfg.shapeScale / 100);
        gl.uniform1f(uPart.distortion, cfg.distortion / 100);
        gl.uniform1f(uPart.swirl, cfg.swirl / 50);
        gl.uniform1f(uPart.swirlIterations, cfg.swirlIterations);
        gl.uniform1f(uPart.distortBoost, cfg.distortBoost);
        gl.uniform1f(uPart.noiseBoost, cfg.noiseBoost);
        gl.uniform1f(uPart.swirlBoost, cfg.swirlBoost);
        gl.uniform1f(uPart.glowIntensity, cfg.glowIntensity);
        var pc1 = hex2rgb(cfg.glowColors[0] || "#ffffff");
        var pc2 = hex2rgb(cfg.glowColors[1] || cfg.glowColors[0] || "#ffffff");
        var pc3 = hex2rgb(cfg.glowColors[2] || cfg.glowColors[0] || "#ffffff");
        gl.uniform3f(uPart.glowColor1, pc1[0], pc1[1], pc1[2]);
        gl.uniform3f(uPart.glowColor2, pc2[0], pc2[1], pc2[2]);
        gl.uniform3f(uPart.glowColor3, pc3[0], pc3[1], pc3[2]);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /* 帧率：浅色主题的「琉璃光感」全部来自这一层的粒子辉光，一旦停帧就只剩
       一条死渐变（实测两帧 diff 恒为 0，顶部 200px 内 stddev 不到 13）。
       所以「减少动态效果」只把帧率降到 12fps，而不是画一帧就停 —— 深色主题
       这层本来就是 opacity:0，降帧不影响观感。 */
    raf = requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        if (!raf) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    window.addEventListener("resize", function () { resizeAll(); }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 粒子化鲸鱼引擎（官方移植：HeroDigitileR3F → 原生 WebGL2）
   * 源码取自官网 harness 页懒加载 chunk 776（未进缓存，已从官网抓取）：
   *   - 粒子位置：官方算法从 hero-whale.svg 像素亮度采样（60x60，边缘保留）
   *   - 顶点/片元 shader：官方 GLSL 逐字移植（three.js 矩阵替换为原生 uniform）
   *   - 交互：鼠标扭曲粒子（radius/strength/decay/distort）、光线跟随鼠标
   *     （lightParams.followX）、入场组装动画、松散漂移、游泳波动
   *   - 参数：DIGITILE_LIGHT_DEFAULTS / DIGITILE_MOUSE_DEFAULTS 与官方一致
   * ------------------------------------------------------------------ */
  // 官方鲸鱼纹理（hero-whale.svg，抓自 https://www.deepseek.com/harness/images/hero-whale.svg）
  var WHALE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18" fill="none"><path d="M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746V14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z" fill="#FFFFFF"/></svg>';
  var WHALE_SRC = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(WHALE_SVG);
  // 官方参数（chunk 776 源码常量，fish 变体：shadeMin .2 / shadeMax .4*2.79）——原值，未调参
  /* 官方参数是给官网那个更大场景的：光源 (4.5,5.5,3)、range 14、shadeMin .2
     搬到窗口尺寸的鲸鱼上时，大部分粒子离光源 >11 单位 —— lit 趋近 0，
     折出来的 vLight ~0.23、alpha ~0.12，画面上几乎看不见（实测亮度 21 vs 背景 21）。
     这里把光源移到鲸鱼中心附近、range 放大到覆盖整只鲸鱼、shadeMin 抬高，
     并加强鼠标跟随幅度，保证默认状态下鲸鱼清晰、鼠标交互明显。 */
  var LIGHT_DEFAULTS = { x: 0.0, y: 0.8, z: 3.2, range: 12, shadeMin: 0.5, shadeMax: 1.7, followX: 0.55 };
  var MOUSE_DEFAULTS = { radius: 4.9, strength: 0.8, decay: 0.2, distort: 5 };
  var WAVE_DEFAULTS = { speed: 1.5, amount: 0.06 };

  function sampleWhalePixels(img) {
    var T = 60;
    var c = document.createElement("canvas");
    c.width = T; c.height = T;
    var a = c.getContext("2d");
    a.fillStyle = "#000"; a.fillRect(0, 0, T, T);
    var r = Math.min(T / img.width, T / img.height);
    var o = img.width * r, s = img.height * r;
    a.drawImage(img, (T - o) / 2, (T - s) / 2, o, s);
    var d = a.getImageData(0, 0, T, T);
    var lum = new Float32Array(T * T);
    for (var i = 0; i < T * T; i++) lum[i] = (0.299 * d.data[4*i] + 0.587 * d.data[4*i+1] + 0.114 * d.data[4*i+2]) / 255;
    var positions = [], scattered = [], opacities = [], edges = [];
    var half = T / 2;
    function isEdge(x, y) {
      for (var yy = -2; yy <= 2; yy++) for (var xx = -2; xx <= 2; xx++) {
        if (xx === 0 && yy === 0) continue;
        var nx = x + xx, ny = y + yy;
        if (nx < 0 || ny < 0 || nx >= T || ny >= T) continue;
        if (lum[ny * T + nx] > 0.2) return false;
      }
      return true;
    }
    for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) {
      var l = lum[y * T + x];
      if (l > 0.2 && !isEdge(x, y)) {
        positions.push((x - half) * 0.15, (half - y) * 0.15, 0);
        opacities.push(l);
        var ec = 0;
        for (var yy = -1; yy <= 1; yy++) for (var xx = -1; xx <= 1; xx++) {
          if (xx === 0 && yy === 0) continue;
          var nx = x + xx, ny = y + yy;
          if (nx < 0 || ny < 0 || nx >= T || ny >= T || lum[ny * T + nx] <= 0.2) ec++;
        }
        edges.push(ec / 8);
        var phi = Math.random() * Math.PI * 2;
        var th = Math.acos(2 * Math.random() - 1);
        var rad = 3 * (0.4 + 0.6 * Math.random());
        scattered.push(Math.sin(th) * Math.cos(phi) * rad, Math.sin(th) * Math.sin(phi) * rad, Math.cos(th) * rad * 0.5);
      }
    }
    return {
      positions: new Float32Array(positions),
      scatteredPositions: new Float32Array(scattered),
      opacities: new Float32Array(opacities),
      edges: new Float32Array(edges),
      count: positions.length / 3
    };
  }

  // ---- 官方 shader（GLSL 逐字移植，three.js 内建矩阵换为原生 uniform） ----
  var WHALE_VS = "#version 300 es\n" +
    "precision highp float;\n" +
    "in vec3 position;\n" +
    "in float aOpacity;\n" +
    "in float aIndex;\n" +
    "in float aEdge;\n" +
    "in vec3 aScattered;\n" +
    "in vec3 aCenter;\n" +
    "in float aScale;\n" +
    "uniform float uTime;\n" +
    "uniform float uWaveSpeed;\n" +
    "uniform float uWaveAmount;\n" +
    "uniform vec2 uMouse;\n" +
    "uniform float uMouseRadius;\n" +
    "uniform float uMouseStrength;\n" +
    "uniform float uMouseDistort;\n" +
    "uniform float uAssembly;\n" +
    "uniform float uLoose;\n" +
    "uniform float uScatter;\n" +
    "uniform vec3 uLightPos;\n" +
    "uniform float uLightRange;\n" +
    "uniform float uShadeMin;\n" +
    "uniform float uShadeMax;\n" +
    "uniform mat4 uModel;\n" +
    "uniform mat4 uView;\n" +
    "uniform mat4 uProj;\n" +
    "uniform float uPointScale;\n" +
    "out float vOpacity;\n" +
    "out vec3 vWorldPos;\n" +
    "out float vAssembly;\n" +
    "out float vLight;\n" +
    "void main() {\n" +
    "  vOpacity = aOpacity;\n" +
    "  vAssembly = uAssembly;\n" +
    "  vec3 targetCenter = aCenter;\n" +
    "  vec3 localOffset = position * aScale;\n" +
    "  vec3 scatteredCenter = aScattered;\n" +
    "  float assembly = smoothstep(0.0, 1.0, uAssembly);\n" +
    "  vec3 center = mix(scatteredCenter, targetCenter, assembly);\n" +
    "  vec3 pos = center + localOffset;\n" +
    "  vWorldPos = center;\n" +
    "  float loose = uLoose * mix(0.25, 1.0, aEdge) * assembly;\n" +
    "  if (loose > 0.001) {\n" +
    "    vec3 jitter = vec3(\n" +
    "      fract(sin(aIndex * 12.9898) * 43758.5453) - 0.5,\n" +
    "      fract(sin(aIndex * 78.2330) * 12543.1230) - 0.5,\n" +
    "      fract(sin(aIndex * 39.4250) * 26711.7700) - 0.5\n" +
    "    );\n" +
    "    pos += jitter * 0.05 * loose;\n" +
    "    pos.x += sin(uTime * 0.50 + aIndex * 0.53) * 0.06 * loose;\n" +
    "    pos.y += cos(uTime * 0.42 + aIndex * 0.71) * 0.06 * loose;\n" +
    "    pos.z += sin(uTime * 0.36 + aIndex * 0.91) * 0.08 * loose;\n" +
    "    float tail = smoothstep(0.5, 4.5, targetCenter.x) * uLoose * assembly;\n" +
    "    pos.y += sin(uTime * 1.1 - targetCenter.x * 0.7) * 0.1 * tail;\n" +
    "    pos.z += cos(uTime * 0.9 - targetCenter.x * 0.55) * 0.06 * tail;\n" +
    "  }\n" +
    "  if (uScatter > 0.001) {\n" +
    "    float disperse = uScatter * mix(0.5, 1.0, aEdge);\n" +
    "    pos += (scatteredCenter - center) * disperse;\n" +
    "    pos.z += sin(uTime * 0.6 + aIndex * 0.3) * disperse * 0.6;\n" +
    "  }\n" +
    "  if (assembly > 0.95) {\n" +
    "    float effectStrength = (assembly - 0.95) * 20.0;\n" +
    "    float dist = length(center.xy);\n" +
    "    float waveFade = smoothstep(0.0, 3.0, dist);\n" +
    "    float wave = sin(dist * 3.0 - uTime * uWaveSpeed) * uWaveAmount * effectStrength * waveFade;\n" +
    "    pos.z += wave;\n" +
    "  }\n" +
    "  if (assembly > 0.8) {\n" +
    "    float mouseEffect = (assembly - 0.8) * 5.0;\n" +
    "    vec2 toMouse = center.xy - uMouse;\n" +
    "    float mouseDist = length(toMouse);\n" +
    "    if (mouseDist < uMouseRadius && mouseDist > 0.001) {\n" +
    "      float t = 1.0 - mouseDist / uMouseRadius;\n" +
    "      float force = t * t * t * mouseEffect * uMouseStrength;\n" +
    "      vec2 radialDir = toMouse / mouseDist;\n" +
    "      float noiseAngle = sin(aIndex * 0.37 + uTime * 0.5) * uMouseDistort;\n" +
    "      float ca = cos(noiseAngle);\n" +
    "      float sa = sin(noiseAngle);\n" +
    "      vec2 pushDir = vec2(radialDir.x * ca - radialDir.y * sa, radialDir.x * sa + radialDir.y * ca);\n" +
    "      pos.xy += pushDir * force * 2.0;\n" +
    "      pos.z += sin(aIndex * 1.7 + uTime) * force * 0.8;\n" +
    "    }\n" +
    "  }\n" +
    "  if (assembly < 0.9) {\n" +
    "    float scatter = smoothstep(0.9, 0.0, assembly);\n" +
    "    pos.x += sin(uTime * 0.5 + aIndex * 0.1) * 0.2 * scatter;\n" +
    "    pos.y += cos(uTime * 0.4 + aIndex * 0.07) * 0.2 * scatter;\n" +
    "    pos.z += sin(uTime * 0.3 + aIndex * 0.13) * 0.15 * scatter;\n" +
    "  }\n" +
    "  vec4 worldPos = uModel * vec4(pos, 1.0);\n" +
    "  float lightDist = distance(worldPos.xyz, uLightPos);\n" +
    "  float lit = clamp(1.0 - lightDist / uLightRange, 0.0, 1.0);\n" +
    "  vLight = mix(uShadeMin, uShadeMax, lit * lit);\n" +
    "  vec4 mvPosition = uView * uModel * vec4(pos, 1.0);\n" +
    "  gl_PointSize = max(3.0, uPointScale * aScale);\n" +
    "  gl_Position = uProj * mvPosition;\n" +
    "}\n";

  var WHALE_FS = "#version 300 es\n" +
    "precision highp float;\n" +
    "in float vOpacity;\n" +
    "in vec3 vWorldPos;\n" +
    "in float vAssembly;\n" +
    "in float vLight;\n" +
    "uniform float uTime;\n" +
    "uniform vec3 uColor;\n" +
    "out vec4 fragColor;\n" +
    "void main() {\n" +
    "  float dist = length(vWorldPos.xy);\n" +
    "  float glow = smoothstep(8.0, 0.0, dist) * 0.3 * vAssembly;\n" +
    "  float baseAlpha = mix(0.55, 0.9, vAssembly);\n" +
    "  float alpha = vOpacity * (baseAlpha + glow);\n" +
    "  float shimmer = sin(uTime * 1.5 + vWorldPos.x * 5.0 + vWorldPos.y * 3.0) * 0.1 + 0.9;\n" +
    "  alpha *= shimmer * min(vLight, 1.0);\n" +
    "  vec3 color = (uColor + glow * vec3(0.2, 0.3, 0.5)) * vLight;\n" +
    "  color = mix(color, color * vec3(1.07, 1.02, 0.94), clamp(vLight - 1.0, 0.0, 1.0));\n" +
    "  fragColor = vec4(color, alpha);\n" +
    "}\n";

  // ---- 4x4 矩阵工具（列主序，与 WebGL uniform 一致） ----
  function m4Identity() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
  function m4Mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c*4+r] = a[0*4+r]*b[c*4+0] + a[1*4+r]*b[c*4+1] + a[2*4+r]*b[c*4+2] + a[3*4+r]*b[c*4+3];
    }
    return o;
  }
  function m4Translation(tx, ty, tz) {
    var m = m4Identity(); m[12] = tx; m[13] = ty; m[14] = tz; return m;
  }
  function m4RotationX(a) { var c = Math.cos(a), s = Math.sin(a); var m = m4Identity(); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function m4RotationY(a) { var c = Math.cos(a), s = Math.sin(a); var m = m4Identity(); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function m4RotationZ(a) { var c = Math.cos(a), s = Math.sin(a); var m = m4Identity(); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
  function m4Scale(s) { var m = m4Identity(); m[0] = s; m[5] = s; m[10] = s; return m; }
  function m4Perspective(fovY, aspect, near, far) {
    var f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far);
    return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);
  }
  function m4Inverse(m) {
    var o = new Float32Array(16);
    var i = new Float32Array([m[0],m[4],m[8],m[12], m[1],m[5],m[9],m[13], m[2],m[6],m[10],m[14], m[3],m[7],m[11],m[15]]);
    var d = 1 / (i[0]*i[5]*i[10]*i[15] - i[0]*i[5]*i[11]*i[14] - i[0]*i[9]*i[6]*i[15] + i[0]*i[9]*i[7]*i[14] +
                i[0]*i[13]*i[6]*i[11] - i[0]*i[13]*i[7]*i[10] - i[4]*i[1]*i[10]*i[15] + i[4]*i[1]*i[11]*i[14] +
                i[4]*i[9]*i[2]*i[15] - i[4]*i[9]*i[3]*i[14] - i[4]*i[13]*i[2]*i[11] + i[4]*i[13]*i[3]*i[10] +
                i[8]*i[1]*i[6]*i[15] - i[8]*i[1]*i[7]*i[14] - i[8]*i[5]*i[2]*i[15] + i[8]*i[5]*i[3]*i[14] +
                i[8]*i[13]*i[2]*i[7] - i[8]*i[13]*i[3]*i[6] - i[12]*i[1]*i[6]*i[11] + i[12]*i[1]*i[7]*i[10] +
                i[12]*i[5]*i[2]*i[11] - i[12]*i[5]*i[3]*i[10] - i[12]*i[9]*i[2]*i[7] + i[12]*i[9]*i[3]*i[6]);
    o[0] = (i[5]*i[10]*i[15] - i[5]*i[11]*i[14] - i[9]*i[6]*i[15] + i[9]*i[7]*i[14] + i[13]*i[6]*i[11] - i[13]*i[7]*i[10]) * d;
    o[4] = (-i[4]*i[10]*i[15] + i[4]*i[11]*i[14] + i[8]*i[6]*i[15] - i[8]*i[7]*i[14] - i[12]*i[6]*i[11] + i[12]*i[7]*i[10]) * d;
    o[8] = (i[4]*i[9]*i[15] - i[4]*i[11]*i[13] - i[8]*i[5]*i[15] + i[8]*i[7]*i[13] + i[12]*i[5]*i[11] - i[12]*i[9]*i[7]) * d;
    o[12] = (-i[4]*i[9]*i[14] + i[4]*i[10]*i[13] + i[8]*i[5]*i[14] - i[8]*i[6]*i[13] - i[12]*i[5]*i[10] + i[12]*i[9]*i[6]) * d;
    o[1] = (-i[1]*i[10]*i[15] + i[1]*i[11]*i[14] + i[9]*i[2]*i[15] - i[9]*i[3]*i[14] - i[13]*i[2]*i[11] + i[13]*i[3]*i[10]) * d;
    o[5] = (i[0]*i[10]*i[15] - i[0]*i[11]*i[14] - i[8]*i[2]*i[15] + i[8]*i[3]*i[14] + i[12]*i[2]*i[11] - i[12]*i[3]*i[10]) * d;
    o[9] = (-i[0]*i[9]*i[15] + i[0]*i[11]*i[13] + i[8]*i[1]*i[15] - i[8]*i[3]*i[13] - i[12]*i[1]*i[11] + i[12]*i[9]*i[3]) * d;
    o[13] = (i[0]*i[9]*i[14] - i[0]*i[10]*i[13] - i[8]*i[1]*i[14] + i[8]*i[2]*i[13] + i[12]*i[1]*i[10] - i[12]*i[9]*i[2]) * d;
    o[2] = (i[1]*i[6]*i[15] - i[1]*i[7]*i[14] - i[5]*i[2]*i[15] + i[5]*i[3]*i[14] + i[13]*i[2]*i[7] - i[13]*i[3]*i[6]) * d;
    o[6] = (-i[0]*i[6]*i[15] + i[0]*i[7]*i[14] + i[4]*i[2]*i[15] - i[4]*i[3]*i[14] - i[12]*i[2]*i[7] + i[12]*i[3]*i[6]) * d;
    o[10] = (i[0]*i[5]*i[15] - i[0]*i[7]*i[13] - i[4]*i[1]*i[15] + i[4]*i[3]*i[13] + i[12]*i[1]*i[7] - i[12]*i[5]*i[3]) * d;
    o[14] = (-i[0]*i[5]*i[14] + i[0]*i[6]*i[13] + i[4]*i[1]*i[14] - i[4]*i[2]*i[13] - i[12]*i[1]*i[6] + i[12]*i[5]*i[2]) * d;
    o[3] = (-i[1]*i[6]*i[11] + i[1]*i[7]*i[10] + i[5]*i[2]*i[11] - i[5]*i[3]*i[10] - i[9]*i[2]*i[7] + i[9]*i[3]*i[6]) * d;
    o[7] = (i[0]*i[6]*i[11] - i[0]*i[7]*i[10] - i[4]*i[2]*i[11] + i[4]*i[3]*i[10] + i[8]*i[2]*i[7] - i[8]*i[3]*i[6]) * d;
    o[11] = (-i[0]*i[5]*i[11] + i[0]*i[7]*i[9] + i[4]*i[1]*i[11] - i[4]*i[3]*i[9] - i[8]*i[1]*i[7] + i[8]*i[5]*i[3]) * d;
    o[15] = (i[0]*i[5]*i[10] - i[0]*i[6]*i[9] - i[4]*i[1]*i[10] + i[4]*i[2]*i[9] + i[8]*i[1]*i[6] - i[8]*i[5]*i[2]) * d;
    return o;
  }

  function startWhale() {
    var canvas = whaleCanvas;
    // premultipliedAlpha:true —— three.js WebGLRenderer 官方默认值，
    // 与官网 R3F 渲染管线一致（gl: {alpha:true, antialias:true}）
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
    canvas.__dsGL = gl;   /* 供 __dshDsDispose 释放上下文 */
    if (!gl) { canvas.dataset.state = "no-webgl2"; return; }
    diag.whaleGL = true;
    var img = new Image();
    img.onload = function () {
      var data;
      try { data = sampleWhalePixels(img); } catch (e) { canvas.dataset.state = "sample-fail"; return; }
      if (!data || data.count === 0) { canvas.dataset.state = "sample-empty"; return; }
      canvas.dataset.count = data.count;
      initWhaleGL(gl, canvas, data);
    };
    img.onerror = function () { canvas.dataset.state = "img-fail"; };
    img.src = WHALE_SRC;
  }

  function initWhaleGL(gl, canvas, data) {
    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        if (typeof console !== "undefined") console.error("whale shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, WHALE_VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, WHALE_FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.dataset.state = "link-fail";
      diag.whaleProgs = "link-fail";
      return;
    }
    canvas.dataset.state = "shader-ok";
    diag.whaleProgs = "ok";
    gl.useProgram(prog);

    function buf(attr, arr, size) {
      var loc = gl.getAttribLocation(prog, attr);
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
    buf("aCenter", data.positions, 3);
    buf("aScattered", data.scatteredPositions, 3);
    buf("aOpacity", data.opacities, 1);
    buf("aEdge", data.edges, 1);
    var idx = new Float32Array(data.count);
    for (var i = 0; i < data.count; i++) idx[i] = i;
    buf("aIndex", idx, 1);
    // 官方实例缩放：s = .5 + 1*Math.random()（0.5–1.5）——粒子大小有变化，
    // 大粒子呈现小方块，是官方鲸鱼层次感的关键（chunk 776 源码原逻辑）
    var scaleArr = new Float32Array(data.count);
    for (var i2 = 0; i2 < data.count; i2++) scaleArr[i2] = 0.5 + 1 * Math.random();
    buf("aScale", scaleArr, 1);
    // position 属性默认 (0,0,0,1) —— 官方 BoxGeometry 的局部偏移对点精灵为 0

    var u = {};
    ["uTime","uWaveSpeed","uWaveAmount","uMouse","uMouseRadius","uMouseStrength","uMouseDistort",
     "uAssembly","uLoose","uScatter","uLightPos","uLightRange","uShadeMin","uShadeMax",
     "uModel","uView","uProj","uPointScale","uColor"].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // three.js AdditiveBlending
    gl.disable(gl.DEPTH_TEST);

    // 鼠标状态机（官方：mouseActive / mouseHasMoved）
    var mouse = { x: 0, y: 0, active: false, hasMoved: false };
    function onMove(e) {
      mouse.active = true;
      mouse.hasMoved = true;
      var w = window.innerWidth || 1, h = window.innerHeight || 1;
      mouse.x = (e.clientX / w) * 2 - 1;
      mouse.y = -((e.clientY / h) * 2 - 1);
    }
    function onLeave() { mouse.active = false; }
    function onVis() { if (document.hidden) mouse.active = false; }
    if (!reducedMotion) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
      document.addEventListener("visibilitychange", onVis);
    }

    var start = performance.now();
    var raf = 0;
    var last = 0;
    var FRAME = 1000 / 30;
    var strength = 0;
    var b = { x: 0, y: 0 };
    var FOV = 50 * Math.PI / 180;
    // 相机距离：官方 18 → 15（18/15 = 1.2），鲸鱼整体等比放大 1.2 倍
    var CAM_DIST = 15;
    var HALF_H = Math.tan(FOV / 2) * CAM_DIST; // viewport（z=0 平面）半高
    var view = m4Translation(0, 0, -15);

    function resize() {
      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    /* 同极光：尺寸变化用 ResizeObserver 打脏标记，帧内只比 canvas 字段。 */
    var whaleDirty = false;
    var whaleTick = 0;
    if (typeof ResizeObserver === "function") {
      try {
        var whaleRO = new ResizeObserver(function () { whaleDirty = true; });
        whaleRO.observe(canvas);
        themeCleanup.push(function () { whaleRO.disconnect(); });
      } catch (roError) { /* ignore */ }
    }
    window.addEventListener("resize", function () { whaleDirty = true; }, { passive: true });

    function frame(now) {
      if (dsDisposed) return;
      raf = requestAnimationFrame(frame);
      if (isBusy()) return;
      if (whaleLayer.style.display === "none") return;
      if (now - last < FRAME) return;
      if (dsAnimPaused(now)) { last = now; return; }
      var dt = Math.min(0.5, (now - last) / 1000);
      last = now - (now - last) % FRAME;

      if (whaleDirty) { whaleDirty = false; resize(); }
      /* 跨屏（DPR 变化但尺寸不变）每 60 帧兜一次 */
      else if ((++whaleTick % 60) === 0 &&
               Math.round((canvas.clientWidth || 1) * Math.min(window.devicePixelRatio || 1, 1.5)) !== canvas.width) resize();

      var elapsed = (now - start) / 1000;
      var L = Math.max(0, Math.min(1, (elapsed - 0.3) / 2.5));
      var D = 1 - Math.pow(1 - L, 3); // 官方 easeOutCubic 组装
      var E = 0; // 固定背景无滚动分散

      // 官方 group 变换（fish：spin=false）
      var rotZ = elapsed * ((1 - D) * 0.3) + 0.04 * Math.sin(0.25 * elapsed);
      var rotX = 0.05 * Math.sin(0.08 * elapsed * 0.7);
      var rotY = 0.1 * Math.sin(0.08 * elapsed);
      var posY = 0.15 * Math.sin(0.4 * elapsed);
      var scale = 0.75 + 0.25 * D;
      var model = m4Mul(m4Mul(m4Translation(0, posY, 0),
        m4Mul(m4RotationZ(rotZ), m4Mul(m4RotationY(rotY), m4RotationX(rotX)))), m4Scale(scale));

      var aspect = canvas.width / canvas.height;
      var proj = m4Perspective(FOV, aspect, 0.1, 100);
      gl.uniformMatrix4fv(u.uModel, false, model);
      gl.uniformMatrix4fv(u.uView, false, view);
      gl.uniformMatrix4fv(u.uProj, false, proj);
      gl.uniform1f(u.uTime, elapsed);
      gl.uniform1f(u.uWaveSpeed, WAVE_DEFAULTS.speed);
      gl.uniform1f(u.uWaveAmount, WAVE_DEFAULTS.amount);
      gl.uniform1f(u.uAssembly, D);
      gl.uniform1f(u.uLoose, 1);
      gl.uniform1f(u.uScatter, 0);
      gl.uniform1f(u.uMouseRadius, MOUSE_DEFAULTS.radius);
      gl.uniform1f(u.uMouseDistort, MOUSE_DEFAULTS.distort);
      // 鼠标强度：官方以 (1-0.05^dt) 插值
      var target = mouse.active ? MOUSE_DEFAULTS.strength : 0;
      strength += (target - strength) * (1 - Math.pow(0.05, dt));
      gl.uniform1f(u.uMouseStrength, strength);
      // 光线：官方 lightParams.followX —— light.x 跟随鼠标世界坐标
      var halfW = HALF_H * aspect;
      gl.uniform3f(u.uLightPos, LIGHT_DEFAULTS.x + mouse.x * halfW * LIGHT_DEFAULTS.followX, LIGHT_DEFAULTS.y, LIGHT_DEFAULTS.z);
      gl.uniform1f(u.uLightRange, LIGHT_DEFAULTS.range);
      /* 浅色底上的白色粒子没有 additive 加成，官方 0.5/1.7 的明暗区间在这里
         只能得到极淡的灰白；抬高下界让它直接落到接近纯白，才能看清鲸鱼剪影。 */
      gl.uniform1f(u.uShadeMin, state.dark ? LIGHT_DEFAULTS.shadeMin : 1.25);
      gl.uniform1f(u.uShadeMax, state.dark ? LIGHT_DEFAULTS.shadeMax : 1.9);
      // uMouse：屏幕鼠标 → 世界(z=0) → 组局部空间（官方 matrixWorld 逆变换）
      if (mouse.hasMoved) {
        var wx = mouse.x * halfW, wy = mouse.y * HALF_H;
        if (strength < 0.01) { b.x = wx; b.y = wy; }
        else { b.x += (wx - b.x) * MOUSE_DEFAULTS.decay; b.y += (wy - b.y) * MOUSE_DEFAULTS.decay; }
      }
      var inv = m4Inverse(model);
      var ux = inv[0]*b.x + inv[4]*b.y + inv[12];
      var uy = inv[1]*b.x + inv[5]*b.y + inv[13];
      gl.uniform2f(u.uMouse, ux, uy);
      // 颜色：官方 uColor = (.75P, .8P, .9P)，P = D*max(0,1-1.5E)
      // 两种主题都用作者原设计的白色粒子：深色靠 additive 发光，浅色靠
      // normal 合成压在中蓝 hero 渐变上（官网首页的白鲸就是这样浮在蓝色上的）。
      if (state.dark) {
        gl.uniform3f(u.uColor, 0.92 * D, 0.96 * D, 1.0 * D);
      } else {
        gl.uniform3f(u.uColor, 0.97 * D, 0.98 * D, 1.0 * D);
      }
      // 点尺寸：官方 BoxGeometry 0.06 单位 × 实例缩放 × 组缩放
      // 浅色底上需要更大的点才看得清（深色有 screen 混合加成）
      gl.uniform1f(u.uPointScale, (state.dark ? 0.06 : 0.095) * scale * (canvas.height / (2 * HALF_H)));

      /* 混合模式必须随主题切换：深色用 additive（加亮发光），
         浅色底上加亮等于看不见 —— 必须换成普通 alpha 混合，深蓝粒子才能真正压暗背景。 */
      if (state.dark) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      } else {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, data.count);
    }

    if (reducedMotion) {
      start = performance.now() - 30000; // 组装动画已完成的状态下绘制单帧
      last = 0;
      frame(performance.now());
      cancelAnimationFrame(raf);
      raf = 0;
    } else {
      raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        if (!raf) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 星座网格引擎（2D canvas）
   * ------------------------------------------------------------------ */
  function startConstellation() {
    var canvas = constellationCanvas;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    diag.constellation = true;

    var dpr = 1;
    var dots = [], cols = 0, rows = 0;
    var CW = 0, CH = 0;
    var constTick = 0;
    var mouse = { x: NaN, y: NaN };
    var raf = 0;
    var idle = false;
    var last = 0;
    var FRAME = 1000 / 30;
    var resizeTimer = null;

    function buildGrid() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      cols = Math.ceil(w / 90) + 1;
      rows = Math.ceil(h / 90) + 1;
      var ox = (w - (cols - 1) * 90) / 2;
      var oy = (h - (rows - 1) * 90) / 2;
      dots = [];
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var rx = ox + 90 * x, ry = oy + 90 * y;
          dots.push({ restX: rx, restY: ry, x: rx, y: ry, vx: 0, vy: 0 });
        }
      }
    }
    function resize() {
      var cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (!(cw > 0 && ch > 0)) return;   /* 未布局：不要用 0 宽高建网格 */
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      CW = cw; CH = ch;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }
    resize();

    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      wake();
    }
    if (!reducedMotion) window.addEventListener("mousemove", onMove, { passive: true });

    function draw(mx, my, active) {
      var opts = currentConstellation();
      var w = CW || canvas.clientWidth, h = CH || canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = opts.lineColor + " " + opts.lineOpacity + ")";
      ctx.lineWidth = 0.5;
      var i, j, a, b, dx, dy, dist, ux, uy;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols - 1; i++) {
          a = dots[j * cols + i]; b = dots[j * cols + i + 1];
          dx = b.x - a.x; dy = b.y - a.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) continue;
          ux = dx / dist; uy = dy / dist;
          ctx.beginPath();
          ctx.moveTo(a.x + 10 * ux, a.y + 10 * uy);
          ctx.lineTo(b.x - 10 * ux, b.y - 10 * uy);
          ctx.stroke();
        }
      }
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows - 1; j++) {
          a = dots[j * cols + i]; b = dots[(j + 1) * cols + i];
          dx = b.x - a.x; dy = b.y - a.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) continue;
          ux = dx / dist; uy = dy / dist;
          ctx.beginPath();
          ctx.moveTo(a.x + 10 * ux, a.y + 10 * uy);
          ctx.lineTo(b.x - 10 * ux, b.y - 10 * uy);
          ctx.stroke();
        }
      }

      ctx.fillStyle = opts.dotColor + " " + opts.dotOpacity + ")";
      for (i = 0; i < dots.length; i++) {
        var p = dots[i];
        var n = 1.8, alpha = opts.dotOpacity;
        if (!isNaN(mx) && !isNaN(my)) {
          dx = p.x - mx; dy = p.y - my;
          dist = Math.sqrt(dx * dx + dy * dy);
          var l = Math.max(0, 1 - dist / 140);
          n = 1.8 + 2 * l;
          alpha = opts.dotOpacity + 0.4 * l;
        }
        ctx.globalAlpha = alpha;
        if (opts.round) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, n, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(p.x - n, p.y - n, 2 * n, 2 * n);
        }
      }
      ctx.globalAlpha = 1;
    }

    function wake() {
      if (idle) {
        idle = false;
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    }

    function loop(now) {
      if (dsDisposed) return;
      if (isBusy()) { last = now; raf = requestAnimationFrame(loop); return; }
      if (now - last < FRAME) { raf = requestAnimationFrame(loop); return; }
      last = now - (now - last) % FRAME;
      if (dsAnimPaused(now)) { raf = requestAnimationFrame(loop); return; }

      // 尺寸由 resize 监听（150ms 去抖）驱动；这里只兜「首帧早于布局」
      if (!CW) resize();
      else if ((++constTick % 60) === 0 && Math.round(CW * dpr) !== canvas.width) resize();

      var mx = mouse.x, my = mouse.y;
      var maxSpeed = 0;
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        if (!isNaN(mx) && !isNaN(my)) {
          var dx = p.x - mx, dy = p.y - my;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140 && d > 0.1) {
            var e = (1 - d / 140) * 30;
            var ux = dx / d, uy = dy / d;
            p.vx += ux * e * 0.1;
            p.vy += uy * e * 0.1;
          }
        }
        p.vx += 0.05 * (p.restX - p.x);
        p.vy += 0.05 * (p.restY - p.y);
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
        var sp = Math.abs(p.vx) + Math.abs(p.vy);
        if (sp > maxSpeed) maxSpeed = sp;
      }
      draw(mx, my, true);
      if (maxSpeed < 0.01) {
        idle = true;
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    if (reducedMotion) {
      draw(NaN, NaN, false); // 静态单帧
    } else {
      idle = false;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        wake();
      }, 150);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 主题联动
   * ------------------------------------------------------------------ */
  function observeTheme() {
    var apply = function () {
      var d = detectDark();
      if (d !== state.dark) {
        state.dark = d;
        applyThemeClass();
      }
    };
    if (window.MutationObserver) {
      var mo = new MutationObserver(apply);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme", "class"] });
      if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme"] });
      else document.addEventListener("DOMContentLoaded", function () { mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme"] }); });
      themeCleanup.push(function () { mo.disconnect(); });
    }
    if (darkQuery && darkQuery.addEventListener) {
      darkQuery.addEventListener("change", apply);
    }
    /* 属性监听之外再加一条低频对账：宿主重连、主题服务晚到、或者
       data-* 属性没变化但实际配色已经换掉时，光靠 MutationObserver 会一直岔着
       （浅底 + 深色文字那种「洗白」就是这个岔掉的样子）。
       注意只在「主题真的变了」时才跑 apply：apply 里要扫一遍所有 [data-slot]
       做穿透，每 2 秒无条件跑一次会持续触发布局计算，拖动窗口和切主题都会卡。 */
    var themeTimer = setInterval(function () {
      var nowDark = detectDark();
      if (nowDark !== state.dark) apply();
    }, 2500);
    themeCleanup.push(function () { clearInterval(themeTimer); });
  }

  /* ------------------------------------------------------------------ *
   * 右上角主题切换按钮
   *   座位：conversation.session.header.utilities（header 最右侧工具区，list、
   *         replaceRisk=none，不会顶掉官方控件）
   *   唯一的偏好写入口是 theme service 的 setTheme(id)；连续同步只订阅
   *   `theme/change` 事件（不轮询 DOM）。theme 服务缺失时按钮整体不出现。
   * ------------------------------------------------------------------ */
  function isChineseUI() {
    var lang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    return lang.indexOf("zh") === 0;
  }

  function themeServiceOf(context) {
    if (!context || typeof context.get !== "function") return null;
    var service = null;
    try { service = context.get("theme"); } catch (error) { service = null; }
    if (!service || typeof service.getTheme !== "function" || typeof service.setTheme !== "function") return null;
    return service;
  }

  function currentDark(service) {
    try {
      var snapshot = service.getTheme();
      if (snapshot && snapshot.active && snapshot.active.colorScheme) return snapshot.active.colorScheme === "dark";
    } catch (error) { /* 快照不可读时退回 DOM 探测 */ }
    return detectDark();
  }

  function themeToggleIcon(targetDark) {
    if (primitives) {
      var Icon = targetDark ? primitives.IconDarkOutline16 : primitives.IconLightOutline16;
      if (typeof Icon === "function") return React.createElement(Icon, { size: 16 });
    }
    var svg = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", focusable: "false" };
    if (targetDark) {
      return React.createElement("svg", svg,
        React.createElement("path", {
          d: "M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z",
          fill: "currentColor"
        }));
    }
    return React.createElement("svg", svg,
      React.createElement("circle", { cx: 8, cy: 8, r: 3.1, fill: "currentColor" }),
      React.createElement("path", {
        d: "M8 1.4v1.6M8 13v1.6M1.4 8H3M13 8h1.6M3.5 3.5 4.6 4.6M11.4 11.4l1.1 1.1M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1",
        stroke: "currentColor",
        strokeWidth: 1.3,
        strokeLinecap: "round"
      }));
  }

  /* ------------------------------------------------------------------ *
   * 令牌覆盖（与构建版本无关的透出方案）
   *
   * 这条路径存在的理由：插件 CSS 里的 CSS Modules 类名（.pI_x6G_frame、
   * .wSkVaW_root 等）是构建时哈希出来的，换一个 DSH 版本就会整体失效 ——
   * 那时背景被盖住、玻璃拟态不生效，只能靠肉眼发现。而底色其实全部来自
   * theme 令牌：layout 的 ThemePresenter 会把 snapshot.active.tokens 逐条
   * 写成 body 的内联样式，布局容器再 background:var(--dsw-alias-bg-base)
   * 消费它。所以只要把这两个令牌改成半透明，所有层（不管类名叫什么）都会
   * 一起透出背景，且浅色主题保持官方原值不受影响。
   * ------------------------------------------------------------------ */
  var TOKEN_OVERRIDE_SOURCE = "dsh-official-skin";
  /* 只覆盖侧边栏填充色。
     --dsw-alias-bg-base 是「应用底色」，弹窗 / 设置页 / 菜单也用同一个令牌 ——
     把它改成半透明会连带把面板一起变透明（用户反馈「打开其他面板背景也变透明」）。
     主布局的透出改由「布局主脊 punch-through」负责，面板因此保持官方不透明。 */
  var TOKEN_OVERRIDE_LAYER = {
    "--dsw-specific-sidebar-fill": {
      /* 浅色主题原本是 rgba(255,255,255,0.08)：会在顶部压出一层比页面更亮的白膜，
         同样是「多出来一条带」的观感。和深色一样改成 fully transparent。
         浅色侧边栏玻璃自带 rgba(255,255,255,.18) 的独立规则，不吃这个令牌。 */
      light: "transparent",
      /* 深色主题：这个令牌除了侧边栏，还被两处 Windows 标题栏消费 ——
         `.pI_x6G_frame::before`（40px 标题栏条）与 titleBarOverlay 的 caption 底色。
         0.42 的黑会让顶部出现一条比页面更暗、且没有渐变的实心带，caption 区则被
         压在同一个实心底上，看起来像「窗口没被皮肤覆盖到」。改成 fully transparent
         后条带与页面渐变连成一片，caption 也直接透出背景；侧边栏自身的底色在
         上方 CSS 里另有 !important 覆盖（rgba(13,15,19,.55)），不受影响。 */
      dark: "transparent"
    }
  };

  function installTokenOverrides(context) {
    var settled = false;
    function attempt() {
      if (settled) return true;
      var service = themeServiceOf(context);
      if (service === null || typeof service.overrideTokens !== "function") return false;
      try {
        service.overrideTokens(TOKEN_OVERRIDE_SOURCE, TOKEN_OVERRIDE_LAYER);
        settled = true;
        return true;
      } catch (error) {
        // 令牌名不被接受（旧版本/自定义主题注册表）时静默放弃，CSS 路径仍在
        return false;
      }
    }
    if (attempt()) return;
    // theme 服务可能晚于本插件就绪：轮询一段时间后放弃（不阻塞、不抛错）
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      if (attempt() || attempts > 60) clearInterval(timer);
    }, 500);
  }

  /* 兜底按钮：不再依赖插槽渲染。
     会话 header 在没有活跃会话时整块不渲染（renderOutletContent 对
     scope==="session" 且 sessionId===undefined 的插槽直接返回 fallback），
     shell.overlay 座位也受插槽系统/布局时机影响 —— 实测两个座位都可能不出现。
     这里直接往 body 上挂一个 fixed 定位的普通 button，完全不经过 React 插槽，
     只要插件 apply 成功就一定看得见。header 座位真有可见按钮时自动让位。 */
  function toggleIconMarkup(targetDark) {
    if (targetDark) {
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" fill="currentColor"/></svg>';
    }
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="3.1" fill="currentColor"/><path d="M8 1.4v1.6M8 13v1.6M1.4 8H3M13 8h1.6M3.5 3.5 4.6 4.6M11.4 11.4l1.1 1.1M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  }

  /* 点一下就把主题翻过去；theme 服务暂时拿不到（客户端正在重连）时，
     每 400ms 重试一次，最多 8 次 —— 否则点了完全没反应，只能等重连完再点。 */
  function requestThemeFlip() {
    var tries = 0;
    (function attempt() {
      var ctx = window.__dshDsToggleContext;
      var service = themeServiceOf(ctx);
      if (service !== null) {
        /* 目标值以「页面当前真实配色」为准（detectDark 读 body 属性）。
           用 service.getTheme() 的快照会在宿主还没重渲染时给出上一次的状态，
           于是 setTheme 被写成「当前已经是这个值」，点击看起来完全没反应。 */
        var nextDark = !detectDark();
        try {
          service.setTheme(nextDark ? "dark" : "light");
        } catch (flipError) {
          if (window.console && console.warn) console.warn("[dsh-official-skin] setTheme failed:", flipError);
        }
        return;
      }
      tries += 1;
      if (tries > 8) {
        if (window.console && console.warn) console.warn("[dsh-official-skin] theme service unavailable");
        return;
      }
      if (typeof setTimeout === "function") setTimeout(attempt, 400);
    })();
  }

  function installFloatingButton(context) {
    if (!document.body) return;
    /* 每次 apply 都把最新 context 挂到 window：按钮的监听器只绑一次，
       之后统一从这里取当下有效的服务实例。插件重新 activate 一次就
       多绑一个监听器的话，一次点击会连着 setTheme 两次（深→浅→深），
       表现就是「点了没反应」或「闪一下又弹回原样」。 */
    window.__dshDsToggleContext = context;
    var btn = document.getElementById("dsh-ds-theme-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "dsh-ds-theme-btn";
      btn.type = "button";
      btn.className = "dsh-ds-theme-toggle";
      btn.setAttribute("data-dsh-deepseek-bg", "theme-toggle-dom");
      btn.style.cssText = "position:fixed;top:46px;right:20px;z-index:2147483000;pointer-events:auto;-webkit-app-region:no-drag;";
      document.body.appendChild(btn);
    }
    if (!btn.__dsBound) {
      btn.__dsBound = true;
      btn.addEventListener("click", requestThemeFlip);
    }
    var zh = isChineseUI();
    function sync() {
      var service = themeServiceOf(window.__dshDsToggleContext);
      var dark = service === null ? detectDark() : currentDark(service);
      var label = dark ? (zh ? "切换到浅色主题" : "Switch to light theme")
        : (zh ? "切换到深色主题" : "Switch to dark theme");
      if (btn.title !== label) {
        btn.title = label;
        btn.setAttribute("aria-label", label);
        btn.innerHTML = toggleIconMarkup(!dark);
      }
      /* header 座位真有可见按钮时让位，避免右上角出现两个 */
      var visible = false;
      var nodes = document.querySelectorAll('[data-dsh-deepseek-bg="theme-toggle"]:not(.dsh-ds-theme-toggle--floating)');
      for (var i = 0; i < nodes.length; i += 1) {
        var box = nodes[i].getBoundingClientRect();
        if (box.width > 2 && box.height > 2) { visible = true; break; }
      }
      var nextDisplay = visible ? "none" : "inline-flex";
      if (btn.style.display !== nextDisplay) btn.style.display = nextDisplay;
    }
    sync();
    /* 订阅同样只建一次：反复 apply 会叠出多个 MutationObserver 和定时器 */
    if (!btn.__dsWatching) {
      btn.__dsWatching = true;
      if (typeof context.on === "function") context.on("theme/change", sync);
      if (window.MutationObserver && document.body) {
        var mo = new MutationObserver(sync);
        mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme"] });
      }
      setInterval(sync, 1500);
    }
  }

  function registerThemeToggle(context) {
    if (!context || !context.slots || typeof context.slots.inject !== "function") return;
    if (typeof React === "undefined" || !React || typeof React.createElement !== "function") return;
    /* 点击处理器统一从这里取服务实例（以前只有 DOM 兜底按钮会赋值，
       去掉兜底后必须在这里挂，否则点击拿不到主题服务）。 */
    window.__dshDsToggleContext = context;
    var zh = isChineseUI();

    /* 主题服务的取用全部做成「渲染时惰性解析」：不在 apply 阶段 inject("theme")，
       否则 theme 迟迟不出现时这条子 fiber 会停在 PENDING，把 web boot 的
       loader.await()/activate 断言一起拖死。读不到服务时退回 DOM 探测（layout 的
       ThemePresenter 会把 data-ds-dark-theme 同步写到 body，两者等价）。 */
    function readDark() {
      var service = themeServiceOf(context);
      return service === null ? detectDark() : currentDark(service);
    }

    function ThemeToggle(props) {
      var floating = !!(props && props.variant === "floating");
      var pair = React.useState(readDark);
      var renderedDark = pair[0];
      var setRenderedDark = pair[1];
      /* 兜底座位只在「header 里没有我们的按钮」时才显示，
         避免有会话时右上角出现两个一样的按钮 */
      var hidePair = React.useState(false);
      var hidden = hidePair[0];
      var setHidden = hidePair[1];
      React.useEffect(function () {
        var sync = function () { setRenderedDark(readDark()); };
        sync();
        var off = typeof context.on === "function" ? context.on("theme/change", sync) : undefined;
        var mo = null;
        if (window.MutationObserver && document.body) {
          mo = new MutationObserver(sync);
          mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme"] });
        }
        var poll = null;
        if (floating) {
          var check = function () {
            /* 只有「真的看得见」的 header 按钮才让浮动按钮让位：
               header 容器可能整块 display:none（无活跃会话），此时它的按钮仍在 DOM 里，
               按选择器判断会把两个按钮一起藏起来（正是此前按钮消失的原因）。 */
            var nodes = document.querySelectorAll('[data-dsh-deepseek-bg="theme-toggle"]:not(.dsh-ds-theme-toggle--floating)');
            var visible = false;
            for (var i = 0; i < nodes.length; i += 1) {
              var box = nodes[i].getBoundingClientRect();
              if (box.width > 2 && box.height > 2) { visible = true; break; }
            }
            setHidden(visible);
          };
          check();
          poll = setInterval(check, 600);
          /* 600ms 轮询在「新建会话」这一刻太慢：欢迎页的浮动按钮还在，header 的
             按钮已经挂上，两张图标会同时出现小半秒。视图级切换时立刻补查三次
             （当帧 / 下一帧 / 120ms 后），把重叠窗口压到一帧以内。 */
          var onChange = function () {
            check();
            requestAnimationFrame(check);
            setTimeout(check, 120);
          };
          window.addEventListener("dsh-ds-shell-change", onChange);
        }
        return function () {
          if (typeof off === "function") off();
          if (mo) mo.disconnect();
          if (poll) clearInterval(poll);
          window.removeEventListener("dsh-ds-shell-change", onChange);
        };
      }, [floating]);
      if (floating && hidden) return null;
      var targetDark = !renderedDark;
      var label = targetDark ? (zh ? "切换到深色主题" : "Switch to dark theme")
        : (zh ? "切换到浅色主题" : "Switch to light theme");
      return React.createElement("button", {
        type: "button",
        className: floating ? "dsh-ds-theme-toggle dsh-ds-theme-toggle--floating" : "dsh-ds-theme-toggle",
        /* 两种变体必须用不同的值：查「header 按钮是否可见」时若把自己也算进去，
           floating 按钮会判定「已有可见按钮」而隐藏自己，无会话时两个按钮一起消失。 */
        "data-dsh-deepseek-bg": floating ? "theme-toggle-overlay" : "theme-toggle",
        title: label,
        "aria-label": label,
        onClick: function () {
          /* 目标值必须「点击瞬间」读当前主题：用渲染期算出的 targetDark 会在
             React 尚未重渲染时给出上一次的目标，setTheme 因 preference 未变直接
             return，表现为「点两下才切换一次」。 */
          window.__dshDsToggleContext = context;
          requestThemeFlip();
        }
      }, themeToggleIcon(targetDark));
    }

    try {
      context.slots.inject("conversation.session.header.utilities", function () {
        return context.slots.register({
          name: "conversation.session.header.utilities",
          id: "dsh-official-skin:theme-toggle",
          order: 15,
          registrant: "dsh-official-skin",
          inject: function () { return {}; }
        }, ThemeToggle);
      });
    } catch (error) {
      // 座位缺失/已被替换时按钮不出现，背景效果本身不受影响
      if (window.console && console.error) console.error("[dsh-official-skin] theme toggle slot unavailable:", error);
    }

    /* 兜底：会话 header 在没有活跃会话时整块不渲染（renderOutletContent 对
       scope==="session" 且 sessionId===undefined 的插槽直接返回 fallback），
       此时上面那个座位不会出现，改由 root 级的 shell.overlay 补一个固定右上角的按钮 */
    try {
      context.slots.inject("shell.overlay", function () {
        return context.slots.register({
          name: "shell.overlay",
          id: "dsh-official-skin:theme-toggle-overlay",
          order: 60,
          registrant: "dsh-official-skin",
          inject: function () { return { variant: "floating" }; }
        }, ThemeToggle);
      });
    } catch (error) {
      if (window.console && console.error) console.error("[dsh-official-skin] overlay toggle slot unavailable:", error);
      /* 插槽彻底不可用时的最后兜底：只有走到这里才建 DOM 固定按钮。
         以前是 boot 时无条件创建，结果「无活跃会话」（新建会话欢迎页）时它和
         shell.overlay 的浮动按钮同时出现 —— 46px / 56px 错开 10px，就是右上角
         看起来「两层图标」的那一幕。 */
      try { installFloatingButton(context); } catch (floatingError) {
        if (window.console && console.error) console.error("[dsh-official-skin] floating toggle failed:", floatingError);
      }
    }
  }

  /* fail-open：背景是纯装饰，任何一步（WebGL 不可用、查询选择器异常、DOM 结构变化）
     都不允许把异常抛出去 —— 抛出会让本条目 fiber 失败，web boot 的 activate 断言
     直接掀掉整个界面。 */
  try {
    boot();
  } catch (bootError) {
    if (window.console && console.error) console.error("[dsh-official-skin] boot failed:", bootError);
  }
  try {
    registerThemeToggle(ctx);
  } catch (toggleError) {
    if (window.console && console.error) console.error("[dsh-official-skin] theme toggle failed:", toggleError);
  }
  try {
    installTokenOverrides(ctx);
  } catch (tokenError) {
    if (window.console && console.error) console.error("[dsh-official-skin] token override failed:", tokenError);
  }
}

    exports.apply = apply;
    exports.inject = ["slots"];
    return module.exports;
  }
});
