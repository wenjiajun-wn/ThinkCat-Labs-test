# 第一阶段验收报告

验收日期：2026-11-09。范围为现有首页和已有隐私页，以及静态部署链路。

## 环境和工程检查

| 命令或步骤 | 实际结果 |
|---|---|
| `node -v` / `npm -v` | Node.js 22.23.1 / npm 10.9.8。项目使用 npm，现已生成 lockfile v3。 |
| `npm install` | 沙箱内 registry 请求返回 EACCES。授权网络访问后从官方 HTTPS registry 安装成功。SSL 校验保持开启。 |
| 配置 ESLint | `latest` 解析到 TypeScript 7，与官方 lint 解析器支持范围不符。锁定 TypeScript 5.9.3、Node 22 类型和兼容的 ESLint 9 / Next 16 配置。 |
| `npm ci --offline --no-audit` | 失败，缓存缺少 `tslib`。 |
| `npm ci --no-audit --fetch-retries=0 --fetch-timeout=30000` | 成功，安装 348 个包。此前损坏的 SWC 原生文件恢复，构建可加载 SWC。 |
| `npm run typecheck` | 通过。 |
| `npm run lint` | 首次 13 个错误，修复内部路由链接、JSX 转义及脚本导入后通过，零警告。 |
| `npm run build` | 通过。Next 16.4.5 静态预渲染首页、隐私、404 和 SEO 文件。 |
| `node scripts/check-export.mjs` | 通过。检查七个章节、单一 H1、语言、锚点、本地资源、外部运行时资源和 SEO 文件。 |
| `npm run preview` | 已在 `127.0.0.1:3000` 启动，直接读取 `out/`。 |
| `npm audit --json` | 8 条中危记录来自同一项 minimatch 漏洞及依赖链，见下文。 |
| `npm audit --omit=dev --json` | 0 条漏洞记录。 |

未使用 `--force`、`--legacy-peer-deps` 或关闭 TLS。`npm ls --depth=0` 还显示两个 Sharp 可选相关条目为 extraneous（`@emnapi/runtime` 和 `@img/sharp-wasm32`），构建未受影响。部署范围为 `out/`。

## 浏览器视觉与交互

| 项目 | Edge 本地生产预览结果 |
|---|---|
| 桌面、平板、移动 | 使用 1440×1000、768×1024、390×844 和 320×740 CSS 视口。七个章节均有内容和布局高度，首屏 SVG 正常渲染。检测未发现页面水平溢出，抽查视图未见标题截断或内容重叠。 |
| 行业切换 | 五个行业均实点。每次选中状态、标题和 SVG 曲线数据同步更新。390px 视口使用 Enter 切换也成功。 |
| 技术详情 | 三个原生详情均可展开，实际读取到三个 open 状态。 |
| 导航 | 桌面点测应用入口，移动点测应用、技术、研究、关于及联系 CTA。已确认移动菜单展开、选中链接后关闭，隐私页和返回首页成功。其他同页导航目标由静态锚点检查覆盖。快速连续自动点击一度超时，研究入口单独重测成功。 |
| 控制台 | 在所测流程中 Edge 捕获的 error / warn 列表为空。 |
| 动画 | 实测导航滚动，查看区块进入视口后的实际显示。保留减少动态效果规则。未采集帧率、未实测系统减少动态效果开关。 |
| 截图 | 保存桌面、平板、移动首屏和移动应用、联系区至 `artifacts/screenshots/`。整页截图超时，交付关键视口截图。Edge 个人配置注入的悬浮图标出现在部分截图中，与网站产物无关。 |

本轮保留米白、墨黑、酸橙绿。调整首屏标题换行、移动首屏高度、窄屏按钮换行、触控区域和图表对比，技术区在明暗底色上使用不同曲线颜色。页面章节和交互范围保持第一阶段。

## 部署与剩余事项

`out/` 可由静态 HTTP 服务读取，Nginx 部署步骤见 `DEPLOY_CN.md`。未运行目标 Nginx、未更改服务器。首页使用系统字体回退，原创 SVG 随 HTML 输出。未发现外部字体文件、Google Fonts、Google CDN、图库素材、外部图标库或运行时资源 URL。

工程上具备进入第二阶段的条件。正式上线前须填入真实域名、法定主体、联系渠道及适用备案信息，完成隐私内容确认、目标 Nginx 和移动真机验证、Lighthouse 测量及许可证人工复核。实际域名未提供，默认产物使用 noindex 并导出不含占位域名的 sitemap。

完整 npm 扫描的中危记录由开发工具中的 minimatch 10.2.6 引发。当前上游依赖范围未涵盖修复版本 11.0.1，保留告警供后续升级，未强制跨 major 覆盖。详见 `COMMERCIAL_COMPLIANCE_REPORT.md` 与 `artifacts/npm-audit.json`。

最终复测中，一次重复启动构建触发 Next 并行构建锁。保留单一构建进程后，测试域名和默认无域名两种构建均完成。测试域名 `https://example.invalid/` 只用于校验。校验确认有域名时生成首页 canonical、robots 的 Sitemap 地址及两条 sitemap URL。随后重建为无域名预览版本并通过 noindex 与空 sitemap 校验。

本机 HTTP 探测最初在默认沙箱内返回 EACCES，另一次跨进程探测超时。在同一次授权执行内启动预览和发送请求后，`node artifacts/check-http.mjs` 通过。首页、隐私、robots、sitemap、许可证声明和 9 个首页静态资源返回 200，不存在的路由返回 404，JS 与 CSS MIME 类型正确。
