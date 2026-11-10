# Thinkcat Labs 官网交接文档

版本：V5.2 前端体验精修  
更新日期：2026-11-09  
交接范围：前端源码、设计系统、静态导出、Playground 前端、API Docs 前端、浏览器验收证据

---

## 1. 交接结论

当前前端可以进入视觉验收、内容确认和部署准备阶段。

- 中英文静态站点已完整导出。
- 首页、Products、Playground、API Docs、Solutions、Vision、Research、Contact、Privacy 均已统一到 V5.2 设计系统。
- 浏览器验收覆盖 2 种语言、9 个页面、3 个视口，共 54 个页面/视口组合，无横向溢出。
- 最终 QA 无 console 错误、页面异常或失败网络请求。
- 所有 Playground 结果明确标注 Demo。
- 所有 API 文档明确标注 Draft，不冒充已上线服务。
- 未开发、未接入、未部署后端、FastAPI、GPU 模型或真实推理 API。

**当前目录没有 Git 仓库。** 接手后建议第一时间初始化 Git，把当前状态作为基线提交，再进行后续修改。

```bash
git init
git add .
git commit -m "chore: baseline Thinkcat Labs V5.2"
```

`.next/`、`out/`、`node_modules/`、`.browser-profile*/` 已在 `.gitignore` 中忽略。`screenshots/v5.2` 是验收证据，是否纳入版本库由团队决定。

---

## 2. 快速开始

### 环境

- Node.js 22.x
- npm 10.x

### 本地开发

```bash
npm ci
npm run dev
```

开发地址由 Next.js 输出，默认通常为 `http://localhost:3000`。直接访问 `/zh/` 或 `/en/`。

### 质量检查

```bash
npm run typecheck
npm run lint
npm run build
node scripts/check-export.mjs
```

### 静态预览

```bash
npm run build
npm run preview
```

`npm run preview` 固定监听 `http://127.0.0.1:3000`。如果端口已被占用，先结束占用该端口的开发服务。

### 视觉验收

视觉脚本需要一个正在运行的静态服务器，默认地址为 `http://127.0.0.1:3100`：

```bash
# 终端 A
python -m http.server 3100 --bind 127.0.0.1 --directory out

# 终端 B
node scripts/visual-qa.mjs
```

脚本会覆盖 `screenshots/v5.2/after` 中的截图并重写 `qa-report.json`。如果团队使用其他静态服务器，请同步修改 `scripts/visual-qa.mjs` 中的 `BASE` 常量。

---

## 3. 技术栈与架构

| 层 | 方案 |
| --- | --- |
| 框架 | Next.js 16.4.5 App Router |
| UI | React 19.3.1 + TypeScript 5.9.3 |
| 样式 | 原生 CSS，集中设计令牌 |
| 静态导出 | `next.config.ts` 中 `output: 'export'` |
| 字体 | 操作系统本地字体，无外部字体请求 |
| 图标/图形 | 原创 SVG / CSS / React 代码 |
| 生产依赖 | 仅 Next.js、React、React DOM |
| 后端 | 无 |
| GPU / 推理 | 无 |

应用入口：

```text
app/[locale]/layout.tsx          HTML lang、页眉页脚、静态参数
app/[locale]/page.tsx            Home
app/[locale]/[page]/page.tsx     本地化页面分发
app/globals.css                  V5.2 设计令牌和主站样式
app/legacy.css                   旧 noindex 路由的隔离样式
app/icon.svg                     原创品牌图标
```

### 路由

```text
/zh/                 /en/
/zh/products/        /en/products/
/zh/vision/          /en/vision/
/zh/solutions/       /en/solutions/
/zh/docs/            /en/docs/
/zh/playground/      /en/playground/
/zh/research/        /en/research/
/zh/contact/         /en/contact/
/zh/privacy/         /en/privacy/
```

旧独立页面位于 `app/(legacy)/`，继续以 `noindex` 导出，不是新页面模板。

