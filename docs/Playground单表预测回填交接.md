# Playground 单表预测回填

日期：2026-11-15

## 界面变化

- 输入表成为唯一的数据表；删除独立的预测结果表组件 `prediction-table.tsx` 及对应样式。
- 目标列增加淡绿色底色与文字标识。空白标签以暖色「待预测」显示；成功后原位置显示预测类别、绿色「已预测」标记及预测类别概率。
- 增加「仅看待预测行 / 仅看已预测行」筛选，关闭即可返回全部输入记录。中文和英文同步。
- CSV 下载按钮移到输入表下方操作区；保留原有下载内容、原始记录号、公式注入防护。
- 下方仅保留真实请求状态、错误与重试，以及成功后的类别分布图，不再重复列出特征数据。
- 运行时不再强制滚动到另一个结果面板。

## 数据边界

回填是只读显示层：使用已校验结果中的 `prediction.index` 查找原始解析行，而非筛选后的位置或显示行号。没有向 `csv.rows` 写入预测标签。已知标签保持不变，重复运行发送的空白标签依旧为 `null`。上传、切换示例、切换目标列、重试和错误状态继续使用既有取消与清理机制。

## 文件

- `components/playground.tsx`：传递运行状态与下载回调，移除结果区强制滚动。
- `components/playground/source-panel.tsx`：对接单表状态与下载入口。
- `components/playground/data-table.tsx`：原行映射、只读预测显示、目标列标识、预测行筛选。
- `components/playground/result-panel.tsx`：保留状态、重试和分布图。
- `components/playground/prediction-table.tsx`：删除。
- `content/playground.ts`：双语提示，清理部分废弃结果表文案。
- `app/styles/playground.css`、`app/styles/responsive.css`：局部目标列与回填状态样式，移除旧结果表规则。
- `scripts/playground-results-qa.mjs`：更新真实浏览器验收以覆盖单表流程。

## 验证与限制

- TypeScript、生产构建（webpack）、Static Export、19 项数据契约测试通过。
- Lint 排除以前的 `.deploy-package/**` 生成产物后通过。
- Edge 浏览器测试覆盖全部 14 份示例：原始行映射、类别与概率回填、已知标签不变、筛选、重复运行请求不变、切换数据清理结果、取消旧请求、重复提交保护、CSV 下载、上传自定义目标、413/429/非法响应与重试。
- 中英文 1440、1024、768、375、320px 检查输入与结果状态，表格内部滚动，页面无横向溢出；鼠标拖动、键盘与触屏滚动验证通过。
- 浏览器预测使用受控响应，仅验证前端流程，不代表远程 GPU 推理已验证。没有修改 API、后端、Hero 或生产部署。
- 前后截图及报告：`C:/Users/32030/.codex/visualizations/2026/11/09/01a1c0e7-6a61-73b1-8f92-823a9466bdad/inline-predictions/`。
