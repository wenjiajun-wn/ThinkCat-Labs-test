type TableRow = {name: string; type: string; required: string; description: string};

type DocsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  draftBadge: string;
  draftTitle: string;
  draftBody: string;
  meta: string;
  sidebarLabel: string;
  mobileNav: string;
  tocLabel: string;
  labels: {
    endpoint: string;
    method: string;
    copy: string;
    copied: string;
    failed: string;
    required: string;
    optional: string;
    request: string;
    response: string;
    example: string;
    status: string;
    next: string;
    openPlayground: string;
    openModels: string;
    tableHint: string;
  };
  groups: readonly {
    title: string;
    items: readonly {id: string; label: string}[];
  }[];
  status: {
    title: string;
    body: string;
    facts: readonly {label: string; value: string; tone: 'neutral' | 'accent' | 'warning'}[];
  };
  overview: {title: string; body: string; note: string};
  auth: {title: string; body: string; note: string};
  request: {title: string; body: string; endpointLabel: string; tabs: {curl: string; typescript: string; python: string}};
  params: {title: string; body: string; columns: readonly string[]; rows: readonly TableRow[]};
  response: {title: string; body: string; note: string};
  errors: {title: string; body: string; columns: readonly string[]; rows: readonly TableRow[]};
  models: {title: string; body: string; columns: readonly string[]; rows: readonly TableRow[]};
  next: {title: string; body: string; items: readonly string[]};
};

const requestJson = `{
  "model": "tabular",
  "context": {
    "columns": ["sensor_a", "sensor_b", "load_gap"],
    "rows": [
      [12.4, 3.1, 0.82],
      [15.1, 4.6, 0.62]
    ],
    "labels": ["steady", "drift"]
  },
  "query": {
    "rows": [[13.3, 3.3, 0.81]]
  },
  "options": {
    "normalize": true,
    "uncertainty": true
  }
}`;

const responseJson = `{
  "request_id": "req_<opaque_id>",
  "model": "tabular",
  "contract": "draft",
  "predictions": [
    {
      "label": "<class>",
      "score": 0.0,
      "interval": [0.0, 1.0],
      "synthetic_example": true
    }
  ],
  "notice": "Illustrative response shape. No live prediction is available."
}`;

const errorJson = `{
  "error": {
    "code": "invalid_request",
    "message": "Field query.rows must contain at least one row.",
    "request_id": "req_<opaque_id>"
  }
}`;

export const docsCode = {
  tabs: {
    curl: `curl -X POST "https://{API_HOST}/v1/predict" \\
  -H "Authorization: Bearer $THINKCAT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${requestJson.replace(/\n/g, '\n  ')}'`,
    typescript: `const response = await fetch(\`https://\${API_HOST}/v1/predict\`, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${THINKCAT_TOKEN}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "tabular",
    context: { columns, rows, labels },
    query: { rows: queryRows },
    options: { normalize: true, uncertainty: true }
  })
});

const result = await response.json();
// Contract draft: validate the response before using it.`,
    python: `import os
import requests

response = requests.post(
    "https://{API_HOST}/v1/predict",
    headers={
        "Authorization": f"Bearer {os.environ['THINKCAT_TOKEN']}",
        "Content-Type": "application/json",
    },
    json={
        "model": "tabular",
        "context": {
            "columns": columns,
            "rows": rows,
            "labels": labels,
        },
        "query": {"rows": query_rows},
        "options": {"normalize": True, "uncertainty": True},
    },
    timeout=30,
)

response.raise_for_status()
result = response.json()
# Contract draft: validate the response before using it.`,
  },
  requestJson,
  responseJson,
  errorJson,
};