### 静态导出的两个注意点

1. 必须使用 `npm run build`，不要直接运行 `next build`。`postbuild` 会执行 `scripts/static-rsc-aliases.mjs`，为 Next 16 动态路由生成 RSC 预取别名，避免浏览器 404。
2. 未设置 `NEXT_PUBLIC_SITE_URL` 时，本地 `out/` 是 `noindex` 预览包，没有正式 canonical、hreflang 或 sitemap 条目。正式发布前必须用真实 HTTPS 域名重新构建。

---

## 4. 目录地图

```text
app/                    路由、静态参数、全局样式
components/
  layout/               品牌、页眉、移动菜单、语言切换、页脚
  pages/                页面级组合视图
  home/                 首页模型索引、行业索引
  playground/           Playground 的数据、配置、结果面板
  docs/                 代码块、代码 Tabs
  visualizations/       所有原创数据图形
content/                中英文内容资源
config/                 语言、路由、模型、站点、SEO
lib/                    CSV 解析、合成数据、本地演示模型
scripts/                构建后处理、导出检查、视觉 QA
screenshots/v5.2/       优化前后截图与 QA 报告
docs/                   工程补充说明
```

### 关键页面文件

| 页面 | 入口 |
| --- | --- |
| Home | `app/[locale]/page.tsx` |
| Products | `components/pages/products-page.tsx` |
| Playground | `components/pages/playground-page.tsx` + `components/playground.tsx` |
| API Docs | `components/pages/docs-page.tsx` + `components/developer-docs.tsx` |
| Solutions | `components/pages/solutions-page.tsx` |
| Vision | `components/pages/vision-page.tsx` |
| Research | `components/pages/research-page.tsx` |
| Contact | `components/pages/contact-page.tsx` |
| Privacy | `components/pages/privacy-page.tsx` |

---

## 5. 内容维护

所有可见文案与 UI 分离。组件只接收 locale 并渲染内容资源。

| 内容 | 文件 |
| --- | --- |
| 导航、页面标题、简介、共享状态词 | `content/i18n.ts` |
| 首页所有章节 | `content/home.ts` |
| Products 模型叙事与交互说明 | `content/products.ts` |
| Solutions 五个行业 | `content/solutions.ts` |
| Vision | `content/vision.ts` |
| Research | `content/research.ts` |
| API Docs | `content/docs.ts` |
| Playground 标签、错误、状态 | `content/playground.ts` |
| Contact、Privacy | `content/contact.ts` |
| 模型状态、顺序、版本、外链 | `config/models.ts` |
| 站点主体、邮箱、备案、origin | `config/site.ts` |

### 规则

1. 同时修改 `zh` 和 `en` 两个分支，不要只改一边。
2. 中文使用「在线体验」，中文页面可见区域不得出现 `Playground`。
3. 英文页面不得泄漏可见中文，语言切换链接除外。
4. 不要为未确认的模型版本、GitHub、Hugging Face、邮箱或论文信息编造内容。
5. 未确认字段保持 `null` 或显式待确认文案。
6. 技术标识保持原样：`model`、`tabular`、`time-series`、`unified`、`POST`、HTTP 错误码。

### 常见修改

**改一段文案**：打开对应 `content/*.ts`，同时修改中英文，运行 `npm run typecheck && npm run build`。

**加一个模型**：

1. 在 `config/models.ts` 增加模型 ID、顺序、状态；未确认的版本和链接保持 `null`。
2. 在 `content/products.ts` 增加两种语言的名称、摘要、任务、图注和详情。
3. 在 `components/pages/products-page.tsx` 增加或复用视觉研究组件。
4. 如果首页需要展示，更新 `components/home/model-index.tsx` 的预览逻辑。
5. 运行视觉 QA。

**加一个页面**：

