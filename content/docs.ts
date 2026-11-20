// Public model API draft. Placeholders are not the Playground runtime contract.
export const docsCode = {
  "tabs": {
    "curl": "export THINKCAT_API_ORIGIN=\"https://your-confirmed-host.example\"\ncurl --fail-with-body --show-error --silent \\\n  --max-time 120 \\\n  -X POST \"${THINKCAT_API_ORIGIN%/}/api/model/predict\" \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Accept: application/json\" \\\n  --data-binary @request.json",
    "javascript": "// Node.js 22+. Save request.json in the working directory.\nimport {readFile} from 'node:fs/promises';\nconst origin = process.env.THINKCAT_API_ORIGIN;\nif (!origin) throw new Error('Set THINKCAT_API_ORIGIN first');\nconst payload = JSON.parse(await readFile('request.json', 'utf8'));\nconst response = await fetch(new URL('/api/model/predict', origin), {\n  method: 'POST',\n  headers: {'Content-Type': 'application/json', Accept: 'application/json'},\n  body: JSON.stringify(payload),\n  signal: AbortSignal.timeout(120_000),\n  redirect: 'error',\n});\nconst text = await response.text();\nif (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);\nconst result = JSON.parse(text);\nconsole.log(result);\nresult.row_indices.forEach((rowIndex, i) => {\n  console.log(rowIndex, result.predictions[i], result.probabilities[i]);\n});",
    "python": "# Python 3 standard library. Save request.json in the working directory.\nimport json\nimport os\nfrom pathlib import Path\nfrom urllib.request import Request, build_opener, HTTPRedirectHandler\nfrom urllib.error import HTTPError\n\nclass NoRedirect(HTTPRedirectHandler):\n    def redirect_request(self, req, fp, code, msg, headers, newurl):\n        return None\n\norigin = os.environ[\"THINKCAT_API_ORIGIN\"].rstrip(\"/\")\npayload = json.loads(Path(\"request.json\").read_text(encoding=\"utf-8\"))\nrequest = Request(origin + \"/api/model/predict\",\n    data=json.dumps(payload).encode(\"utf-8\"), method=\"POST\",\n    headers={\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"})\ntry:\n    with build_opener(NoRedirect).open(request, timeout=120) as response:\n        result = json.load(response)\nexcept HTTPError as error:\n    print(\"HTTP\", error.code, error.read(500).decode(\"utf-8\", errors=\"replace\"))\n    raise\nprint(result)\nfor i, row_index in enumerate(result[\"row_indices\"]):\n    print(row_index, result[\"predictions\"][i], result[\"probabilities\"][i])"
  },
  "requestJson": "{\n  \"rows\": [\n    {\"x1\": 1, \"x2\": 0.1, \"label\": \"group_a\"},\n    {\"x1\": 2, \"x2\": 0.2, \"label\": \"group_a\"},\n    {\"x1\": 3, \"x2\": 0.3, \"label\": \"group_a\"},\n    {\"x1\": 4, \"x2\": 0.4, \"label\": \"group_a\"},\n    {\"x1\": 5, \"x2\": 0.5, \"label\": \"group_a\"},\n    {\"x1\": 6, \"x2\": 0.6, \"label\": \"group_a\"},\n    {\"x1\": 7, \"x2\": 0.7, \"label\": \"group_a\"},\n    {\"x1\": 8, \"x2\": 0.8, \"label\": \"group_a\"},\n    {\"x1\": 9, \"x2\": 0.9, \"label\": \"group_a\"},\n    {\"x1\": 10, \"x2\": 1.0, \"label\": \"group_b\"},\n    {\"x1\": 11, \"x2\": 1.1, \"label\": \"group_b\"},\n    {\"x1\": 12, \"x2\": 1.2, \"label\": \"group_b\"},\n    {\"x1\": 13, \"x2\": 1.3, \"label\": \"group_b\"},\n    {\"x1\": 14, \"x2\": 1.4, \"label\": \"group_b\"},\n    {\"x1\": 15, \"x2\": 1.5, \"label\": \"group_b\"},\n    {\"x1\": 16, \"x2\": 1.6, \"label\": \"group_b\"},\n    {\"x1\": 17, \"x2\": 1.7, \"label\": \"group_b\"},\n    {\"x1\": 18, \"x2\": 1.8, \"label\": \"group_b\"},\n    {\"x1\": 4.5, \"x2\": 0.45, \"label\": null},\n    {\"x1\": 14.5, \"x2\": 1.45, \"label\": null}\n  ],\n  \"target_column\": \"label\"\n}",
  "responseJson": "{\n  \"model\": \"Model\",\n  \"row_indices\": [18, 19],\n  \"predictions\": [\"group_a\", \"group_b\"],\n  \"probabilities\": [\n    {\"group_a\": 0.85, \"group_b\": 0.15},\n    {\"group_a\": 0.2, \"group_b\": 0.8}\n  ],\n  \"classes\": [\"group_a\", \"group_b\"]\n}",
  "csv": "x1,x2,label\n1,0.1,group_a\n2,0.2,group_a\n3,0.3,group_a\n4,0.4,group_a\n5,0.5,group_a\n6,0.6,group_a\n7,0.7,group_a\n8,0.8,group_a\n9,0.9,group_a\n10,1.0,group_b\n11,1.1,group_b\n12,1.2,group_b\n13,1.3,group_b\n14,1.4,group_b\n15,1.5,group_b\n16,1.6,group_b\n17,1.7,group_b\n18,1.8,group_b\n4.5,0.45,\n14.5,1.45,",
  "headers": "POST /api/model/predict\nContent-Type: application/json\nAccept: application/json"
} as const;

