# 模型接口结构示意

> 自有模型服务尚未上线。请求地址为 https://thinkcatlabs.ai/api/predict，模型名称以实际响应为准。

```http
POST /api/predict
Content-Type: application/json
Accept: application/json
```

## 请求参数

以下为 JSON 请求结构示意，包含 rows 与 target_column。每行保留相同列名；特征填有限数字，目标填类别字符串或 JSON null。

| 字段 | 类型 | 要求 | 说明 |
| --- | --- | --- | --- |
| rows | object[] | 必需 | 所有上下文与待预测行，保持输入顺序。 |
| target_column | string | 必需 | 目标列的精确名称，区分大小写，每行必须包含此键。 |
| rows[].<feature> | number | 必需 | 非目标列。有限数值，不接受空特征、NaN 或无穷大。 |
| rows[].<target> | string  /  null | 必需 | 已知类别保留原始字符串；待预测使用 null，而非字符串 "null"。 |

## 前端数据准备参考

这些是当前网页的校验范围，不是已核实的服务端上限。生产 JSON 请求大小、并发、频率和容量限制需单独确认。

- 总行数：20–10,000（不含表头）
- 数值特征：1–30 列；已标注样本：至少 10 行
- 待预测样本：1–50 行；已知类别：2–10 类
- 特征不可缺失；只有目标列可留空

## 响应结构

以下是手写结构示意，概率和标签不是实际推理结果。当前客户端读取五个字段。

```json
{
  "model": "模型",
  "row_indices": [18, 19],
  "predictions": ["group_a", "group_b"],
  "probabilities": [
    {"group_a": 0.85, "group_b": 0.15},
    {"group_a": 0.2, "group_b": 0.8}
  ],
  "classes": ["group_a", "group_b"]
}
```

| 字段 | 类型 | 要求 | 说明 |
| --- | --- | --- | --- |
| model | string | 必需 | 模型名称占位，正式标识待服务上线后确认。 |
| row_indices | integer[] | 必需 | 完整覆盖待预测行，不能重复、遗漏或包含已标注行。 |
| predictions | string[] | 必需 | 与 row_indices 按位置对应，类别必须属于 classes。 |
| probabilities | object[] | 必需 | 与预测数组对齐，每个对象包含 classes 中每个类别的概率。 |
| classes | string[] | 必需 | 2–10 个互不重复的类别字符串。 |

row_indices 示意本次请求 rows 的零基位置：18 表示第 19 行，不是原文件物理行号。三个结果数组按相同位置对应。概率对象按类别名称取值，概率不等于准确率。本页示意响应不能用于证明实际推理成功，最终响应格式以上线版本为准。
