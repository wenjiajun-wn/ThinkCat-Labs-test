# Playground 使用与评估规则

中文与英文页面分别为 `/zh/playground/`、`/en/playground/`。页面沿用单表工作台：预测结果回填至原表的空目标单元格，已有标签和输入数据保持不变。通过 `?dataset=<id>` 可以载入指定内置示例。

## 数据来源与划分

- 当前注册表 `lib/playground-datasets.ts` 包含 15 份真实 TabArena 数值分类子集，默认是献血记录；旧 `lib/demo-data.ts` 仅保留作历史契约测试，不作为当前界面数据源。
- 本次完整保留原 `content/datasets/<id>.json` 的内容、列、顺序、上下文与待预测划分，不重新随机抽样。多数示例是按原始顺序和类别配额选取，不是统一随机 80/20。
- `exampleId` 是来源依据：已注册 ID 表示内置示例；上传文件后为 `null`。同名、同内容的上传 CSV 也不会关联评估答案。
- 非数值字段的投影规则、来源、原目标名及许可保留在数据元信息与 `public/DATASET_NOTICES.txt`，构建后该说明位于 `/DATASET_NOTICES.txt`。

## 上传与运行

CSV 必须包含 20–10000 行、1–30 个有效数值特征、至少 10 个已有标签、1–50 个空目标，以及 2–10 个上下文类别；文件限 1 MiB。唯一常见目标名 `label`、`target`、`class`、`y`、`risk`、`outcome` 会自动识别；否则在预览内选择目标，不猜测最后一列。

保留文件选择、拖放上传、切换示例、仅看待预测／已预测行、鼠标拖动表格空白处、键盘与触屏滚动、文本选择复制。表格数字与表头居中对齐，长表仅在自身容器滚动，没有第二张结果表。

浏览器调用已有同源 `POST /api/kumo/predict`，请求体严格只含 `rows`、`target_column`。上下文标签保留，待预测行的目标为 `null`。本仓库使用静态导出，没有新增服务端 API；真实推理由既有网关提供。

## 独立真实标签与准确率

离线运行 `scripts/prepare-playground-evaluation.py`，从用户已提供的本地 TabArena ZIP 恢复当前待预测行的真实标签。脚本核对原始 Parquet SHA-256、所有选中特征、上下文标签、完整索引分割和类别，生成独立的 `content/datasets/evaluation.json`。

- `sourceRecords` 是原 Parquet 中的一基位置（不包含 CSV 表头），不是 DataFrame 标签索引。
- 接口 `row_indices`／预测 `index` 是本次示例的零基位置；`sourceRecords[index]` 对应真实记录。
- 每份评估版本是源文件哈希、列名、目标、完整输入行、原始记录映射及上下文／query 索引的规范 JSON SHA-256。
- 运行开始以当前输入计算版本快照。真实标签资源在预测完成后加载，并检查数据集、版本、目标、query 集合、原始记录号和类别。
- `lib/evaluation.ts` 仅在每个 query 恰好对应一个预测和一个真实标签时计算 `correctCount / totalCount`，严格按字符串比较，不按返回顺序关联。
- 默认献血示例分母为 8。筛选和滚动不改变分母。零样本、错版、缺失／重复索引等情况只显示“预测完成，但评估不可用”，保留有效预测，不输出部分分数。
- 预测概率及 `averageProbability` 不是准确率，不参与正确数计算。

内置示例评估成功后，结果区显示紧凑的“示例留出集准确率”与正确数／总数；query 目标单元格额外显示真实标签及“预测正确／错误”，同时保留预测与概率。上下文行不显示对照。

上传模式只显示预测、概率与分布，**完全不渲染准确率、真实标签、正确性或空评估卡片**。

这些是小规模、部分按类别平衡的数值特征子集；样本可能包含原数据中的重复特征、投影及选择偏差。分数只描述当前留出记录，不是完整 TabArena 基准或模型在全部数据上的表现。

## 状态与导出

预测结果、来源及可选评估绑定在同一次成功状态中。重新运行立即清空旧评估；上传、切换示例／目标、URL 更换示例或卸载会取消旧请求。请求身份比较、文件读取版本保护、重复提交保护与 60 秒超时继续生效。

表格只叠加显示预测与对照，绝不将它们写入 `csv.rows`。因此再次运行的 query 标签仍为 `null`。

下载只导出本次 query：原始字段（目标仍留空）、`source_row`、`prediction`、`probability`、`probabilities`。当前源码已移除展示／下载字段的旧 `kumo_` 前缀，本次不回退该命名；同名列仍自动加后缀。

仅内置评估有效时追加 `actual_label`、`is_correct`；上传模式不追加这两列。所有字符串沿用公式注入防护与 CSV 引号转义。

## 静态前端安全边界

Ground Truth 不进入推理请求、隐藏特征或原始目标列。但它是浏览器可以检查到的静态资源，**不对访客保密**。真正的标签保密需要独立服务端评估接口，超出本轮范围。本次未修改网关、SSH、GPU 或 API 协议。

## 验证命令

```powershell
# 原始 ZIP 路径作为参数；只校验，不重新抽样或覆盖原数据
python scripts/prepare-playground-evaluation.py <本地TabArena压缩包路径> --check
node --test scripts/data-contract.test.mjs scripts/evaluation.test.mjs
npm run typecheck
npm run lint
npm run build -- --webpack
node scripts/check-export.mjs
# 预览另开进程，浏览器QA使用确定性拦截，不会调用真实服务
node scripts/preview.mjs
node scripts/playground-results-qa.mjs artifacts/evaluation-qa/after
```

浏览器 QA 的 Mock 仅用于自动化验收，不进入生产。真实端到端推理结果必须单独记录，不能将 Mock 分数当作真实模型准确率。连接说明见 `docs/KUMO_CONNECTION.md`。


2026-11-17：新增大规模示例及每页200行预览；完整数据仍参与推理。新增与维护步骤见 docs/LARGE_EXAMPLES_2026-11-17.md。
