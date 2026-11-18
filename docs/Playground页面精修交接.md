# Playground 局部精修交接

日期：2026-11-13。

## 现有实现与范围

实际路由 /zh/playground/、/en/playground/，使用 Playground → SourcePanel / ResultPanel。
单一 Kumo 模型，默认载入现有合成 CSV。不存在独立模型选择或参数面板；目标列只在无法唯一识别时提供内联选择。结果为下方区域，包含 idle / running / error / success 状态。
Tailwind v4 已接入，继续复用 Button、FormControl、现有 CSS 变量。本轮没有新增依赖、布局模式或模型选项。

## 已观察的问题与修改

- 输入预览最大 1040px、工作台最大 1160px，表格与结果右边缘不一致：将工作台局部宽度限制为 1040px，输入与结果采用同一基线。
- 顶部介绍、操作和下方结果衔接偏松：局部 gap 从 32px 调为 24px（手机 20px），介绍下间距收紧到 16px。
- 结果标题、状态、模型名视觉权重相近：保持原 DOM，模型名另起一行，状态用轻量底色，统计数字提升至 18px。
- 运行按钮较窄：桌面最小宽度 132 → 160px，保留 48px 高度及手机全宽；补齐 active / focus 反馈。
- 格式帮助没有明确展开标识：增加 + / −，保留原生 details 行为和 44px 操作高度。
- 固定结果表头背景透明：改为不透明的品牌浅色背景，减少横向滚动时文字透叠。
- 表格滚动、错误面板与类别图宽度不统一：局部滚动、边界和宽度对齐；长标签和错误文字可换行。
- 目标列未选择的错误状态：增加 aria-invalid，关联现有错误提示；不改变选择或校验逻辑。

## 本轮实际修改

1. app/styles/playground.css：仅新增 .surface-playground .workbench 作用域规则。
2. components/playground/source-panel.tsx：目标列选择器两项 ARIA 属性。
3. docs/Playground页面精修交接.md：本文档。

工作区原有其他未提交修改均保留。Hero、Models、共享 refinement.css 和 tokens 文件哈希未变。lib/csv.ts、lib/kumo-api.ts、components/playground.tsx、content/playground.ts 哈希未变。

## 验证结果

- npm run typecheck：通过。
- npm run lint：通过。
- npm run build：通过，静态页面生成完成。
- node scripts/check-export.mjs：14 个本地化页面、导航、语言、metadata 与 sitemap 通过。
- node --test scripts/data-contract.test.mjs scripts/i18n.test.mjs：7 项通过。测试过程中有既有 Node MODULE_TYPELESS_PACKAGE_JSON 提示，不影响测试结果；未改 package.json。
- 复用现有浏览器回归脚本：18 次受控测试请求，上传、拖放、目标列、恢复示例、输入/结果分页、加载、防重复请求、返回数据、重试、下载均通过。覆盖 413、429、422、503、504、非法响应与概率校验。
- 补充双语 × 1440 / 1024 / 768 / 375 / 320 × idle / loading / success / error，共 40 组状态检查：无整页横向溢出，输入与结果宽度相同，运行按钮高度至少 48px。
- 手机结果表格局部滚动、格式帮助键盘聚焦/展开正常；补充验收启用 prefers-reduced-motion。
- 浏览器 consoleErrors、pageErrors 均为空。

## 截图和边界

C:/Users/32030/.codex/visualizations/2026/11/09/01a1c0e7-6a61-73b1-8f92-823a9466bdad/playground-polish/

before / after 含双语五档输入截图及请求状态截图；responsive 含 40 组状态测量和成功/错误截图；对比总览.html 可并排查看。
临时复用 QA 脚本扩展了工作台截图尺寸，原报告静态字段 workspaceScreenshots 仍为 6；实际工作台截图为 10 张，准确尺寸以本记录及 responsive.json 为准。

所有成功结果均来自测试浏览器拦截响应，未调用真实 GPU，不表示远程服务已验证可用。未在实体手机、Safari、Firefox 中验证。本轮未部署、未推送或打包。