export const docsCopy = {
  "zh": {
    "eyebrow": "开发者文档",
    "title": "表格分类 API",
    "intro": "提交带标签的上下文与待预测样本，读取分类结果和类别概率。",
    "meta": "接口草案 / 待上线",
    "draftBadge": "服务待上线",
    "draftTitle": "模型服务尚未上线",
    "draftBody": "以下仅为接口格式与调用方式示意。/api/model/predict 和响应中的模型名称均为占位，不能直接用于现有在线体验；正式地址、协议与认证方式以上线后公布的信息为准。",
    "sidebarLabel": "开发指南",
    "mobileNav": "文档导航",
    "tocLabel": "本页目录",
    "labels": {
      "copy": "复制代码",
      "copied": "已复制",
      "failed": "复制失败，请选中代码手动复制。",
      "request": "发送请求",
      "response": "响应结构示意 · 非真实预测",
      "example": "完整请求",
      "endpoint": "占位接口 · 待上线",
      "next": "调用流程",
      "openPlayground": "打开在线体验",
      "openModels": "了解模型研究",
      "tableHint": "窄屏下可在表格内横向滚动查看全部字段。"
    },
    "groups": [
      {
        "title": "开始使用",
        "items": [
          {
            "id": "overview",
            "label": "接口介绍"
          },
          {
            "id": "status",
            "label": "模型与任务"
          },
          {
            "id": "request",
            "label": "快速开始"
          },
          {
            "id": "authentication",
            "label": "访问与认证"
          }
        ]
      },
      {
        "title": "接口参考",
        "items": [
          {
            "id": "parameters",
            "label": "请求参数"
          },
          {
            "id": "response",
            "label": "响应结构"
          },
          {
            "id": "errors",
            "label": "错误与重试"
          },
          {
            "id": "csv",
            "label": "CSV 数据输入"
          },
          {
            "id": "next",
            "label": "接入检查"
          }
        ]
      }
    ],
    "overview": {
      "title": "接口介绍",
      "body": "模型接口拟用于数值表格分类，返回分类标签与类别概率。本页展示数据组织和调用方式示意，自有模型服务尚未上线。",
      "note": "将已知标签和空目标行放入同一个 rows 数组 → 指定 target_column → 发送 JSON → 按 row_indices 对应回原始输入。"
    },
    "status": {
      "title": "模型与任务示意",
      "body": "本页以数值特征的表格分类说明数据结构，示例不传入 model 参数。支持任务、模型能力及最终请求参数以上线后公布的信息为准。",
      "facts": [
        {
          "label": "模型",
          "value": "模型",
          "tone": "accent"
        },
        {
          "label": "方法",
          "value": "POST",
          "tone": "neutral"
        },
        {
          "label": "内容格式",
          "value": "application/json",
          "tone": "neutral"
        }
      ]
    },
    "auth": {
      "title": "访问权限与认证",
      "body": "模型服务尚未上线，认证方式待确认。示例仅展示 Content-Type 和 Accept 请求头，不代表未来服务允许匿名访问。",
      "note": "生产鉴权、会话要求、外域 CORS 和访问配额待确认。先向部署方取得可访问的 origin 及访问说明；不要自行添加虚构令牌。"
    },
    "request": {
      "title": "快速开始",
      "body": "以下代码仅供阅读和接入准备，暂不能直接调用自有模型服务。教学 request.json 包含完整输入；示例使用 cURL、Python 3 或 Node.js 22。上线后再替换占位地址并按正式协议接入。",
      "tabs": {
        "curl": "cURL",
        "javascript": "JavaScript",
        "python": "Python"
      },
      "environment": "Bash：export THINKCAT_API_ORIGIN=\"https://your-confirmed-host.example\"；PowerShell：$env:THINKCAT_API_ORIGIN=\"https://your-confirmed-host.example\"。请替换示意地址；Windows 下用 curl.exe。JavaScript 保存为 predict.mjs 后运行 node predict.mjs；Python 保存为 predict.py 后运行 python3 predict.py。",
      "local": "本地预览只展示文档，不提供本页占位接口。现有在线体验的内部调用不因本文案调整而改变。",
      "sample": "完整教学输入：20 行、2 个数值特征、18 行已知标签、2 行待预测、2 类。它是人工构造数据，不用于证明模型准确率。"
    },
    "params": {
      "title": "请求头与参数",
      "body": "以下为 JSON 请求结构示意，包含 rows 与 target_column。每行保留相同列名；特征填有限数字，目标填类别字符串或 JSON null。必填性和字段类型仍需在正式接口上线时确认。",
      "columns": [
        "参数",
        "类型",
        "要求",
        "说明"
      ],
      "rows": [
        {
          "name": "rows",
          "type": "object[]",
          "required": "必需",
          "description": "所有上下文与待预测行，保持输入顺序。"
        },
        {
          "name": "target_column",
          "type": "string",
          "required": "必需",
          "description": "目标列的精确名称，区分大小写，每行必须包含此键。"
        },
        {
          "name": "rows[].<feature>",
          "type": "number",
          "required": "必需",
          "description": "非目标列。有限数值，不接受空特征、NaN 或无穷大。"
        },
        {
          "name": "rows[].<target>",
          "type": "string | null",
          "required": "必需",
          "description": "已知类别保留原始字符串；待预测使用 null，而非字符串 \"null\"。"
        }
      ],
      "limitsTitle": "网页发送前校验",
      "limitsNote": "这些是当前网页的校验范围，不是已核实的服务端上限。生产 JSON 请求大小、并发、频率和容量限制需单独确认。",
      "limits": [
        "总行数：20–10,000（不含表头）",
        "数值特征：1–30 列；已标注样本：至少 10 行",
        "待预测样本：1–50 行；已知类别：2–10 类",
        "特征不可缺失；只有目标列可留空"
      ]
    },
    "response": {
      "title": "成功响应与字段说明",
      "body": "以下是手写结构示意，概率和标签不是实际推理结果。当前客户端读取五个字段。",
      "note": "row_indices 示意本次请求 rows 的零基位置：18 表示第 19 行，不是原文件物理行号。三个结果数组按相同位置对应。概率对象按类别名称取值，概率不等于准确率。本页示意响应不能用于证明实际推理成功，最终响应格式以上线版本为准。",
      "rows": [
        {
          "name": "model",
          "type": "string",
          "required": "必需",
          "description": "模型名称占位，正式标识待服务上线后确认。"
        },
        {
          "name": "row_indices",
          "type": "integer[]",
          "required": "必需",
          "description": "完整覆盖待预测行，不能重复、遗漏或包含已标注行。"
        },
        {
          "name": "predictions",
          "type": "string[]",
          "required": "必需",
          "description": "与 row_indices 按位置对应，类别必须属于 classes。"
        },
        {
          "name": "probabilities",
          "type": "object[]",
          "required": "必需",
          "description": "与预测数组对齐，每个对象包含 classes 中每个类别的概率。"
        },
        {
          "name": "classes",
          "type": "string[]",
          "required": "必需",
          "description": "2–10 个互不重复的类别字符串。"
        }
      ]
    },
    "errors": {
      "title": "错误、超时与重试",
      "body": "以下是客户端收到状态后的处理方式，不代表全部状态均已在生产环境实测。错误体可能为 JSON、HTML、文本或空；后端统一错误结构尚未确认，不定义虚构的 error.code。",
      "columns": [
        "状态或情况",
        "客户端分类",
        "处理方式"
      ],
      "rows": [
        {
          "name": "400 / 422",
          "type": "rejected",
          "required": "修正输入",
          "description": "核对目标列、字段类型和 null。"
        },
        {
          "name": "413",
          "type": "payload-too-large",
          "required": "减少请求大小",
          "description": "核对网关 JSON 上限；不等同于 CSV 的 1 MiB 限制。"
        },
        {
          "name": "429",
          "type": "rate-limited",
          "required": "等待再试",
          "description": "若有 Retry-After 可参考；当前网页不自动重试。"
        },
        {
          "name": "408 / 504",
          "type": "timeout",
          "required": "检查服务状态",
          "description": "区分网关超时与客户端主动取消。"
        },
        {
          "name": "其他非 2xx 状态",
          "type": "unavailable",
          "required": "检查接入环境",
          "description": "确认权限、路由和上游状态；并非固定认证方案。"
        },
        {
          "name": "2xx + JSON／结构无效",
          "type": "invalid-response",
          "required": "检查原始响应",
          "description": "核对模型名、索引、数组长度及概率。"
        },
        {
          "name": "网络连接失败",
          "type": "unavailable",
          "required": "检查连接",
          "description": "检查网络、DNS、TLS 和代理；保存状态与错误摘要。"
        }
      ],
      "timeout": "网页运行使用 120 秒计时器；JavaScript 示例用 AbortSignal.timeout(120_000)，cURL 用 --max-time 120，Python 的 timeout=120 是 socket 操作超时，不是严格总时限。它们都不是服务 SLA。取消等待不代表后端任务已停止。",
      "retry": "输入错误先修正再重试。网络或服务错误应先确认原请求状态，再手动重试；自动集成可考虑有上限的退避，幂等性、重复计费和取消机制尚未确认。"
    },
    "csv": {
      "title": "从 CSV 准备数据",
      "body": "下载同一份教学 CSV，在在线体验上传。保留原始列名，最后两行目标单元格留空。网页将数值特征转为 JSON 数字，将空目标转为 null；此调用流程不使用 multipart/form-data。",
      "note": "上传校验：文件 ≤1 MiB、2–31 列、唯一且非空表头、每行列数一致。中文字段名仅用于显示，请求和下载仍保留原始键。完整 CSV 包含 20 条数据记录。"
    },
    "next": {
      "title": "接入前检查",
      "body": "自有模型服务尚未上线。以下接入信息待确认，本页的占位地址和模型名称不代表已发布接口。",
      "items": [
        "正式 origin、访问认证、会话要求和跨域策略",
        "后端输入范围、请求体、并发与频率限制",
        "错误格式、超时、取消、幂等性和重试约定",
        "使用可访问环境进行一次真实预测；示意响应不代表调用成功"
      ]
    }
  },
  "en": {
    "eyebrow": "Developer documentation",
    "title": "Tabular classification API",
    "intro": "Submit labeled context and unlabeled samples. Read classifications and per-class probabilities.",
    "meta": "Draft / Coming soon",
    "draftBadge": "Coming soon",
    "draftTitle": "The model service is not live yet",
    "draftBody": "These are illustrative request formats and calling patterns. /api/model/predict and the response model name are placeholders, not the existing Playground endpoint. The final URL, contract and authentication will be published at launch.",
    "sidebarLabel": "Developer guide",
    "mobileNav": "Documentation navigation",
    "tocLabel": "On this page",
    "labels": {
      "copy": "Copy code",
      "copied": "Copied",
      "failed": "Copy failed. Select the code and copy it manually.",
      "request": "Send a request",
      "response": "Illustrative response · not a real prediction",
      "example": "Complete request",
      "endpoint": "Placeholder · not live",
      "next": "Workflow",
      "openPlayground": "Open Playground",
      "openModels": "Explore model research",
      "tableHint": "On smaller screens, scroll within the table to read every field."
    },
    "groups": [
      {
        "title": "Get started",
        "items": [
          {
            "id": "overview",
            "label": "Introduction"
          },
          {
            "id": "status",
            "label": "Model and task"
          },
          {
            "id": "request",
            "label": "Quickstart"
          },
          {
            "id": "authentication",
            "label": "Access & authentication"
          }
        ]
      },
      {
        "title": "API reference",
        "items": [
          {
            "id": "parameters",
            "label": "Request parameters"
          },
          {
            "id": "response",
            "label": "Response schema"
          },
          {
            "id": "errors",
            "label": "Errors & retry"
          },
          {
            "id": "csv",
            "label": "CSV input"
          },
          {
            "id": "next",
            "label": "Integration checklist"
          }
        ]
      }
    ],
    "overview": {
      "title": "Introduction",
      "body": "The proposed model API illustrates numeric tabular classification with labels and per-class probabilities. This page demonstrates data organization and calling patterns; the model service is not live yet.",
      "note": "Put labeled and unlabeled rows in one rows array → set target_column → send JSON → map results back using row_indices."
    },
    "status": {
      "title": "Illustrative model and task",
      "body": "These examples illustrate tabular classification with numeric features and no model selector. Supported tasks, model capabilities and final request parameters will be confirmed at launch.",
      "facts": [
        {
          "label": "Model",
          "value": "Model",
          "tone": "accent"
        },
        {
          "label": "Method",
          "value": "POST",
          "tone": "neutral"
        },
        {
          "label": "Content type",
          "value": "application/json",
          "tone": "neutral"
        }
      ]
    },
    "auth": {
      "title": "Access & authentication",
      "body": "Authentication is not yet confirmed. Examples show Content-Type and Accept only; this does not imply anonymous access to the future service.",
      "note": "Production authentication, session requirements, cross-origin CORS and quotas are unconfirmed. Obtain the accessible origin and access instructions from the operator first."
    },
    "request": {
      "title": "Quickstart",
      "body": "These examples are for reading and integration preparation, not calls to a live model service. The teaching request.json contains complete input; examples use cURL, Python 3 or Node.js 22. Replace placeholders and follow the final contract after launch.",
      "tabs": {
        "curl": "cURL",
        "javascript": "JavaScript",
        "python": "Python"
      },
      "environment": "Bash: export THINKCAT_API_ORIGIN=\"https://your-confirmed-host.example\"; PowerShell: $env:THINKCAT_API_ORIGIN=\"https://your-confirmed-host.example\". Replace the example host; use curl.exe on Windows. Save JavaScript as predict.mjs and run node predict.mjs; save Python as predict.py and run python3 predict.py.",
      "local": "Local preview displays documentation only and does not implement this placeholder endpoint. Existing Playground requests are unaffected by this documentation change.",
      "sample": "Complete teaching input: 20 rows, 2 numeric features, 18 labeled rows, 2 query rows and 2 classes. This synthetic data does not demonstrate model accuracy."
    },
    "params": {
      "title": "Request headers & parameters",
      "body": "This illustrative JSON request contains rows and target_column. Rows use consistent column keys, finite numeric features and class strings or JSON null targets. Required fields and types must be confirmed against the final service contract.",
      "columns": [
        "Parameter",
        "Type",
        "Requirement",
        "Description"
      ],
      "rows": [
        {
          "name": "rows",
          "type": "object[]",
          "required": "Required",
          "description": "All context and query rows in input order."
        },
        {
          "name": "target_column",
          "type": "string",
          "required": "Required",
          "description": "Exact, case-sensitive target key present in every row."
        },
        {
          "name": "rows[].<feature>",
          "type": "number",
          "required": "Required",
          "description": "A non-target column: finite numeric value; no missing features, NaN or infinity."
        },
        {
          "name": "rows[].<target>",
          "type": "string | null",
          "required": "Required",
          "description": "Preserve known class strings; use null for queries, not the string \"null\"."
        }
      ],
      "limitsTitle": "Web client preflight validation",
      "limitsNote": "These are web client rules, not verified backend limits. Confirm production JSON body size, concurrency, rate and capacity limits separately.",
      "limits": [
        "Total rows: 20–10,000, excluding headers",
        "Numeric features: 1–30; labeled context: at least 10 rows",
        "Query rows: 1–50; known classes: 2–10",
        "No missing features; only targets may be missing"
      ]
    },
    "response": {
      "title": "Success response & schema",
      "body": "This hand-written example explains the shape; its probabilities and labels are not real inference results. The current client reads five fields.",
      "note": "row_indices illustrates zero-based positions in request rows: 18 means the 19th row, not a physical CSV line. Pair result arrays by position and read probabilities by class name. Probability is not accuracy. This illustrative response does not prove inference success; the final response contract will be confirmed at launch.",
      "rows": [
        {
          "name": "model",
          "type": "string",
          "required": "Required",
          "description": "Placeholder model name; the actual identifier will be confirmed at launch."
        },
        {
          "name": "row_indices",
          "type": "integer[]",
          "required": "Required",
          "description": "Exactly covers query rows, without duplicates, omissions or labeled rows."
        },
        {
          "name": "predictions",
          "type": "string[]",
          "required": "Required",
          "description": "Aligned with row_indices; each label must belong to classes."
        },
        {
          "name": "probabilities",
          "type": "object[]",
          "required": "Required",
          "description": "Aligned with predictions; each object contains probabilities for every class."
        },
        {
          "name": "classes",
          "type": "string[]",
          "required": "Required",
          "description": "2–10 distinct class strings."
        }
      ]
    },
    "errors": {
      "title": "Errors, timeouts & retries",
      "body": "These are client mappings for received statuses, not a claim that every status is verified in production. Error bodies can be JSON, HTML, text or empty. The backend error schema is unconfirmed; no error.code contract is invented.",
      "columns": [
        "Status or condition",
        "Client category",
        "Action"
      ],
      "rows": [
        {
          "name": "400 / 422",
          "type": "rejected",
          "required": "Correct input",
          "description": "Check target keys, field types and null values."
        },
        {
          "name": "413",
          "type": "payload-too-large",
          "required": "Reduce body size",
          "description": "Confirm gateway JSON limits; distinct from the 1 MiB CSV limit."
        },
        {
          "name": "429",
          "type": "rate-limited",
          "required": "Wait before retrying",
          "description": "Respect Retry-After if supplied; the web client does not auto-retry."
        },
        {
          "name": "408 / 504",
          "type": "timeout",
          "required": "Check service health",
          "description": "Distinguish gateway timeout from client cancellation."
        },
        {
          "name": "Other non-2xx statuses",
          "type": "unavailable",
          "required": "Check integration",
          "description": "Confirm access, routes and upstream health; no particular auth scheme is implied."
        },
        {
          "name": "2xx + invalid JSON/schema",
          "type": "invalid-response",
          "required": "Inspect response",
          "description": "Check model, indices, array lengths and probabilities."
        },
        {
          "name": "Network failure",
          "type": "unavailable",
          "required": "Check connectivity",
          "description": "Inspect network, DNS, TLS and proxy; retain status and an error summary."
        }
      ],
      "timeout": "The Playground uses a 120-second timer; JavaScript uses AbortSignal.timeout(120_000), cURL uses --max-time 120, while Python timeout=120 is a socket-operation timeout, not a strict overall deadline. None is a service SLA. Stopping a client wait does not prove backend cancellation.",
      "retry": "Fix input errors before retrying. For network or service failures, confirm the original request state before resubmitting. Automated integrations may use bounded backoff, but idempotency, duplicate billing and cancellation semantics are unconfirmed."
    },
    "csv": {
      "title": "Prepare data from CSV",
      "body": "Download the matching teaching CSV and upload it in the Playground. Keep original headers; leave the final two targets blank. The web client converts numeric features to JSON numbers and empty targets to null. The API does not accept multipart/form-data in this client flow.",
      "note": "Upload checks: file ≤1 MiB, 2–31 columns, unique nonempty headers and consistent row widths. Chinese names are display-only; requests and exports retain original keys. The complete CSV contains 20 data records."
    },
    "next": {
      "title": "Before integrating",
      "body": "The model service is not live yet. Confirm these integration details at launch; placeholder URLs and names do not represent a released API.",
      "items": [
        "Production origin, authentication, session requirements and CORS",
        "Backend input, body-size, concurrency and rate limits",
        "Error format, timeouts, cancellation, idempotency and retry behavior",
        "Run a real prediction in an accessible environment; sample responses are not proof of success"
      ]
    }
  }
} as const;