1. 在 `config/i18n.ts` 增加 slug。
2. 在 `content/i18n.ts` 增加两种语言的标题和简介。
3. 在 `components/pages/` 创建页面视图。
4. 在 `app/[locale]/[page]/page.tsx` 增加分发。
5. 如需主航加入 `app/[locale]/layout.tsx`。
6. 把页面加入 `scripts/visual-qa.mjs` 的 `pages` 和 `routes` 检查。

---

## 6. 设计系统摘要

完整规范见 [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)。

### 色板

```css
--paper: #f3f2e9;
--ink: #181d17;
--muted: #5e695a;
--accent: #d9f58f;
--atlas: #111a13;
--atlas-2: #18231a;
--dark-muted: #b7c4ad;
--line: #d3d8c6;
--error: #a13b2e;
--warning: #8b641f;
```

### 排版

- 首页 H1：桌面 56px，移动 37.44px。
- 页面 H1：桌面 51.84px，移动 36.66px。
- 章节 H2：桌面 27–36px，移动 26–31px。
- 正文字号 15.5px / 15px，行高 1.68–1.82。
- 系统字体栈，无外部字体。
- 所有字号、间距、色值优先改 `app/globals.css` 顶部变量。

### 设计边界

- 不使用超大标题抢过数据图。
- 不堆叠通用 SaaS 卡片。
- 不用紫色 AI 渐变、通用玻璃卡片或三维机器人素材。
- 所有数值图形均为原创合成示意，必须保留 synthetic 标识。
- 交互只使用 transform / opacity，不使用布局属性做动画。

---

## 7. 关键组件

| 组件 | 作用 | 注意 |
| --- | --- | --- |
| `SiteHeader` | 固定页眉、桌面导航、移动菜单 | 移动菜单已做 focus trap、Escape 关闭、背景 inert |
| `PageHead` | 页面层级头部 | 每个页面只有一个 H1 |
| `NumericalField` | 首页静态数值地形 | 无指针探针、无扫描动画 |
| `RepresentationMap` | 表格列、共享表征、时间通道映射 | 四个映射对支持键盘 focus / Enter |
| `TabularMatrix` | 交互式特征矩阵 | 真表格，方向键移动，roving tabindex |
| `TimeSeriesStudy` | 时序预测区间 | 可拖动预测起点 |
| `IndustryStudy` 系列 | 五个行业不同数据语言 | 每个行业独立构图，不套同一张卡片 |
| `ModelIndex` | 首页模型索引 | 桌面悬停/聚焦更新右侧预览 |
| `FieldIndex` | 首页行业索引 | 选择行业并切换图形 |
| `SourcePanel` | Playground 数据区 | 拖拽 + 可聚焦文件按钮 |
| `ConfigPanel` | Playground 参数区 | 其他两个模型明确 disabled |
| `ResultPanel` | Playground 结果区 | Idle / Loading / Error / Success |
| `CodeBlock` | 文档代码高亮与复制 | 有复制失败 fallback |
| `CodeTabs` | cURL / TypeScript / Python | 键盘左右切换 |
| `DeveloperDocs` | 文档导航、TOC、内容 | 移动端 details 目录 |

---

## 8. Playground 交接

完整说明见 [PLAYGROUND_GUIDE.md](PLAYGROUND_GUIDE.md)。

### 当前实现

```text
lib/demo-data.ts        合成 CSV 示例
lib/csv.ts              解析、大小限制、标签列识别
lib/demo-model.ts       数据集构建、最近邻分类、结果类型
components/playground.tsx         状态所有者
components/playground/source-panel.tsx
components/playground/config-panel.tsx
components/playground/result-panel.tsx
components/playground/result-chart.tsx
components/playground/data-table.tsx
```

### 状态

```text
idle -> running -> success
                -> error
```

- 运行过程约 900ms 的浏览器内演示延迟，用于呈现 loading 状态。
- 结果自动滚动到结果面板。
- CSV 下载由浏览器 Blob 生成。
- 下载列包括 `demo_prediction`、`demo_agreement`、`demo_note`。
- 每行 `demo_note` 明确写着 local nearest-neighbor，not model output。

