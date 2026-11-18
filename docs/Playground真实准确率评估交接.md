# Playground 真实留出集准确率交接（2026-11-16）

## 实施基准与范围

以当前源码和用户最新文档为准，保留 15 份真实示例、现有划分、单表回填、查询参数入口及全部原有交互。本次没有重新抽样，没有修改 Hero、其他页面设计、依赖、API、Nginx、SSH、GPU、密钥或环境配置。

需求中的 CSV 导出字段使用旧 kumo_ 前缀；当前源码已经移除该前缀，本次保留当前 prediction / probability / probabilities，不回退。

## 原始数据与恢复校验

当前仓库找到 15 份筛选数据 JSON、15 份来源 JSON、原生成脚本 scripts/prepare-playground-datasets.py。原始数据直接读取此前用户提供且当前机器可用的 ZIP，没有下载或复制整套原始数据：

`D:\Application\微信\xwechat_files\wxid_wn5wlx3eml6m22_f0c5\msg\file\2026-11\TabArena-v0.1-45-datasets.zip`

ZIP 内含 manifest.json、suite.json 和 45 份 Parquet；本次只为现有 15 份示例恢复答案。原始源文件哈希逐份匹配；逐行比较选中特征、上下文标签、query 空目标、原始记录位置与分割完整性。

共恢复 **286 条真实标签**。30 份现有数据及来源文件的 SHA256 前后完全相同。新增恢复脚本的 --check 模式通过，Python / 浏览器 WebCrypto 版本哈希 15/15 一致。

| ID / 原始数据名 | 总行 | 数值特征 | 目标列 | Context / Evaluation | 本次真实接口结果 |
|---|---:|---:|---|---|---|
| 46906 / anneal | 35 | 6 | `classes` | 25 / 10 | 7/10（70.0%） |
| 46910 / bank-marketing | 100 | 5 | `SubscribeTermDeposit` | 90 / 10 | 3/10（30.0%） |
| 46913 / blood-transfusion-service-center | 40 | 4 | `DonatedBloodInMarch2007` | 32 / 8 | 4/8（50.0%） |
| 46918 / credit-g | 120 | 7 | `good_or_bad_customer` | 108 / 12 | 8/12（66.7%） |
| 46919 / credit_card_clients_default | 260 | 20 | `DefaultOnPaymentNextMonth` | 234 / 26 | HTTP 429，未产生结果 |
| 46921 / diabetes | 150 | 8 | `TestedPositiveForDiabetes` | 135 / 15 | 未实测，后续请求因限流停止 |
| 46930 / hazelnut-spread-contaminant-detection | 480 | 30 | `Contaminated` | 432 / 48 | 未实测，后续请求因限流停止 |
| 46932 / heloc | 400 | 23 | `RiskPerformance` | 360 / 40 | 未实测，后续请求因限流停止 |
| 46935 / HR_Analytics_Job_Change_of_Data_Scientists | 30 | 2 | `LookingForJobChange` | 26 / 4 | 未实测，后续请求因限流停止 |
| 46940 / Marketing_Campaign | 240 | 16 | `Response` | 216 / 24 | 未实测，后续请求因限流停止 |
| 46941 / maternal_health_risk | 60 | 6 | `RiskLevel` | 48 / 12 | 10/12（83.3%） |
| 46947 / online_shoppers_intention | 180 | 10 | `Revenue` | 162 / 18 | 未实测，后续请求因限流停止 |
| 46956 / seismic-bumps | 210 | 11 | `HighEnergySeismicBump` | 189 / 21 | 未实测，后续请求因限流停止 |
| 46960 / students_dropout_and_academic_success | 300 | 19 | `AcademicOutcome` | 270 / 30 | 未实测，后续请求因限流停止 |
| 46979 / jm1 | 80 | 21 | `defects` | 72 / 8 | 未实测，后续请求因限流停止 |

完整字段类型、源缺失值、实际上下文／评估类别分布、投影字段及每条 source hash 检查记录：`artifacts/evaluation-data-audit.json`。每份数据原有来源与许可说明保留在 `content/datasets/*-source.json` 和 `public/DATASET_NOTICES.txt`。后者从本轮指定部署包原样恢复到源码 public 中，使后续构建继续包含该说明。

## 版本、索引和网络隔离

