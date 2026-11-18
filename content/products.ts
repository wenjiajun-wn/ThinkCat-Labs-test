import type {ModelId} from '../config/models';

type ModelStudy = {
  kicker: string;
  name: string;
  short: string;
  summary: string;
  pageSummary?: string;
  focus: string;
  tasks: readonly string[];
  details: readonly {title: string; body: string}[];
  params?: readonly {label: string; value: string}[];
};

type ProductsPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  labels: {
    status: string;
    version: string;
    focus: string;
    tasks: string;
    resources: string;
    links: string;
    pending: string;
    synthetic: string;
    docs: string;
    playground: string;
    docsAction: string;
    playgroundAction: string;
    studyNotes: string;
    closeNotes: string;
    modelIndex: string;
    scrollHint: string;
    notPublished: string;
    github: string;
    huggingFace: string;
  };
  unified: {
    tableSide: string;
    seriesSide: string;
    linkLabel: string;
    instruction: string;
    pair: string;
  };
  resources: {title: string; body: string; docs: string; playground: string};
  studies: Record<ModelId, ModelStudy> & {unified: ModelStudy & {figure: string; note: string; interaction: string}};
};

export const productsCopy: {zh: ProductsPageCopy; en: ProductsPageCopy} = {
  zh: {
    eyebrow: '模型',
    title: '数值基础模型',
    intro: '从表格到时间序列，再到统一表征。三个研究模型共享同一个问题：模型如何从上下文中读取数值结构。',
    labels: {
      status: '状态',
      version: '版本',
      focus: '技术方向',
      tasks: '研究任务',
      resources: '开发者入口',
      links: '公开资源',
      pending: '待确认',
      synthetic: '合成数据示意',
      docs: 'API 文档',
      playground: '在线体验',
      docsAction: '查看接口草案',
      playgroundAction: '打开在线体验',
      studyNotes: '技术说明',
      closeNotes: '收起说明',
      modelIndex: '模型索引',
      scrollHint: '向下滚动查看三项研究',
      notPublished: '尚未发布',
      github: 'GitHub',
      huggingFace: 'Hugging Face',
    },
    unified: {
      tableSide: '表格结构',
      seriesSide: '时间动态',
      linkLabel: '共享表征',
      instruction: '悬停或聚焦一组映射，观察表格列与时间通道之间的对应关系。',
      pair: '映射对',
    },
    resources: {
      title: '从模型到开发者入口',
      body: '接口文档展示待评审的契约草案。在线体验通过独立的同源接口请求远程 Kumo 推理；是否可用取决于部署环境。',
      docs: '查看接口草案',
      playground: '打开在线体验',
    },
    studies: {
      tabular: {
        kicker: 'A / 表格',
        name: '表格基础模型',
        short: '从行与列中学习上下文。',
        summary: '研究如何利用当前表格中的标注样本，理解不同类型列之间的关系，并迁移到分类、回归与小样本推断。',
        pageSummary: '探索跨表格预训练与上下文学习，从少量标注样本中理解特征关系，适应不同数据集的预测任务。',
        focus: '上下文学习 / 异构特征 / 小样本推断',
        tasks: ['分类', '回归', '小样本推断'],
        details: [
          {title: '研究关注', body: '每一张表都可以被看作自己的上下文。模型需要在不更新参数的前提下，从列名、数值分布和少量标注样本中读取关系。'},
          {title: '边界', body: '版本、公开权重和服务接口仍待确认。'},
        ],
        params: [
          {label: '输入', value: '带标注与未标注行的数值表格'},
          {label: '读取方式', value: '在当前上下文中比较样本'},
          {label: '当前阶段', value: '研究'},
        ],
      },
      'time-series': {
        kicker: 'B / 时间序列',
        name: '时间序列基础模型',
        short: '在变化中保留不确定性。',
        summary: '研究序列中的周期、趋势与异常变化，并让预测结果以区间而不是单一数字表达。',
        pageSummary: '探索跨领域时间序列预训练，学习趋势、周期与长期依赖，预测未来变化并刻画不确定性。',
        focus: '长程依赖 / 预测区间 / 异常偏移',
        tasks: ['时序预测', '异常检测'],
        details: [
          {title: '研究关注', body: '时序模型需要同时处理短期波动与更长周期的结构。预测区间是表达不确定性的必要部分，而不是装饰。'},
        ],
        params: [
          {label: '输入', value: '有序数值序列与时间上下文'},
          {label: '输出', value: '预测路径与不确定区间'},
          {label: '当前阶段', value: '研究'},
        ],
      },
      unified: {
        kicker: 'C / 统一表征',
        name: '统一数值基础模型',
        short: '寻找表格与时间的共同语言。',
        summary: '探索能够同时表达表格结构与时间动态的数值表征，让不同数据形态之间的知识迁移成为可研究的问题。',
        focus: '跨形态表征 / 结构对齐 / 迁移假设',
        tasks: ['跨数据形态的表征迁移（研究方向）'],
        figure: '表格与时间序列的统一表征示意',
        note: '映射图为研究假设的合成示意，不代表已测量的性能。',
        interaction: '交互式映射图',
        details: [
          {title: '研究关注', body: '表格强调变量之间的横向关系，时序强调同一变量沿时间的纵向变化。统一表征需要同时保留这两类结构，而不是简单拼接。'},
          {title: '边界', body: '连线表示一种可检验的对应假设，不是模型已经发现的真实语义。统一模型仍在研究阶段。'},
        ],
        params: [
          {label: '输入', value: '表格列与时间通道'},
          {label: '输出', value: '共享表征空间'},
          {label: '当前阶段', value: '研究方向 / 合成示意'},
        ],
      },
    },
  },
  en: {
    eyebrow: 'Models',
    title: 'Numerical foundation models',
    intro: 'From tables to time series, and toward a unified representation. Three studies share one question: how a model reads numerical structure from context.',
    labels: {
      status: 'Status',
      version: 'Version',
      focus: 'Technical focus',
      tasks: 'Research tasks',
      resources: 'Developer entry',
      links: 'Public resources',
      pending: 'Pending',
      synthetic: 'Synthetic data illustration',
      docs: 'API Docs',
      playground: 'Playground',
      docsAction: 'Open the draft reference',
      playgroundAction: 'Open Playground',
      studyNotes: 'Model notes',
      closeNotes: 'Close notes',
      modelIndex: 'Model index',
      scrollHint: 'Scroll to read all three studies',
      notPublished: 'Not published',
      github: 'GitHub',
      huggingFace: 'Hugging Face',
    },
    unified: {
      tableSide: 'Table structure',
      seriesSide: 'Temporal dynamics',
      linkLabel: 'Shared representation',
      instruction: 'Hover or focus a mapping to compare table columns with temporal channels.',
      pair: 'Mapping pair',
    },
    resources: {
      title: 'From model study to developer entry',
      body: 'The API reference describes a draft contract. Playground requests remote Kumo inference through a separate same-origin endpoint; availability depends on the deployment.',
      docs: 'Read the API draft',
      playground: 'Open Playground',
    },
    studies: {
      tabular: {
        kicker: 'A / Tabular',
        name: 'Tabular Foundation Model',
        short: 'Learn context from rows and columns.',
        summary: 'Studies how labeled examples in the current table can reveal relationships across heterogeneous columns, and transfer to classification, regression and few-shot inference.',
        pageSummary: 'Exploring cross-table pretraining and in-context learning to understand feature relationships from a small set of labeled examples and adapt to prediction tasks across datasets.',
        focus: 'In-context learning / Heterogeneous features / Few-shot inference',
        tasks: ['Classification', 'Regression', 'Few-shot inference'],
        details: [
          {title: 'Research focus', body: 'Every table can be treated as its own context. The model needs to read relationships from column names, value distributions and a small set of labeled examples without updating its parameters.'},
          {title: 'Boundaries', body: 'Version, public weights and serving access are pending verification.'},
        ],
        params: [
          {label: 'Input', value: 'Numeric table with labeled and unlabeled rows'},
          {label: 'Reading', value: 'Compare samples within the current context'},
          {label: 'Stage', value: 'Research'},
        ],
      },
      'time-series': {
        kicker: 'B / Temporal',
        name: 'Time Series Foundation Model',
        short: 'Hold uncertainty while things change.',
        summary: 'Studies cycles, trends and anomalous shifts in sequences, and expresses a forecast as an interval rather than a single number.',
        pageSummary: 'Exploring cross-domain time series pretraining to learn trends, cycles and long-range dependencies, forecast future changes and characterize uncertainty.',
        focus: 'Long-range dependence / Forecast intervals / Anomalous shifts',
        tasks: ['Time series forecasting', 'Anomaly detection'],
        details: [
          {title: 'Research focus', body: 'A temporal model must handle short-term variation together with longer cycles. The forecast interval is a necessary expression of uncertainty, not decoration.'},
        ],
        params: [
          {label: 'Input', value: 'Ordered numeric sequence and temporal context'},
          {label: 'Output', value: 'Forecast path and uncertainty interval'},
          {label: 'Stage', value: 'Research'},
        ],
      },
      unified: {
        kicker: 'C / Unified',
        name: 'Unified Numerical Foundation Model',
        short: 'Find a shared language for tables and time.',
        summary: 'Explores numerical representations that can hold both table structure and temporal dynamics, making transfer across data forms a testable research question.',
        focus: 'Cross-form representation / Structural alignment / Transfer hypothesis',
        tasks: ['Representation transfer across data formats (research direction)'],
        figure: 'Illustration of a shared representation for tables and time series',
        note: 'The mapping is a synthetic illustration of a research hypothesis, not a measured performance result.',
        interaction: 'Interactive mapping',
        details: [
          {title: 'Research focus', body: 'Tables emphasize horizontal relationships between variables. Time series emphasize vertical change of one variable through time. A unified representation must preserve both kinds of structure, not simply concatenate them.'},
          {title: 'Boundaries', body: 'The connecting arcs express a testable correspondence hypothesis. They are not semantic relations the model has discovered. The unified model remains at research stage.'},
        ],
        params: [
          {label: 'Input', value: 'Table columns and temporal channels'},
          {label: 'Output', value: 'A shared representation space'},
          {label: 'Stage', value: 'Research direction / synthetic illustration'},
        ],
      },
    },
  },
};