### 换演示数据

编辑 `lib/demo-data.ts` 中的 `sampleCsv` 和 `sampleFile`。保持至少一行带标签、至少一行标签为空。不要把客户数据、生产导出或敏感记录放进去。

### 未来接真实 API

1. 新建独立 client 模块，不要改 `lib/demo-model.ts` 冒充真实推理。
2. 保持 CSV 解析和验证在前端。
3. 认证、密钥、限流、审计必须放在安全网关，不得进入静态前端包。
4. 替换结果适配层，不要重写 ResultPanel 的视觉结构。
5. 真实结果不再使用 Demo 标签前，必须完成模型授权、接口契约和安全评审。

**不要把本地最近邻演示结果描述为 Thinkcat 模型输出。**

---

## 9. API Docs 交接

完整内容在 `content/docs.ts`，渲染在 `components/developer-docs.tsx`。

- 页面明确标注 Draft，不是已上线服务。
- 代码示例使用 `{API_HOST}` 和 `$THINKCAT_TOKEN` 占位符。
- 参数、错误、模型表均为前端文档草案。
- 左侧导航、右侧 TOC、移动端文档目录、代码复制、语法高亮均已实现。
- 没有真实 endpoint、密钥、SDK 或 OpenAPI schema。
- 如果未来接入真实 API，先补契约验证，再更新文案中的 Draft 边界。

---

## 10. 浏览器验收与证据

### 最终结果

- 54 个页面/视口组合通过。
- 9 个页面 × 2 种语言 × 1440 / 768 / 390。
- 20 张完整页面截图（12 张桌面全页 + 8 张移动全页）。
- 17 张交互/状态截图。
- 91 张截图 + `qa-report.json`，共 92 个文件。
- 优化前 40 个文件。
- 无横向溢出。
- 无 console / page / network 错误。
- 首页可访问性抽查：无未命名按钮/链接，无重复 DOM id，单一 H1。
- 移动菜单 Escape 关闭，`aria-expanded=false`。
- 代码复制成功。
- CSV 下载成功。
- `prefers-reduced-motion` 下 `scroll-behavior: auto`，入场动画压缩。
- 生产域名配置测试通过 canonical、hreflang、sitemap。

### 证据位置

- [截图索引](screenshots/v5.2/README.md)
- [优化前](screenshots/v5.2/before)
- [优化后](screenshots/v5.2/after)
- [QA 报告](screenshots/v5.2/after/qa-report.json)
- [V5.2 验收报告](V5.2_ACCEPTANCE.md)

### 验收脚本说明

`scripts/visual-qa.mjs` 使用 Chrome DevTools Protocol 驱动本机 Edge：

- 自动截图全部页面/视口。
- 测试模型索引、矩阵、时间轴、表征图、五个行业、文档代码、Playground 状态。
- 测试移动菜单、复制、下载、非法 CSV、客户端路由和 reduced motion。
- 生成 `screenshots/v5.2/after/qa-report.json`。

---

## 11. 构建、发布与回滚

### 正式构建

```powershell
$env:NEXT_PUBLIC_SITE_URL = 'https://实际域名'
npm run typecheck
npm run lint
npm run build
node scripts/check-export.mjs
```

### 发布内容

发布完整 `out/`：

- `_next/static/`
- `zh/`、`en/`
- `icon.svg`、`favicon.ico`
- `robots.txt`、`sitemap.xml`
- `THIRD_PARTY_NOTICES.txt`
- postbuild 生成的 RSC 别名文件

不要手工修改 `out/` 内容，也不要把不同构建的 HTML 和静态资源混在一起。

### 回滚

保留上一版本的完整 `out/` 目录，通过切换站点根目录回滚。不要只替换单个 HTML 或 `_next` 片段。

### 部署检查

见 [DEPLOY_CN.md](DEPLOY_CN.md)：HTTPS、Nginx、缓存、gzip/Brotli、IPv4/IPv6、备案、日志和移动网络。

