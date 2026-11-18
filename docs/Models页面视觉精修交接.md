# Models 页面视觉精修交接

日期：2026-11-13。本轮只精修现有模型页，不替换页面设计。

## 实际入口与基线

- Models 对应 `/zh/products/`、`/en/products/`；不存在独立 models 路由。
- 入口为 components/pages/products-page.tsx，图示为 components/visualizations/model-arts.tsx。
- 对照 HEAD：原有普通锚点索引、表格 / 时序 / 统一表征三段内容均已存在，没有新增三模型概览卡片或固定索引需要撤销。
- Tailwind v4.3.5 已接入，使用 tw 前缀，未启用 Preflight。本轮复用现有 tokens，不新增依赖。

## 问题与本轮改动

1. 1024px 英文时序简介与状态信息重叠：为原有三列分别分配足够宽度，保留左右关系。
2. 模型说明、技术资料与 CTA 层级不清：统一行高、标题间距、辅助字号和边框；CTA 标签列增加宽度，消除 Playground 与链接文字挤在一起的问题。
3. 矩阵数值对比不足，手机端原样式隐藏数值：提高数值可读性，恢复手机数值显示，保留局部横向滚动；选中反馈改为内部描边，避免单元格跳动。
4. 时序滑块使用默认蓝色，英文起点标签背景过短：改为品牌强调色与 44px 操作高度，扩大标签底板；手机图表维持可读宽度并局部滚动。
5. 深色区域 Badge 背景与材质不一致：作用域内统一深色状态标识。
6. 统一表征图手机英文标签挤压：调整局部字号、字距和图表最小宽度；保留原图形、键盘与指针映射逻辑。
7. 手机说明区两列过窄：按原有阅读顺序单列排列，不改桌面组织关系。

## 本轮修改文件

- app/styles/refinement.css：替换既有 Models 精修小节，新增规则全部限定 .surface-products，不修改全局 tokens/reset。
- components/visualizations/model-arts.tsx：时序图增加可聚焦的局部滚动容器；起点背景宽度 104 → 148，适配英文。数据、算法、事件处理未改。
- docs/Models页面视觉精修交接.md：本记录。

工作区其他未提交文件均为前序工作，未覆盖或回滚。样本行右箭头继续保留。

## 验证

- npm run typecheck：通过。
- npm run lint：通过，零警告。
- npm run build：通过，25 个静态页面生成完成。
- node scripts/check-export.mjs：通过，14 个双语页面及导航、元数据、sitemap。
- 本地真实 Edge 无头浏览器：中英文 × 1440 / 1024 / 768 / 375 / 320，10 个组合无整页横向溢出，无控制台错误。
- 中英文 × 1440 / 320：矩阵点击和方向键、时序滑块键盘更新、技术说明展开、映射图聚焦和 Escape、手机三类图表局部滚动通过。
- Reduced Motion：沿用全站 0.001ms 规则。初次测试错误地断言必须等于 0，按实际既有降级策略修正测试后通过；没有因此修改全局规则。
- Hero：numerical-field.tsx、terrain-renderer.ts、home.css、tokens.css 哈希不变；1440 / 375 下 Hero DOM 矩形、关键计算样式和 Canvas 尺寸一致；对应首页视口截图逐像素一致（均为 reduced-motion）。

## 截图与限制

截图、交互日志、基线 JSON、中文对比总览位于：
C:/Users/32030/.codex/visualizations/2026/11/09/01a1c0e7-6a61-73b1-8f92-823a9466bdad/models-polish/

尚未使用实体手机或 Safari / Firefox 验证。浏览器验证为本地生产静态导出；未部署、未推送，也未运行或修改远程推理服务。

## 追加：C / 统一表征顶部布局修复

- 原因：桌面 12 列 Grid 将标题、介绍和纵向元信息放在同一行，右侧窄列撑高整行；并非固定 height/min-height 导致。
- 仅修改 app/styles/refinement.css 的 C 区域作用域规则，不修改 JSX 或可视化实现。
- 标题 / 介绍为 40% / 60% 两列；元信息另起整行，桌面三列两行，研究任务跨两列，公开资源保留原状态。平板两列，手机单列。
- 图示上方间距统一 32px，没有负 margin、绝对定位、固定高度。
- 1440px 实测：中文顶部 419.25 → 252.80px；英文 463.44 → 310.98px。1565px 同样成立。
- 手机自然单列后内容高度增加，这是保留可读字号和完整信息的结果，不通过固定高度裁切。
- 中英文 × 1440、1565、1024、768、375、320 共 12 组截图、尺寸检查通过，无整页溢出；前后内容字符串、SVG 和可视化宽高一致。
- 最终浏览器键盘焦点与 Escape 交互通过，无控制台错误。基线脚本最初受 focus 自动滚动影响触发 pointerleave，改为稳定视口内 preventScroll 聚焦后验证通过；未改业务事件。
- TypeScript、Lint、Production Build、Static Export 通过。首页 Hero、A/B 展示及其他页面源码未改。
- 截图和实测记录：C:/Users/32030/.codex/visualizations/2026/11/09/01a1c0e7-6a61-73b1-8f92-823a9466bdad/unified-layout/。
