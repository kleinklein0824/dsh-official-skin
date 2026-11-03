/**
 * dsh-official-skin — 宿主半边
 *
 * 视觉全在客户端半边 `lib/client.js`。宿主半边只负责两件事：
 *   1. 成为 cordis 树上的一行（`dsh.client` 产物靠宿主 Loader 条目被
 *      `dsh-client-modules` 扫出来、编进 `window.__DSH_BOOT__`）。
 *   2. 静态审计客户端产物（只读文件、不执行），产物缺关键标志时提前在日志里说清楚。
 *
 * 纪律：apply 绝不抛错（否则 web boot 的 activate 断言掀掉整页白屏）；
 * inject 一个都不声明（声明未 provide 的服务会让 fiber 卡 PENDING）；
 * 不打日志噪音。
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PACKAGE_ID = "dsh-official-skin";

/**
 * 静态核对客户端产物：只读文件、查关键标志，**不执行**产物。
 */
function auditClientBundle(log) {
  try {
    const bundle = readFileSync(fileURLToPath(new URL("./client.js", import.meta.url)), "utf8");
    const problems = [];
    if (!bundle.includes(`id: "${PACKAGE_ID}"`) && !bundle.includes(`id:"${PACKAGE_ID}"`)) problems.push("bundle id 不匹配");
    if (!bundle.includes("__ModuleLoader__.load")) problems.push("不是模块加载器 bundle");
    if (!bundle.includes("return module.exports")) problems.push("工厂没有交出 exports");
    if (!/exports\.apply\s*=/.test(bundle)) problems.push("没有导出 apply");
    if (!bundle.includes("dsh-ds-bg")) problems.push("没有背景容器");
    if (!bundle.includes("conversation.session.header.utilities")) problems.push("没有注册主题切换按钮的插槽");
    if (problems.length > 0) {
      log(`客户端产物 lib/client.js 检查未通过（背景与按钮可能都不会出现）：${problems.join("；")}`);
      return;
    }
    log(`客户端产物 lib/client.js 就绪（${Buffer.byteLength(bundle, "utf8")} 字节，静态检查通过）`);
  } catch (error) {
    log(`客户端产物 lib/client.js 不可读（背景不会出现）：${String(error)}`);
  }
}

export function apply(ctx) {
  try {
    const candidate = ctx?.logger;
    const sink = typeof candidate === "function" ? candidate(PACKAGE_ID) : candidate;
    const log = (message) => {
      try {
        if (sink && typeof sink.info === "function") sink.info(`[${PACKAGE_ID}] ${message}`);
      } catch {
        /* 日志失败不影响插件 */
      }
    };
    auditClientBundle(log);
  } catch {
    /* 宿主半边永不抛错 */
  }
}

export default { apply };
