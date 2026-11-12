export const homeCopy = {
  zh: {
    hero: {
      fieldLabel: '原创数值地形。合成数据静态示意。',
    },
    premise: {
      index: '01',
      label: '研究命题',
      statement: '数值的意义，来自它所处的上下文。',
      body: '一个数字本身没有固定语义。表格中的列关系、序列中的先后与周期，决定了它意味着什么。我们研究模型如何从当前数据中读取这些关系。',
      aside: '理解结构，而不是记住答案。',
      link: '我们的方向',
    },
    models: {
      index: '02',
      label: '模型体系',
      capabilities: {
        relational: '关系型数据智能',
        context: '零样本上下文推理',
        outlier: '分布偏移与异常检测',
      },
      title: '三种数值形态，一套研究议程。',
      body: '表格、时间序列与统一表征不是三个孤立的演示，而是同一个问题的三个观察角度：如何在上下文中学习数值结构。',
      note: '全部模型处于研究阶段。版本与公开资源待确认。',
      link: '打开模型',
      statusLabel: '状态',
    },
    applications: {
      index: '03',
      label: '使用场景',
      title: '数字在现实中的形状。',
      body: '不同的行业不是同一张图表的换色。交易分布、负荷周期、指标关联、季节需求与传感器偏移，各自需要不同的观察方式。',
      link: '浏览行业图谱',
      note: '交互式合成示意，用于说明数据形态。',
      previewReadings: {
        finance: '柱形和曲线呈现分布变化。虚线标记复核位置，并非模型输出阈值。',
        energy: '多条曲线呈现一天中不同的合成负荷节奏。虚线标记峰值观察位置。',
        health: '散点和轮廓呈现合成指标的局部关联与分群。示意不用于诊断。',
        retail: '矩阵呈现合成需求随时间的分布。颜色越亮，需求越集中。',
        industry: '三条合成信号对照局部变化。高亮窗口用于说明偏移，并非检测结果。',
      },
    },
    research: {
      index: '04',
      label: '研究',
      title: '先建立可验证的理解。',
      body: '基础模型的价值不只在于规模，更在于它能否在不同数据集与任务之间保持可靠。我们把评估、不确定性与失败边界放在与建模同等重要的位置。',
      points: [
        ['跨数据集泛化', '检验表征能否离开原始分布继续成立。'],
        ['不确定性表达', '让预测的范围与置信程度可见。'],
        ['可复现评估', '记录方法、数据与限制，允许被重新检验。'],
      ],
      link: '研究方向',
    },
    developer: {
      index: '05',
      label: '开发者',
      title: '迈向生产环境的第一步',
      body: 'API 文档展示正在审阅的接口规范。在线体验可用示例数据或自有 CSV 提交表格分类任务，运行时将调用远程推理服务。',
      docs: 'API 规范预览',
      docsDetail: '接口路由、参数 Schema、响应结构与异常定义',
      playground: '在线体验',
      playgroundDetail: '上传 CSV、运行表格分类并下载预测结果',
      terminalLabel: '终端 / 接口规范',
      draftLabel: '预览版 0.1',
      code: `POST /v1/predict
model: tabular
context: labeled rows
query: unlabeled rows

status: contract under review`,
    },
  },
  en: {
    hero: {
      fieldLabel: 'Original numerical terrain. Static synthetic illustration.',
    },
    premise: {
      index: '01',
      label: 'Premise',
      statement: 'A number means what its context makes it mean.',
      body: 'A value has no fixed meaning on its own. Column relationships in a table, and order and cycles in a sequence, decide what it signifies. We study how models can read those relationships from the data in front of them.',
      aside: 'Learn structure, not memorized answers.',
      link: 'Our direction',
    },
    models: {
      index: '02',
      label: 'Model system',
      capabilities: {
        relational: 'Relational Data Intelligence',
        context: 'In-Context Learning',
        outlier: 'Outlier & Shift Detection',
      },
      title: 'Three numerical forms. One research agenda.',
      body: 'Tables, time series and unified representations are not three isolated demos. They are three views of one question: how numerical structure can be learned in context.',
      note: 'All models are at research stage. Versions and public resources are pending verification.',
      link: 'Open model',
      statusLabel: 'Status',
    },
    applications: {
      index: '03',
      label: 'Applications',
      title: 'The shape of numbers in the field.',
      body: 'Industries are not one chart with a different color. Transaction distributions, load cycles, indicator associations, seasonal demand and sensor deviations each ask for a different way of looking.',
      link: 'Open the atlas',
      previewReadings: {
        finance: 'Bars and the curve show changes in distribution. The dashed line marks a review position, separate from any model threshold.',
        energy: 'The curves show different synthetic load patterns over a day. The dashed line marks a point for peak review.',
        health: 'Points and outlines show local associations and clusters in synthetic indicators. This illustration is not for diagnosis.',
        retail: 'The matrix shows synthetic demand over time. Brighter cells indicate stronger concentration.',
        industry: 'Three synthetic signals show local changes. The highlighted window illustrates drift and does not represent a detection result.',
      },
      note: 'Interactive synthetic illustrations, used to explain data form.',
    },
    research: {
      index: '04',
      label: 'Research',
      title: 'Understanding before scale.',
      body: 'The value of a foundation model is not only its size. It is whether it remains dependable across datasets and tasks. We treat evaluation, uncertainty and failure boundaries as part of the model, not an afterthought.',
      points: [
        ['Cross-dataset transfer', 'Test whether a representation still holds outside its original distribution.'],
        ['Uncertainty', 'Make the range and confidence of a prediction visible.'],
        ['Reproducible evaluation', 'Record methods, data and limits so claims can be checked again.'],
      ],
      link: 'Research directions',
    },
    developer: {
      index: '05',
      label: 'Developer',
      title: 'Built for the next step.',
      body: 'The API documentation describes a draft contract. In the Playground, run tabular classification on sample data or your own CSV using the remote inference service.',
      docs: 'API draft',
      docsDetail: 'Endpoints, parameters, responses and errors',
      playground: 'Playground',
      playgroundDetail: 'Upload a CSV, run tabular classification and download predictions',
      terminalLabel: 'Terminal / Contract',
      draftLabel: 'Draft 0.1',
      code: `POST /v1/predict
model: tabular
context: labeled rows
query: unlabeled rows

status: contract under review`,
    },
  },
} as const;

export type HomeCopy = typeof homeCopy.zh;