---

## 12. 测试与排查

### 已通过

```text
npm run typecheck   PASS
npm run lint        PASS, 0 warnings
npm run build       PASS
postbuild           PASS, 18 RSC aliases
check-export        PASS, 18 localized routes
visual QA           PASS, 0 errors
Impeccable detector PASS, 0 findings
```

### 常见问题

**`npm run preview` 报端口 3000 被占用**  
已有开发服务或其他静态服务占用端口。先停止旧进程，或直接使用其他静态服务器预览 `out/`。

**视觉 QA 报连接失败**  
确认 `out/` 已重新构建，并且 `http://127.0.0.1:3100` 有静态服务器在运行。

**浏览器 Network 出现 404**  
确认构建使用的是 `npm run build`，且 `out/` 中包含 postbuild 生成的 RSC 别名。不要直接使用 `next build` 产物交付。

**预览页面全部 noindex**  
这是无 `NEXT_PUBLIC_SITE_URL` 时的预期行为。正式构建必须设置真实域名。

**直接改 `app/globals.css` 后页面无变化**  
检查是否改动的是 `out/` 旧产物；重新运行 `npm run build`，或启动 `npm run dev`。

---

## 13. 当前待确认事项

这些是上线或内容发布前的外部确认项，不是前端代码缺陷：

- [ ] 法定主体、正式域名、联系邮箱
- [ ] ICP 备案、适用公安备案、隐私声明审批
- [ ] 模型版本、GitHub、Hugging Face 地址
- [ ] 真实 API 契约、鉴权、限流、数据保留策略
- [ ] 论文作者、发表信息、公开链接
- [ ] 正式域名下的 canonical、hreflang、sitemap 复测
- [ ] 目标 Nginx / CDN 环境验证
- [ ] 真实 iOS / Android 设备测试
- [ ] Lighthouse 性能与无障碍复核
- [ ] 第三方许可证人工复核

---

## 14. 下一阶段建议顺序

1. 初始化 Git，提交 V5.2 基线。
2. 收集并确认第 13 节的外部内容。
3. 配置真实域名，重新构建并复测 SEO。
4. 在目标 Nginx 或静态托管环境做完整部署演练。
5. 使用真实移动设备做一次视觉和触控验收。
6. 再决定是否接入 API；接入时把真实推理、认证与审计放在独立网关，不要混入当前离线 Demo。
7. 在真实 API 契约通过评审后，再考虑移除 API Docs 的 Draft 标记。

---

## 15. 文档索引

- [README](README.md)
- [设计系统](DESIGN_SYSTEM.md)
- [前端架构](FRONTEND_ARCHITECTURE.md)
- [组件规范](COMPONENT_GUIDELINES.md)
- [中英文规范](I18N_GUIDE.md)
- [Playground 指南](PLAYGROUND_GUIDE.md)
- [开发与 QA](DEVELOPMENT.md)
- [V5.2 验收报告](V5.2_ACCEPTANCE.md)
- [截图索引](screenshots/v5.2/README.md)
- [中国大陆部署](DEPLOY_CN.md)
- [内容待办](CONTENT_TODO.md)
- [素材授权记录](ASSET_LICENSES.md)

---

## 16. 交接签收清单

- [ ] 已阅读本文件
- [ ] 已确认 Node 22 / npm 10 环境
- [ ] 已完成 `npm ci`
- [ ] 已跑通 `npm run dev`
- [ ] 已跑通 `npm run build`
- [ ] 已核对 `screenshots/v5.2/after/qa-report.json`
- [ ] 已确认当前目录未初始化 Git，并完成基线提交
- [ ] 已知悉所有 Demo / Draft / 待确认边界
- [ ] 已知悉本轮没有后端、GPU 或真实推理服务
- [ ] 已确认正式发布前必须配置 `NEXT_PUBLIC_SITE_URL`

交接人：前端交付方  
接手人：______________  
日期：______________