export const docsCopy: {zh: DocsCopy; en: DocsCopy} = {
  zh: {
    eyebrow: '开发者 / 接口契约草案',
    title: 'API 文档',
    intro: '这是面向开发者的接口文档草案，用于讨论请求形状、参数语义与错误边界。此草案并非在线体验当前使用的 Kumo 接口规范，字段与鉴权仍可能变化。',
    draftBadge: '草案 v0.1',
    draftTitle: '这不是已上线服务。',
    draftBody: '以下端点、参数与错误结构只用于前端文档设计。请不要将其视为稳定契约，也不要向示例主机发送真实数据。',
    meta: '前端文档预览 / 接口契约未验证 / 无真实推理',
    sidebarLabel: '文档导航',
    mobileNav: '打开文档目录',
    tocLabel: '本页目录',
    labels: {
      endpoint: '端点',
      method: '方法',
      copy: '复制代码',
      copied: '已复制',
      failed: '复制失败，请手动选择',
      required: '必填',
      optional: '可选',
      request: '请求示例',
      response: '响应示例',
      example: '示例',
      status: '状态',
      next: '继续',
      openPlayground: '打开在线体验',
      openModels: '查看模型研究',
      tableHint: '左右滑动查看完整表格',
    },
    groups: [
      {
        title: '开始',
        items: [
          {id: 'overview', label: '概览'},
          {id: 'status', label: '接口状态'},
          {id: 'authentication', label: '鉴权'},
        ],
      },
      {
        title: '接口',
        items: [
          {id: 'request', label: '请求'},
          {id: 'parameters', label: '参数'},
          {id: 'response', label: '响应'},
          {id: 'errors', label: '错误'},
        ],
      },
      {
        title: '模型',
        items: [{id: 'models', label: '模型标识'}],
      },
      {
        title: '下一步',
        items: [{id: 'next', label: '接入前检查'}],
      },
    ],
    status: {
      title: '接口状态',
      body: '文档在描述一种可能的接口形状，而不是一个可以调用的服务。真实契约需要经过模型授权、安全评审与联调后才能发布。',
      facts: [
        {label: '契约版本', value: 'Draft 0.1', tone: 'warning'},
        {label: '服务状态', value: '未开放', tone: 'warning'},
        {label: '鉴权方式', value: '待定', tone: 'neutral'},
        {label: '基础地址', value: '{API_HOST}', tone: 'neutral'},
        {label: '数据保留', value: '未定义', tone: 'neutral'},
        {label: '最后更新', value: '2026-11', tone: 'neutral'},
      ],
    },
    overview: {
      title: '概览',
      body: '这份草案覆盖一次预测请求所需的最小结构：上下文样本、待预测行、模型标识与不确定性字段。所有内容都用于前端联调前的讨论。',
      note: '建议阅读顺序：先确认接口状态，再看请求与参数，最后检查错误与接入清单。',
    },
    auth: {
      title: '鉴权',
      body: '草案假设使用 Bearer Token，但令牌签发、作用域与轮换策略尚未确认。示例只展示请求头的位置，不包含真实凭证。',
      note: '不要把生产密钥放进前端代码或公开仓库。',
    },
    request: {
      title: '预测请求',
      body: '请求把上下文样本与待预测行放在同一个结构中。上下文与查询必须使用相同的特征列顺序。',
      endpointLabel: 'POST /v1/predict',
      tabs: {curl: 'cURL', typescript: 'TypeScript', python: 'Python'},
    },
    params: {
      title: '参数',
      body: '以下字段名与类型是草案，最终名称可能变化。所有数值特征必须能解析为有限数字。',
      columns: ['字段', '类型', '必需', '说明'],
      rows: [
        {name: 'model', type: 'string', required: '必填', description: '模型标识。当前研究阶段可选 tabular、time-series、unified。'},
        {name: 'context.columns', type: 'string[]', required: '必填', description: '上下文表格的列名，顺序必须与 rows 一致。'},
        {name: 'context.rows', type: 'number[][]', required: '必填', description: '带标签的上下文样本。'},
        {name: 'context.labels', type: 'string[]', required: '必填', description: '每个上下文样本对应的标签。'},
        {name: 'query.rows', type: 'number[][]', required: '必填', description: '待预测样本，列顺序必须与 context.columns 一致。'},
        {name: 'options.normalize', type: 'boolean', required: '可选', description: '请求服务端在比较前标准化特征。'},
        {name: 'options.uncertainty', type: 'boolean', required: '可选', description: '请求返回不确定性区间，具体字段待定。'},
      ],
    },
    response: {
      title: '响应',
      body: '草案响应包含请求标识、模型标识与预测数组。区间是待设计字段，不代表当前服务已经能够返回。',
      note: '示例中的 0.0 与空字符串是占位值，不是实际输出。',
    },
    errors: {
      title: '错误',
      body: '以下状态码与错误包络用于讨论前端处理方式，不是已验证的接口行为。',
      columns: ['状态码', '错误代码', '说明'],
      rows: [
        {name: '400', type: 'invalid_request', required: '请求结构或字段无效', description: '检查列顺序、行数与特征类型。'},
        {name: '401', type: 'unauthorized', required: '令牌缺失或无效', description: '草案中的鉴权方式仍待确认。'},
        {name: '413', type: 'payload_too_large', required: '请求体超过限制', description: '限制值尚未确定。'},
        {name: '429', type: 'rate_limited', required: '请求频率过高', description: '配额与重试策略尚未确定。'},
        {name: '503', type: 'model_unavailable', required: '模型或网关不可用', description: '当前没有线上服务。'},
      ],
    },
    models: {
      title: '模型标识',
      body: '模型标识与研究模型保持一致。状态表示公开可用性，而不是技术路线。',
      columns: ['标识', '模型', '状态'],
      rows: [
        {name: 'tabular', type: '表格基础模型', required: '研究中', description: '上下文表格分类与回归研究。'},
        {name: 'time-series', type: '时间序列基础模型', required: '研究中', description: '时序预测与异常检测研究。'},
        {name: 'unified', type: '统一数值基础模型', required: '研究中', description: '跨表格与时间形态的表征研究。'},
      ],
    },
    next: {
      title: '接入前检查',
      body: '以下清单用于草案接口的后续评审；在线体验使用独立的远程推理接口，其可用性由部署环境决定。',
      items: [
        '所有演示结果都带 Demo 标记，不与真实推理混淆。',
        '数据来源、状态管理与展示组件保持分离。',
        '错误状态可读，加载状态不阻塞键盘操作。',
        '不在客户端存放生产密钥，也不伪造外部链接。',
      ],
    },
  },
  en: {
    eyebrow: 'Developer / API contract draft',
    title: 'API documentation',
    intro: 'This is a developer documentation draft for discussing request shape, parameter semantics and error boundaries. This draft is distinct from the Kumo endpoint used by Playground; fields and authentication may change.',
    draftBadge: 'Draft v0.1',
    draftTitle: 'This is not a live service.',
    draftBody: 'The endpoint, parameters and error envelope below exist for frontend documentation design. Do not treat them as a stable contract or send real data to the example host.',
    meta: 'Frontend documentation preview / Contract unverified / No live inference',
    sidebarLabel: 'Documentation navigation',
    mobileNav: 'Open documentation contents',
    tocLabel: 'On this page',
    labels: {
      endpoint: 'Endpoint',
      method: 'Method',
      copy: 'Copy code',
      copied: 'Copied',
      failed: 'Copy failed. Select the code manually.',
      required: 'Required',
      optional: 'Optional',
      request: 'Request example',
      response: 'Response example',
      example: 'Example',
      status: 'Status',
      next: 'Continue',
      openPlayground: 'Open Playground',
      openModels: 'Explore model studies',
      tableHint: 'Scroll horizontally to see the full table',
    },
    groups: [
      {
        title: 'Start',
        items: [
          {id: 'overview', label: 'Overview'},
          {id: 'status', label: 'API status'},
          {id: 'authentication', label: 'Authentication'},
        ],
      },
      {
        title: 'Reference',
        items: [
          {id: 'request', label: 'Request'},
          {id: 'parameters', label: 'Parameters'},
          {id: 'response', label: 'Response'},
          {id: 'errors', label: 'Errors'},
        ],
      },
      {
        title: 'Models',
        items: [{id: 'models', label: 'Model IDs'}],
      },
      {
        title: 'Next',
        items: [{id: 'next', label: 'Integration checklist'}],
      },
    ],
    status: {
      title: 'API status',
      body: 'This documentation describes a possible API shape, not a callable service. A real contract requires model licensing, security review and integration testing before publication.',
      facts: [
        {label: 'Contract', value: 'Draft 0.1', tone: 'warning'},
        {label: 'Service', value: 'Unavailable', tone: 'warning'},
        {label: 'Authentication', value: 'Undecided', tone: 'neutral'},
        {label: 'Base host', value: '{API_HOST}', tone: 'neutral'},
        {label: 'Retention', value: 'Undefined', tone: 'neutral'},
        {label: 'Updated', value: '2026-11', tone: 'neutral'},
      ],
    },
    overview: {
      title: 'Overview',
      body: 'This draft covers the minimum structure of a prediction request: context samples, query rows, a model ID and uncertainty fields. All of it exists to support discussion before integration.',
      note: 'Suggested reading order: confirm status, review the request and parameters, then check errors and the integration checklist.',
    },
    auth: {
      title: 'Authentication',
      body: 'The draft assumes a Bearer token, but issuance, scopes and rotation are not confirmed. The example shows where a header would go. It contains no real credential.',
      note: 'Never place production secrets in frontend code or a public repository.',
    },
    request: {
      title: 'Prediction request',
      body: 'The request places context samples and query rows in one structure. Context and query must share the same feature column order.',
      endpointLabel: 'POST /v1/predict',
      tabs: {curl: 'cURL', typescript: 'TypeScript', python: 'Python'},
    },
    params: {
      title: 'Parameters',
      body: 'Field names and types are draft material and may change. Every numeric feature must parse as a finite number.',
      columns: ['Field', 'Type', 'Required', 'Description'],
      rows: [
        {name: 'model', type: 'string', required: 'Required', description: 'Model ID. Research-stage values are tabular, time-series and unified.'},
        {name: 'context.columns', type: 'string[]', required: 'Required', description: 'Column names for the context table, in the same order as rows.'},
        {name: 'context.rows', type: 'number[][]', required: 'Required', description: 'Labeled context samples.'},
        {name: 'context.labels', type: 'string[]', required: 'Required', description: 'The label for each context sample.'},
        {name: 'query.rows', type: 'number[][]', required: 'Required', description: 'Prediction samples. Column order must match context.columns.'},
        {name: 'options.normalize', type: 'boolean', required: 'Optional', description: 'Ask the service to normalize features before comparison.'},
        {name: 'options.uncertainty', type: 'boolean', required: 'Optional', description: 'Ask for an uncertainty interval. Exact fields are undecided.'},
      ],
    },
    response: {
      title: 'Response',
      body: 'The draft response carries a request ID, model ID and prediction array. The interval is a design field; it does not mean the service can return one today.',
      note: 'The 0.0 and empty string in the example are placeholders, not real output.',
    },
    errors: {
      title: 'Errors',
      body: 'The status codes and error envelope below exist to discuss frontend handling. They are not verified API behavior.',
      columns: ['Status', 'Error code', 'Description'],
      rows: [
        {name: '400', type: 'invalid_request', required: 'Request shape or field is invalid', description: 'Check column order, row count and feature types.'},
        {name: '401', type: 'unauthorized', required: 'Token missing or invalid', description: 'The draft authentication method is undecided.'},
        {name: '413', type: 'payload_too_large', required: 'Request body exceeds a limit', description: 'The limit is not yet defined.'},
        {name: '429', type: 'rate_limited', required: 'Too many requests', description: 'Quota and retry behavior are not defined.'},
        {name: '503', type: 'model_unavailable', required: 'Model or gateway unavailable', description: 'There is no live service today.'},
      ],
    },
    models: {
      title: 'Model IDs',
      body: 'Model IDs match the research studies. The state describes public availability, not the technical approach.',
      columns: ['ID', 'Model', 'Status'],
      rows: [
        {name: 'tabular', type: 'Tabular Foundation Model', required: 'Research', description: 'In-context tabular classification and regression research.'},
        {name: 'time-series', type: 'Time Series Foundation Model', required: 'Research', description: 'Temporal forecasting and anomaly detection research.'},
        {name: 'unified', type: 'Unified Numerical Foundation Model', required: 'Research', description: 'Representation research across table and temporal forms.'},
      ],
    },
    next: {
      title: 'Integration checklist',
      body: 'These checks apply to future review of this draft contract. Playground uses a separate remote inference endpoint whose availability depends on deployment.',
      items: [
        'Every demo result carries a Demo label and is never presented as real inference.',
        'Data sources, state management and presentation components remain separate.',
        'Error states are readable and loading states do not block keyboard use.',
        'Production secrets are never shipped to the client, and external links are never invented.',
      ],
    },
  },
};