- sourceRecords 是原始 Parquet 行的一基位置，使用 iloc[sourceRecord - 1]，不按特征匹配（重复特征也不串行）。
- row_indices / prediction.index 是本次请求的零基行位置，必须对应 spec.queryLabels.index，并交叉核对 sourceRecords[index] / prediction.sourceLine。
- datasetVersion 为固定 key 顺序 `{sourceSha256,headers,target,rows,sourceRecords,supportIndices,queryIndices}` 紧凑 UTF-8 JSON 的 SHA256，绑定来源、投影、输入值与划分。
- 运行开始固定来源和实际输入快照，先算版本。模型完成后才加载独立答案。每个 query 必须恰好一份真值与一条预测，所有标签精确字符串匹配，0 和 false 是有效类别。
- 推理请求仍只包含 rows 与 target_column，query 标签为 null，上下文标签与特征不变。版本、原记录号和答案都不是特征。
- 预测和真实标签仅渲染到目标单元格，不写回 csv.rows。重跑请求相同，答案和预测不会污染上下文。
- Accuracy = correctCount / totalCount，仅统计完整既定 query 集合；概率不参与计算。筛选与滚动不改分母。

## UI 与失败边界

内置示例预测成功后，原表 query 单元格显示预测值、预测概率、真实标签与文字正确性；结果区增加一条紧凑准确率摘要及示例范围说明。预测类别分布保留，未增加第二张表。

上传后 exampleId=null，即使文件名与内置示例相同或内容完全相同，也不读取答案，不显示准确率、真值或正误，不导出评估字段。内置有效评估下载追加 actual_label / is_correct，保留原目标空值、列名冲突处理与 CSV 公式防护。

切换数据、修改目标、URL 更换示例、取消／超时、读取失败、重跑立即清除旧评估。请求身份检查覆盖所有 await。有效模型响应到达后结束推理计时；评估资源单独最多等待5秒，失败显示“评估不可用”并保留预测，不冒充模型连接错误。

静态导出中的 Ground Truth 可被浏览器检查，并不构成对访客保密。这里只保证标签不进入推理请求。本轮不创建服务端评估接口。

当前小规模、部分均衡取样与数值特征投影不等于官方 TabArena 测试。记录可能包含原始重复特征及选择偏差，分数仅描述既定示例，不能推广成模型整体能力。

## 修改文件

- `scripts/prepare-playground-evaluation.py`：只读原始数据恢复与验证，--check 可复现。
- `content/datasets/evaluation.json`：15 份独立真值与版本。
- `lib/evaluation.ts`：严格分类评估纯函数。
- `lib/playground-evaluation.ts`：请求快照版本、成功后加载答案、评估独立降级。
- `components/playground.tsx`、`components/playground/result-types.ts`：本次结果绑定来源和评估，导出与并发防护。
- `components/playground/data-table.tsx`、`components/playground/result-panel.tsx`：原表真值对照与紧凑摘要。
- `content/playground.ts`、`app/styles/playground.css`：双语文案与局部样式。
- `scripts/evaluation.test.mjs`、`scripts/data-contract.test.mjs`、`scripts/playground-results-qa.mjs`：纯函数、请求契约及真实浏览器验收。
- `PLAYGROUND_GUIDE.md`、`COMPONENT_GUIDELINES.md`、本文：更新中文交接说明。
- `public/DATASET_NOTICES.txt`：保留现有部署包的数据归属说明。

## 验证结果

- 离线恢复／--check：15/15，286/286 真值；原30份JSON字节不变。
- 计算与契约：78项测试通过，覆盖0%、100%、87.5%、85%、多分类、乱序与错误映射、版本篡改、逐请求字段隔离及重跑。
- TypeScript：通过。ESLint：`npm run lint` 通过。
- Production Build：`npm run build -- --webpack` 通过。首次沙箱构建因 Next.js 静态目录写入 EPERM 失败，获正常本地权限后成功，未更改构建配置。
- Static Export：14个本地化路由及语言、链接、Metadata、sitemap检查通过；共25个静态页面，postbuild RSC别名生成成功。
- 真实网络调用：既有 https://thinkcat-labs.ai-calendar.xyz/api/kumo/predict 返回5份有效HTTP 200，已计算上表实际准确率，没有Mock。后续信用卡请求HTTP429后停止；另外10份未完成真实模型验证。原始日志：`artifacts/evaluation-live-smoke.json`。
- 真实 Edge 浏览器（受控 Mock，不是正式模型分数）：67次拦截请求，全部15示例、双语1440/1024/768/375/320px验收通过；控制台错误0，页面异常0，整页无横向溢出。覆盖同名同内容上传、导出、过滤不改分母、重新运行隔离、错序及非法响应、数据/目标/URL切换竞态、读取失败、超时、元数据损坏与独立评估资源超时降级。报告：`artifacts/evaluation-qa/after/qa-report.json`。

截图：`artifacts/evaluation-qa/before/` 保存中英文1440/390px的输入和原成功态；`artifacts/evaluation-qa/after/` 保存各示例和全部测试视口。主要对照：`zh-1440-inline-results.png`、`zh-375-inline-results.png`、`en-320-inline-results.png`。这些截图使用确定性测试响应，不作为真实模型性能证据。

本轮没有重新打包或部署生产，也没有自动提交／push。
