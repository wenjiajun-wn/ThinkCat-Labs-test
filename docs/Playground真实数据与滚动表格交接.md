# Playground 真实数据与滚动表格交接

日期：2026-11-14。本文记录本轮实际实现；此前《Playground页面精修交接》中的合成默认数据、分页、恢复示例及大块空状态描述属于历史版本。

## 范围与结果

仅调整 Playground 输入、结果展示、对应样式和示例配置。沿用已有宽度、按钮、配色、双语路由和同源 `/api/kumo/predict` 请求。没有修改 CSV 解析器、推理契约、模型算法、生产服务或部署配置，没有新增依赖。

- 移除可见的大标题、模型信息条、介绍、格式帮助、拖放提示和表格下方常驻说明；保留无障碍页面名称及上传校验。
- 删除重复结果页头、等待运行占位、返回数据按钮和分页。运行前直接展示实际待预测记录。
- 输入表格展示所有记录；输入及结果表格共用独立滚动组件，固定表头、局部横纵滚动。鼠标从单元格空白处拖动，超过 6px 开始滚动；文字区域仍支持原生选择，触屏自然滚动、键盘可聚焦翻页。
- 操作顺序为运行模型、上传 CSV、切换示例数据。三个真实示例循环切换。零个或一个示例时，切换按钮禁用并有简短说明。
- 上传、切换和目标列变更会取消旧请求、清空结果并重置滚动。响应通过请求身份校验，过期结果不能覆盖新数据。
- 结果仅含目标列为空的记录，保留原始记录号、特征及服务器返回的预测。合法标签 `0`、`false` 不视为空。请求仍发送全部上下文和待预测记录；下载保留既有字段、概率和公式注入防护。

## 真实数据来源与取样

用户提供 `TabArena-v0.1-45-datasets.zip` 和 [OpenML Study 457](https://www.openml.org/search?type=study&study_type=undefined&id=457&sort=runs_included)。压缩包实际包含 45 个 Parquet 数据文件；集合说明与压缩包数量不能等同。本轮选择三份符合当前数值特征分类协议的数据，不声称已经接入全部集合。

| 示例 | OpenML / 原始来源 | 目标列 | 特征 | 原始记录数 | 已标注 / 待预测 | 来源标注的许可 |
| --- | --- | --- | --- | --- | --- | --- |
| 献血记录 | [46913](https://www.openml.org/d/46913) / [UCI](https://doi.org/10.24432/C5GS39) | DonatedBloodInMarch2007 | 4 | 748 | 32 / 8 | CC BY 4.0 |
| 孕产健康风险 | [46941](https://www.openml.org/d/46941) / [UCI](https://doi.org/10.24432/C5DP5D) | RiskLevel | 6 | 1014 | 48 / 12 | CC BY 4.0 |
| 软件缺陷 JM1 | [46979](https://www.openml.org/d/46979) / [原始 OpenML 数据](https://www.openml.org/d/1053) | defects | 21 | 10885 | 32 / 8 | Public Domain |

确定性取样规则：按原始顺序，对每个类别选择前 20 条特征均为有限数值的记录；每类前 16 条保留标签，后 4 条留空目标值；最后按原始记录顺序排列。特征不改动、不生成随机值，原始答案没有作为预测内置。JM1 布尔标签序列化为 `false` / `true`。

每份 JSON 保存来源文件名、SHA-256、原始记录号、目标列、supportIndices、queryIndices 和取样规则。已逐条对照压缩包核验哈希与特征值一致。原始记录号为 Parquet 中从 1 开始的记录位置；上传 CSV 继续使用原文件行号。

配置集中在 `lib/playground-datasets.ts`，数据在 `content/datasets/`；`*-source.json` 保存 OpenML 官方元数据（数据 ID、目标列、引用、许可和原始来源）。按最新界面要求，已移除表格下方的来源、作者、许可和“部分标签留空”说明行；来源与许可信息仍保留在数据配置和本文档中。CC BY 4.0 数据引用分别为 Yeh, Yang & Ting (2009)、Ahmed et al. (2020)，并标注 TabArena Team；JM1 引用 Menzies & Di Stefano (2004)。

这些子集用于演示输入和预测流程，采用按类别取样，不代表原始类别比例或严格测试集；不构成完整 TabArena 基准测评，也不能从演示推断模型准确率或业务适用性。

## 修改文件

- `components/playground.tsx`：统一示例/上传数据状态，循环切换、请求取消及过期保护。
- `components/playground/source-panel.tsx`：精简结构，保留上传/目标列校验，加入轻量来源和三个操作。
- `components/playground/data-table.tsx`：取消分页，展示真实全量记录及目标列。
- `components/playground/scroll-table.tsx`：新增可复用局部拖动滚动组件。
- `components/playground/result-panel.tsx`、`prediction-table.tsx`：待预测记录视图及服务器结果映射，复用滚动容器。
- 删除无引用的 `prediction-results.tsx`、`prediction-status.tsx`；源码引用搜索没有残留。
- `content/playground.ts`：同步中英文，清理废弃文案。
- `lib/playground-datasets.ts`、`content/datasets/`：三份来源可追溯的示例及配置。
- `app/styles/playground.css`：局部滚动高度、表头、操作和紧凑错误区。
- `app/styles/responsive.css`、`app/styles/refinement.css`：仅清理已删除 Playground 元素的选择器，不改其他页面样式。
- `scripts/playground-results-qa.mjs`、`scripts/data-contract.test.mjs`：更新浏览器回归和真实数据契约测试。

工作区已有其他改动均保留，不等同于本轮修改。`home.css`、`numerical-field.tsx`、`terrain-renderer.ts` 与本轮沿用的冻结哈希相同。

## 验证

- `npm run typecheck`、`npm run lint`：通过。
- `npm run build -- --webpack`：通过，完成 25 个静态页面及 21 个 RSC 别名。默认 Turbopack 在当前环境此前存在进程问题，本轮采用项目支持的 webpack 构建选项。首次受限运行生成目录时出现 EPERM，允许正常写入构建目录后重试通过。
- `node scripts/check-export.mjs`、`node scripts/check-i18n.mjs`：14 个本地化页面的导航、语言、元数据和 sitemap 通过。
- 数据契约 7 项、i18n 3 项、连接 3 项测试通过。连接测试最初受本地回环环境限制，允许运行临时服务后重试通过。i18n 测试仍有既有 Node 模块类型提示，非失败，未为此修改包配置。
- Edge 真实浏览器：中英文桌面 1440 / 1024 / 768、手机 375 / 320，另保存 390px 手机截图。无整页横向溢出，控制台和页面错误均为零。
- 验证三个示例循环、全部记录渲染、真实目标配置、上下文仍在请求内、待预测记录及原始行号映射、鼠标横纵拖动、键盘滚动、触屏滚动、原生文字选择、重复提交、切换期间过期响应、上传/拖放、自定义目标选择、0/false 标签、缺标签/无待预测行、413/429/非法响应/概率错误、重试及 CSV 下载。
- 浏览器预测测试使用受控响应，仅用于验证前端；未调用真实 GPU，未把测试预测写入页面代码或静态数据。真实服务器连通性和真实模型输出仍需在具备同源接口的环境验证。

截图和完整报告位于本机临时输出目录 `C:/Users/32030/.codex/visualizations/2026/11/09/01a1c0e7-6a61-73b1-8f92-823a9466bdad/playground-real-data/`。包含中英文桌面、平板、手机和三份数据的测试成功状态；成功状态截图使用测试响应，不能作为真实模型效果证据。

本轮未生成部署包、未部署、未推送仓库。
