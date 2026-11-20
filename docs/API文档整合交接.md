# API 文档整合与验收记录

日期：2026-11-18。工作区：ThinkCat-Labs-Website；远程仓库：ThinkCat-Labs-test。

## 交付范围

将用户补丁中的中文接口说明整合到现有 `/zh/docs/`、`/en/docs/`，继续使用原有三栏文档组件、语言切换和移动导航。本轮没有推送或部署，没有增加依赖。

页面章节依次为：接口介绍、当前支持、快速开始、访问与认证、请求参数、响应结构、错误与重试、CSV 输入、接入检查。

当前请求统一为 `POST /api/kumo/predict`，只包含 `rows` 和 `target_column`。移除了网站旧的规划接口、模型选择参数、Bearer 认证假设和虚构的错误 JSON。前端校验范围与未核实的后端限制明确分开。

## 修改文件

| 文件 | 作用 |
| --- | --- |
| `content/docs.ts` | 中英文说明、参数和响应表、错误处理、三种调用示例、完整教学请求和 CSV |
| `components/developer-docs.tsx` | 复用原导航和代码组件，整合新章节、下载入口及可展开请求 |
| `app/styles/docs.css` | 文档作用域内的导航高度、锚点间距、代码块内部滚动、复制按钮触控尺寸 |
| `content/i18n.ts` | 同步文档页 SEO 描述 |
| `content/home.ts` | 仅同步开发者区域接口摘要及文档入口，Hero 文案不变 |
| `content/products.ts` | 仅同步文档入口文案，未改变模型布局或交互 |
| `README.md` | 增加接口文档入口，更新文档范围说明 |
| `docs/api/README.md` | 中文接口文档索引 |
| `docs/api/quickstart.md` | 环境、请求、Python / JavaScript / cURL 与 CSV 使用步骤 |
| `docs/api/predict.md` | 请求字段、前端输入规则、响应及索引映射 |
| `docs/api/errors.md` | HTTP 分类、输入错误、超时和重试说明 |
| `docs/api/maintainers.md` | 内容依据、网站接入位置、维护约定和未知项 |
| `docs/api/examples/input.csv` | 20 条人工教学记录，18 条上下文、2 条待预测 |
| `docs/api/examples/request.json` | 与教学 CSV 一致的完整请求 |
| `docs/api/examples/response.example.json` | 手写响应结构示意，明确标注非真实推理 |
| `docs/api/examples/predict.py` | Python 标准库调用示例 |
| `docs/api/examples/predict.mjs` | Node.js 调用示例 |
| `public/api-examples/input.csv` | 网页可下载 CSV |
| `public/api-examples/request.json` | 网页可下载请求 JSON |
| `public/api-examples/response.example.json` | 公开响应结构示意 |
| `scripts/api-docs.test.mjs` | 示例、双语章节、实际脚本请求和失败处理测试 |
| 本文件 | 中文交接与验收记录 |

下载资源、网页示例与仓库教学文件通过测试校验一致性。没有修改内置真实示例数据或支持集／待预测划分。

## 已完成验证

- `npm run typecheck`：通过。
- `npm run lint`：通过。
- `node --test scripts/*.test.mjs`：125 项通过，0 失败。
- `npm run build -- --webpack`：通过，25 个静态页面生成完成。
- `node scripts/check-export.mjs`：14 个本地化导出、导航、语言、元数据和站点地图检查通过。
- 真实 Edge 浏览器：中英文分别在 1440、768、390、320px 验收，无整页横向溢出。
- 每个视口验证 9 个章节锚点、三种代码切换及剪贴板实际文本、键盘切换。
- 中英文切换保留章节位置，直接访问和刷新正常；下载内容与源码示例一致。
- 控制台错误 0，页面异常 0，文档页推理请求 0。
- cURL、网页及仓库 Python / JavaScript 示例在本机受控 HTTP 服务验证 200、422、503，核对实际请求字段、空目标值、无虚构认证头及无自动重试。**这些不是远程模型推理测试。**
- Git 差异核对：Hero 渲染和样式、Playground 逻辑、CSV/API 客户端、部署配置均未改动；中英文 Hero 文案与基线逐项相同。

首次测试中的空原型对象比较、系统代理对本机 Python 请求的干扰，以及 Windows 剪贴板换行差异，均已在测试工具中修正；最终结果以上述完整复验为准。未以修改业务协议来适配测试。

## 浏览器证据

截图和原始日志存放在忽略目录 `artifacts/`，仅作为本地验收证据，不随网站部署：

- [中文桌面](../artifacts/api-docs-qa/zh-1440-overview.png)
- [英文桌面](../artifacts/api-docs-qa/en-1440-overview.png)
- [中文手机](../artifacts/api-docs-qa/zh-390-quickstart.png)
- [英文手机](../artifacts/api-docs-qa/en-390-quickstart.png)
- [浏览器检查明细](../artifacts/api-docs-qa/report.json)
- [完整测试结果](../artifacts/api-docs-unit-tests.txt)

## 尚未确认

仓库没有 FastAPI 服务源码；本次未取得可核实的线上 OpenAPI Schema。以下仍由部署方确认：正式 API origin、认证与会话、CORS、服务端容量和配额、错误 schema、取消和幂等性、重试及计费语义。已知网站域名不自动等于公开 API 的发布地址。

本轮没有验证真实远程预测成功，也没有把手写响应和本机测试结果包装为真实模型输出。客户端限制只说明当前网站如何准备输入。

## 本地预览

本次静态预览端口为 4323：

- 中文：`http://127.0.0.1:4323/zh/docs/`
- 英文：`http://127.0.0.1:4323/en/docs/`

若预览进程已关闭，在仓库根目录使用 PowerShell：

```powershell
$env:THINKCAT_PREVIEW_PORT = '4323'
node scripts/preview.mjs
```

修改源码后先执行 `npm run build -- --webpack`。上述纯静态预览不提供推理 API；本轮没有修改或启动生产服务。

## 设计参考

仅借鉴文档的信息组织、快速开始和参数展示方式，不复制品牌视觉或认证协议：

- [OpenAI API 文档](https://developers.openai.com/api/docs)
- [Stripe API 文档](https://docs.stripe.com/api)
- [Resend API 文档](https://resend.com/docs/api-reference)
- [Replicate 文档](https://replicate.com/docs)
